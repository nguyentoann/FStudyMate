/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unknown-property */
import {
  Suspense,
  useRef,
  useLayoutEffect,
  useEffect,
  useMemo,
  useState,
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
  useTexture,
  PerspectiveCamera,
} from "@react-three/drei";
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
  const planeNormal = useMemo(() => new THREE.Vector3(0, 1, 0), []);
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
  
  const handlePointerMove = (e) => {
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
  };
  
  const handlePointerUp = () => {
    setDragging(false);
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  };
  
  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);
  
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
      <group ref={inner}>
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
  keyLightIntensity = 1,
  fillLightIntensity = 0.5,
  rimLightIntensity = 0.8,
  environmentPreset = "forest",
  autoFrame = false,
  placeholderSrc,
  showScreenshotButton = true,
  showLightBulb = false,
  fadeIn = false,
  autoRotate = false,
  autoRotateSpeed = 0.35,
  onModelLoaded,
}) => {
  useEffect(() => void useGLTF.preload(url), [url]);
  const pivot = useRef(new THREE.Vector3()).current;
  const contactRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  
  // State for light bulb
  const [lightBulbState, setLightBulbState] = useState({
    isOn: true,
    position: [3, 2, 3]
  });
  
  // State for light settings
  const [lightSettings, setLightSettings] = useState({
    ambient: ambientIntensity,
    key: keyLightIntensity,
    fill: fillLightIntensity,
    rim: rimLightIntensity
  });

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
  
  // Handle light bulb changes
  const handleLightBulbChange = (newState) => {
    setLightBulbState(newState);
    
    // Adjust light settings based on light bulb state
    if (!newState.isOn) {
      setLightSettings({
        ...lightSettings,
        key: 0.2,
        fill: 0.1,
        rim: 0.1
      });
    } else {
      setLightSettings({
        ...lightSettings,
        key: keyLightIntensity,
        fill: fillLightIntensity,
        rim: rimLightIntensity
      });
    }
  };

  return (
    <div
      style={{
        width,
        height,
        touchAction: "pan-y pinch-zoom",
        position: "relative",
      }}
    >
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

        <ambientLight intensity={lightSettings.ambient} />
        
        {/* Main directional lights */}
        {!showLightBulb && (
          <>
            <directionalLight
              position={[5, 5, 5]}
              intensity={lightSettings.key}
              castShadow
            />
            <directionalLight
              position={[-5, 2, 5]}
              intensity={lightSettings.fill}
            />
            <directionalLight 
              position={[0, 4, -5]} 
              intensity={lightSettings.rim} 
            />
          </>
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