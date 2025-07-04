import { useRef, useEffect, useCallback, useState } from "react";
import "./ClickSpark.css";

const ClickSpark = ({
  sparkColor = "#fff",      // Color of the sparks
  sparkSize = 10,           // Size of each spark line (increase for longer lines)
  sparkRadius = 15,         // How far the sparks travel from click point (increase for wider effect)
  sparkCount = 8,           // Number of sparks in the burst (increase for denser effect)
  duration = 400,           // How long the animation lasts in ms (increase for slower effect)
  easing = "ease-out",      // Animation easing function
  extraScale = 1.0,         // Additional scaling factor for the effect (increase for larger overall effect)
  performanceMode = true,   // When true, reduces GPU usage by optimizing rendering
  children
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);     
  const startTimeRef = useRef(null);
  const animationIdRef = useRef(null);
  const isPageVisibleRef = useRef(true);
  const [isActive, setIsActive] = useState(false);

  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout;

    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);

    resizeCanvas();

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = document.visibilityState === 'visible';
      
      // If page becomes visible again and we have sparks, restart animation
      if (isPageVisibleRef.current && sparksRef.current.length > 0 && !animationIdRef.current) {
        startAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const easeFunc = useCallback(
    (t) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  // Start animation function
  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let lastFrameTime = 0;
    const targetFPS = performanceMode ? 30 : 60; // Lower FPS in performance mode
    const frameInterval = 1000 / targetFPS;

    const draw = (timestamp) => {
      // Skip frames in performance mode
      const deltaTime = timestamp - lastFrameTime;
      if (performanceMode && deltaTime < frameInterval) {
        animationIdRef.current = requestAnimationFrame(draw);
        return;
      }
      
      lastFrameTime = timestamp;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // If page is not visible or no sparks, don't render
      if (!isPageVisibleRef.current || sparksRef.current.length === 0) {
        animationIdRef.current = null;
        setIsActive(false);
        return;
      }

      // Process and render sparks
      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);
        const opacity = 1 - eased;
        const width = 2 * (1 - eased * 0.5);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        // Create gradient for each spark (only in high quality mode)
        if (!performanceMode) {
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, `${spark.color}ff`);
          gradient.addColorStop(1, `${spark.color}00`);
          ctx.strokeStyle = gradient;
        } else {
          // Use solid color in performance mode
          ctx.strokeStyle = spark.color;
        }
        
        ctx.globalAlpha = opacity;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        return true;
      });

      // Continue animation only if there are sparks
      if (sparksRef.current.length > 0) {
        animationIdRef.current = requestAnimationFrame(draw);
      } else {
        animationIdRef.current = null;
        setIsActive(false);
      }
    };

    animationIdRef.current = requestAnimationFrame(draw);
  }, [duration, easeFunc, extraScale, sparkRadius, sparkSize, performanceMode]);

  // Handle clicks
  const handleClick = (e) => {
    // Skip if in performance mode and already have active sparks
    if (performanceMode && sparksRef.current.length > 20) {
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Generate a range of colors from white to light blue to purple
    const colors = [
      "#ffffff", // White
      "#e0f7ff", // Light blue
      "#c9e9ff", // Lighter blue
      "#b5d9ff", // Light blue
      "#a2c4ff", // Blue
      "#8e8edd", // Blue-purple
      "#7b7dca", // Purple
    ];

    const now = performance.now();
    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    sparksRef.current.push(...newSparks);
    
    // Start animation if not already running
    if (!animationIdRef.current) {
      setIsActive(true);
      startAnimation();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className={`click-spark-canvas ${isActive ? 'active' : ''}`}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          userSelect: "none",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none"
        }}
      />
      {children}
    </div>
  );
};

export default ClickSpark; 