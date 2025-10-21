/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unknown-property */
import {
  Suspense,
  useRef,
  useLayoutEffect,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useFBX,
  Html,
  Environment,
  ContactShadows,
  Sphere,
  MeshDistortMaterial,
} from "@react-three/drei";
// Book modal is handled at page level
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

const isTouch =
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);
const deg2rad = (d) => (d * Math.PI) / 180;
const DECIDE = 8;
const ROTATE_SPEED = 0.005;
const INERTIA = 0.925;
const PARALLAX_MAG = 0.05;
const PARALLAX_EASE = 0.12;
const HOVER_MAG = deg2rad(6);
const HOVER_EASE = 0.15;

const Loader = ({ placeholderSrc }) => {
  return (
    <Html center>
      {placeholderSrc ? (
        <img
          src={placeholderSrc}
          alt="Loading placeholder"
          width={128}
          height={128}
          style={
            { filter: "blur(8px)", borderRadius: 8 }
          }
        />
      ) : (
        "Loading..."
      )}
    </Html>
  );
};

const DesktopControls = ({ pivot, min, max, zoomEnabled }) => {
  const ref = useRef(null);
  useFrame(() => ref.current?.target.copy(pivot));
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      enableRotate={false}
      enableZoom={zoomEnabled}
      minDistance={min}
      maxDistance={max}
    />
  );
};

// Light bulb component that can be toggled and moved
const LightBulb = ({ position, onChange, isOn = true }) => {
  const meshRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [lightPos, setLightPos] = useState(position);
  const { camera } = useThree();
  
  // Plane for dragging calculations
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const planeIntersectPoint = useMemo(() => new THREE.Vector3(), []);
  
  // Raycaster for drag operations
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  
  // Handle click to toggle light
  const handleClick = (e) => {
    e.stopPropagation();
    if (!dragging) {
      onChange?.({ isOn: !isOn, position: lightPos });
    }
  };
  
  // Handle drag to change light position
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setDragging(true);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };
  
  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    
    // Calculate mouse position in normalized device coordinates
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate the point of intersection with the plane
    if (raycaster.ray.intersectPlane(plane, planeIntersectPoint)) {
      // Update light position, but keep y position fixed
      const newPos = [
        planeIntersectPoint.x,
        lightPos[1],
        planeIntersectPoint.z
      ];
      setLightPos(newPos);
      onChange?.({ isOn, position: newPos });
    }
  }, [dragging, mouse, raycaster, camera, plane, planeIntersectPoint, lightPos, isOn, onChange]);
  
  const handlePointerUp = useCallback(() => {
    setDragging(false);
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);
  
  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);
  
  // Update position from props
  useEffect(() => {
    setLightPos(position);
  }, [position]);
  
  return (
    <group position={lightPos}>
      {/* Light bulb base */}
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        scale={hovered ? 1.1 : 1}
      >
        <cylinderGeometry args={[0.2, 0.3, 0.5, 16]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Light bulb glass */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshPhysicalMaterial 
          color={isOn ? "#FFFFE0" : "#CCCCCC"} 
          transparent={true} 
          opacity={0.9} 
          roughness={0.1} 
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>
      
      {/* Light source */}
      {isOn && (
        <pointLight 
          position={[0, 0.5, 0]} 
          intensity={1.5} 
          distance={10} 
          decay={2} 
          color="#FFFACD"
        />
      )}
      
      {/* Glow effect when light is on */}
      {isOn && (
        <Sphere args={[0.35, 16, 16]} position={[0, 0.5, 0]}>
          <MeshDistortMaterial
            color="#FFFFA0"
            emissive="#FFFFA0"
            emissiveIntensity={2}
            transparent
            opacity={0.4}
            distort={0.3}
            speed={2}
          />
        </Sphere>
      )}
      
      {/* Helper text */}
      <Html position={[0, 1.2, 0]} center>
        <div style={{ 
          color: 'white', 
          fontSize: '10px', 
          padding: '2px 5px', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          borderRadius: '3px',
          whiteSpace: 'nowrap'
        }}>
          {dragging ? "Drag to move" : (hovered ? (isOn ? "Click to turn off" : "Click to turn on") : "")}
        </div>
      </Html>
    </group>
  );
};

const ModelInner = ({
  url,
  xOff,
  yOff,
  pivot,
  initYaw,
  initPitch,
  minZoom,
  maxZoom,
  enableMouseParallax,
  enableManualRotation,
  enableHoverRotation,
  enableManualZoom,
  autoFrame,
  fadeIn,
  autoRotate,
  autoRotateSpeed,
  onLoaded,
  buildingAnimationProgress,
}) => {
  const outer = useRef(null);
  const inner = useRef(null);
  const { camera, gl } = useThree();

  const vel = useRef({ x: 0, y: 0 });
  const tPar = useRef({ x: 0, y: 0 });
  const cPar = useRef({ x: 0, y: 0 });
  const tHov = useRef({ x: 0, y: 0 });
  const cHov = useRef({ x: 0, y: 0 });

  const ext = useMemo(() => url.split(".").pop().toLowerCase(), [url]);
  const content = useMemo(() => {
    if (ext === "glb" || ext === "gltf") return useGLTF(url).scene.clone();
    if (ext === "fbx") return useFBX(url).clone();
    if (ext === "obj") return useLoader(OBJLoader, url).clone();
    console.error("Unsupported format:", ext);
    return null;
  }, [url, ext]);

  // Detect click on specific named meshes (e.g., book-logo)
  const handlePointerDown = useCallback((e) => {
    const target = e.object;
    if (target && (target.name === "book-logo" || target.parent?.name === "book-logo")) {
      e.stopPropagation();
      // Dispatch a custom event so parent can open modal
      window.dispatchEvent(new CustomEvent("openBookModal"));
    }
  }, []);

  const pivotW = useRef(new THREE.Vector3());
  useLayoutEffect(() => {
    if (!content) return;
    const g = inner.current;
    g.updateWorldMatrix(true, true);

    const sphere = new THREE.Box3()
      .setFromObject(g)
      .getBoundingSphere(new THREE.Sphere());
    const s = 1 / (sphere.radius * 2);
    g.position.set(-sphere.center.x, -sphere.center.y, -sphere.center.z);
    g.scale.setScalar(s);

    g.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (fadeIn) {
          o.material.transparent = true;
          o.material.opacity = 0;
        }
      }
    });

    // Store original positions for building animation
    const originalPositions = new Map();
    g.traverse((o) => {
      if (o.name === "building") {
        originalPositions.set(o, o.position.clone());
      }
    });

    g.getWorldPosition(pivotW.current);
    pivot.copy(pivotW.current);
    outer.current.rotation.set(initPitch, initYaw, 0);

    if (autoFrame && camera.isPerspectiveCamera) {
      const persp = camera;
      const fitR = sphere.radius * s;
      const d = (fitR * 1.2) / Math.sin((persp.fov * Math.PI) / 180 / 2);
      persp.position.set(
        pivotW.current.x,
        pivotW.current.y,
        pivotW.current.z + d
      );
      persp.near = d / 10;
      persp.far = d * 10;
      persp.updateProjectionMatrix();
    }

    if (fadeIn) {
      let t = 0;
      const id = setInterval(() => {
        t += 0.05;
        const v = Math.min(t, 1);
        g.traverse((o) => {
          if (o.isMesh) o.material.opacity = v;
        });
        if (v === 1) {
          clearInterval(id);
          onLoaded?.();
        }
      }, 16);
      return () => clearInterval(id);
    } else onLoaded?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Building animation effect
  useEffect(() => {
    if (!inner.current) return;
    
    inner.current.traverse((o) => {
      if (o.name === "building") {
        const originalY = o.userData.originalY ?? o.position.y;
        o.userData.originalY = originalY;
        o.position.y = originalY + (buildingAnimationProgress * 1); // Increased from 3 to 5 units
      }
    });
  }, [buildingAnimationProgress]);

  useEffect(() => {
    if (!enableManualRotation || isTouch) return;
    const el = gl.domElement;
    let drag = false;
    let lx = 0,
      ly = 0;
    const down = (e) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      drag = true;
      lx = e.clientX;
      ly = e.clientY;
      window.addEventListener("pointerup", up);
    };
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      outer.current.rotation.y += dx * ROTATE_SPEED;
      outer.current.rotation.x += dy * ROTATE_SPEED;
      vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
    };
    const up = () => (drag = false);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [gl, enableManualRotation]);

  useEffect(() => {
    if (!isTouch) return;
    const el = gl.domElement;
    const pts = new Map();

    let mode = "idle";
    let sx = 0,
      sy = 0,
      lx = 0,
      ly = 0,
      startDist = 0,
      startZ = 0;

    const down = (e) => {
      if (e.pointerType !== "touch") return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        mode = "decide";
        sx = lx = e.clientX;
        sy = ly = e.clientY;
      } else if (pts.size === 2 && enableManualZoom) {
        mode = "pinch";
        const [p1, p2] = [...pts.values()];
        startDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        startZ = camera.position.z;
        e.preventDefault();
      }
    };

    const move = (e) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX;
      p.y = e.clientY;

      if (mode === "decide") {
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        if (Math.abs(dx) > DECIDE || Math.abs(dy) > DECIDE) {
          if (enableManualRotation && Math.abs(dx) > Math.abs(dy)) {
            mode = "rotate";
            el.setPointerCapture(e.pointerId);
          } else {
            mode = "idle";
            pts.clear();
          }
        }
      }

      if (mode === "rotate") {
        e.preventDefault();
        const dx = e.clientX - lx;
        const dy = e.clientY - ly;
        lx = e.clientX;
        ly = e.clientY;
        outer.current.rotation.y += dx * ROTATE_SPEED;
        outer.current.rotation.x += dy * ROTATE_SPEED;
        vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
      } else if (mode === "pinch" && pts.size === 2) {
        e.preventDefault();
        const [p1, p2] = [...pts.values()];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const ratio = startDist / d;
        camera.position.z = THREE.MathUtils.clamp(
          startZ * ratio,
          minZoom,
          maxZoom
        );
      }
    };

    const up = (e) => {
      pts.delete(e.pointerId);
      if (mode === "rotate" && pts.size === 0) mode = "idle";
      if (mode === "pinch" && pts.size < 2) mode = "idle";
    };

    el.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, enableManualRotation, enableManualZoom, minZoom, maxZoom]);

  useEffect(() => {
    if (isTouch) return;
    const mm = (e) => {
      if (e.pointerType !== "mouse") return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (enableMouseParallax)
        tPar.current = { x: -nx * PARALLAX_MAG, y: -ny * PARALLAX_MAG };
      if (enableHoverRotation)
        tHov.current = { x: ny * HOVER_MAG, y: nx * HOVER_MAG };
    };
    window.addEventListener("pointermove", mm);
    return () => window.removeEventListener("pointermove", mm);
  }, [enableMouseParallax, enableHoverRotation]);

  useFrame((_, dt) => {
    let need = false;
    cPar.current.x += (tPar.current.x - cPar.current.x) * PARALLAX_EASE;
    cPar.current.y += (tPar.current.y - cPar.current.y) * PARALLAX_EASE;
    const phx = cHov.current.x,
      phy = cHov.current.y;
    cHov.current.x += (tHov.current.x - cHov.current.x) * HOVER_EASE;
    cHov.current.y += (tHov.current.y - cHov.current.y) * HOVER_EASE;

    const ndc = pivotW.current.clone().project(camera);
    ndc.x += xOff + cPar.current.x;
    ndc.y += yOff + cPar.current.y;
    outer.current.position.copy(ndc.unproject(camera));

    outer.current.rotation.x += cHov.current.x - phx;
    outer.current.rotation.y += cHov.current.y - phy;

    if (autoRotate) {
      outer.current.rotation.y += autoRotateSpeed * dt;
      need = true;
    }

    outer.current.rotation.y += vel.current.x;
    outer.current.rotation.x += vel.current.y;
    vel.current.x *= INERTIA;
    vel.current.y *= INERTIA;
    if (Math.abs(vel.current.x) > 1e-4 || Math.abs(vel.current.y) > 1e-4)
      need = true;

    if (
      Math.abs(cPar.current.x - tPar.current.x) > 1e-4 ||
      Math.abs(cPar.current.y - tPar.current.y) > 1e-4 ||
      Math.abs(cHov.current.x - tHov.current.x) > 1e-4 ||
      Math.abs(cHov.current.y - tHov.current.y) > 1e-4
    )
      need = true;

    return need;
  });

  if (!content) return null;
  return (
    <group ref={outer}>
      <group ref={inner} onPointerDown={handlePointerDown}>
        <primitive object={content} />
      </group>
    </group>
  );
};

const ModelViewer = ({
  url,
  width = 400,
  height = 400,
  modelXOffset = 0,
  modelYOffset = 0,
  defaultRotationX = -50,
  defaultRotationY = 20,
  defaultZoom = 0.5,
  minZoomDistance = 0.5,
  maxZoomDistance = 10,
  enableMouseParallax = true,
  enableManualRotation = true,
  enableHoverRotation = true,
  enableManualZoom = true,
  ambientIntensity = 0.3,
  environmentPreset = "none",
  autoFrame = false,
  placeholderSrc,
  showScreenshotButton = true,
  showLightBulb = false,
  fadeIn = false,
  autoRotate = false,
  autoRotateSpeed = 0.35,
  onModelLoaded,
  moonLightPosition = null,
  moonLightStrength = 15,
  onBuildingAnimation,
}) => {
  useEffect(() => void useGLTF.preload(url), [url]);
  const pivot = useRef(new THREE.Vector3()).current;
  const contactRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  
  // State for light bulb (kept for compatibility)
  const [lightBulbState, setLightBulbState] = useState({
    isOn: true,
    position: [3, 2, 3]
  });

  // State for building animation
  const [isBuildingOpen, setIsBuildingOpen] = useState(false);
  const [buildingAnimationProgress, setBuildingAnimationProgress] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const initYaw = deg2rad(defaultRotationX);
  const initPitch = deg2rad(defaultRotationY);
  const camZ = Math.min(
    Math.max(defaultZoom, minZoomDistance),
    maxZoomDistance
  );

  const capture = () => {
    const g = rendererRef.current,
      s = sceneRef.current,
      c = cameraRef.current;
    if (!g || !s || !c) return;
    g.shadowMap.enabled = false;
    const tmp = [];
    s.traverse((o) => {
      if (o.isLight && "castShadow" in o) {
        tmp.push({ l: o, cast: o.castShadow });
        o.castShadow = false;
      }
    });
    if (contactRef.current) contactRef.current.visible = false;
    g.render(s, c);
    const urlPNG = g.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.download = "model.png";
    a.href = urlPNG;
    a.click();
    g.shadowMap.enabled = true;
    tmp.forEach(({ l, cast }) => (l.castShadow = cast));
    if (contactRef.current) contactRef.current.visible = true;
  };
  
  // Handle light bulb changes (kept for compatibility)
  const handleLightBulbChange = (newState) => {
    setLightBulbState(newState);
  };

  // Handle building animation toggle
  const handleBuildingToggle = useCallback(() => {
    setIsBuildingOpen(prev => !prev);
    setIsShaking(true);
    
    // Trigger page shaking
    if (onBuildingAnimation) {
      onBuildingAnimation();
    }
    
    // Stop shaking after animation completes
    setTimeout(() => {
      setIsShaking(false);
    }, 240); // 3 times longer than building animation
  }, [onBuildingAnimation]);

  // Book modal is handled at page level

  // Animation effect for smooth building movement
  useEffect(() => {
    const targetProgress = isBuildingOpen ? 1 : 0;
    const startProgress = buildingAnimationProgress;
    const startTime = Date.now();
    const duration = 80; // 0.4 second animation (faster)

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentProgress = startProgress + (targetProgress - startProgress) * easedProgress;
      setBuildingAnimationProgress(currentProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isBuildingOpen, buildingAnimationProgress]);

  return (
    <div
      style={{
        width,
        height,
        touchAction: "pan-y pinch-zoom",
        position: "relative",
        animation: isShaking ? "shake 0.24s ease-in-out" : "none",
      }}
    >
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10% { transform: translateX(-2px) translateY(-1px); }
            20% { transform: translateX(2px) translateY(1px); }
            30% { transform: translateX(-1px) translateY(-2px); }
            40% { transform: translateX(1px) translateY(2px); }
            50% { transform: translateX(-2px) translateY(-1px); }
            60% { transform: translateX(2px) translateY(1px); }
            70% { transform: translateX(-1px) translateY(-2px); }
            80% { transform: translateX(1px) translateY(2px); }
            90% { transform: translateX(-1px) translateY(-1px); }
          }
        `}
      </style>
      {showScreenshotButton && (
        <button
          onClick={capture}
          style={{
            position: "absolute",
            border: "1px solid #fff",
            right: 16,
            top: 16,
            zIndex: 10,
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: 10,
            backgroundColor: "rgba(0,0,0,0.5)",
            color: "#fff",
          }}
        >
          Take Screenshot
        </button>
      )}

      {/* Open Button */}
      <button
        onClick={handleBuildingToggle}
        style={{
          position: "absolute",
          border: "1px solid #fff",
          right: 16,
          top: showScreenshotButton ? 60 : 16,
          zIndex: 10,
          cursor: "pointer",
          padding: "8px 16px",
          borderRadius: 10,
          backgroundColor: isBuildingOpen ? "rgba(255,193,7,0.8)" : "rgba(0,0,0,0.5)",
          color: "#fff",
          fontWeight: "bold",
          transition: "all 0.3s ease",
        }}
      >
        {isBuildingOpen ? "Close" : "Open"}
      </button>

      {null}

      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl, scene, camera }) => {
          rendererRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        camera={{ fov: 50, position: [0, 0, camZ], near: 0.01, far: 100 }}
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        {environmentPreset !== "none" && (
          <Environment preset={environmentPreset} background={false} />
        )}

        <ambientLight intensity={ambientIntensity} />
        
        {/* Moon-controlled lighting only */}
        {moonLightPosition ? (
          <>
            <directionalLight
              position={moonLightPosition}
              intensity={moonLightStrength}
              castShadow
              color="#ffe1a6"
            />
            <directionalLight
              position={[moonLightPosition[0] * -0.3, moonLightPosition[1] * 0.9, moonLightPosition[2] * -0.3]}
              intensity={moonLightStrength * 0.3}
              color="#ffe1a6"
            />
          </>
        ) : (
          /* Fallback lighting when no moon position */
          <directionalLight
            position={[3, 4, 3]}
            intensity={moonLightStrength}
            castShadow
            color="#ffe1a6"
          />
        )}

        <ContactShadows
          ref={contactRef}
          position={[0, -0.5, 0]}
          opacity={0.35}
          scale={10}
          blur={2}
        />

        <Suspense fallback={<Loader placeholderSrc={placeholderSrc} />}>
          <ModelInner
            url={url}
            xOff={modelXOffset}
            yOff={modelYOffset}
            pivot={pivot}
            initYaw={initYaw}
            initPitch={initPitch}
            minZoom={minZoomDistance}
            maxZoom={maxZoomDistance}
            enableMouseParallax={enableMouseParallax}
            enableManualRotation={enableManualRotation}
            enableHoverRotation={enableHoverRotation}
            enableManualZoom={enableManualZoom}
            autoFrame={autoFrame}
            fadeIn={fadeIn}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            onLoaded={onModelLoaded}
            buildingAnimationProgress={buildingAnimationProgress}
          />
          
          {/* Interactive light bulb */}
          {showLightBulb && (
            <LightBulb 
              position={lightBulbState.position}
              isOn={lightBulbState.isOn}
              onChange={handleLightBulbChange}
            />
          )}
        </Suspense>

        <DesktopControls
          pivot={pivot}
          min={minZoomDistance}
          max={maxZoomDistance}
          zoomEnabled={enableManualZoom}
        />
      </Canvas>
    </div>
  );
};

export default ModelViewer; 