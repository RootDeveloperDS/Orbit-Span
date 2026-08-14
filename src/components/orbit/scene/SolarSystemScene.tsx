import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useCursor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { BODIES, type BodyId } from "@/lib/orbit/constants";
import type { SolarSystemState } from "@/lib/orbit/ephemeris";
import { layoutSolarSystem, type PlacedBody } from "@/lib/orbit/sceneLayout";
import {
  generateEarthCloudsTexture,
  generateSaturnRingTexture,
  getPlanetTexture,
} from "@/lib/orbit/textures";
import { useOrbitStore, type ViewMode } from "@/store/useOrbitStore";
import { usePlaybackClock, useSolarSystemState } from "@/hooks/useSolarSystemState";

function useReducedMotion(): boolean {
  const ref = useRef(false);
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    ref.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return ref.current;
}

/** 3D trajectory line for an orbit path computed from true ephemeris. */
function OrbitPathLine({
  points,
  dim,
}: {
  points: readonly { x: number; y: number; z: number }[];
  dim: boolean;
}) {
  const geometry = useMemo(() => {
    const threePoints = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    return new THREE.BufferGeometry().setFromPoints(threePoints);
  }, [points]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  if (!points || points.length === 0) return null;

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#7fb6d9" transparent opacity={dim ? 0.14 : 0.28} />
    </line>
  );
}

interface BodyProps {
  placed: PlacedBody;
  selected: boolean;
  showLabel: boolean;
  onSelect: (id: BodyId) => void;
  smooth: boolean;
}

function BodyMesh({ placed, selected, showLabel, onSelect, smooth }: BodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const target = useRef(new THREE.Vector3(placed.position.x, placed.position.y, placed.position.z));
  const meta = BODIES[placed.id];
  const isSun = placed.id === "sun";
  const isEarth = placed.id === "earth";
  const isSaturn = placed.id === "saturn";

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const handlePointerOver = (e: THREE.Event) => {
    e.stopPropagation();
    setHovered(true);
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  const texture = useMemo(() => getPlanetTexture(placed.id), [placed.id]);
  const cloudTexture = useMemo(() => (isEarth ? generateEarthCloudsTexture() : null), [isEarth]);
  const saturnRingTexture = useMemo(
    () => (isSaturn ? generateSaturnRingTexture() : null),
    [isSaturn],
  );

  target.current.set(placed.position.x, placed.position.y, placed.position.z);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (group) {
      if (!smooth) {
        group.position.copy(target.current);
      } else {
        group.position.lerp(target.current, Math.min(1, delta * 6));
      }
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.04;
    }
  });

  useEffect(() => {
    const group = groupRef.current;
    if (group) group.position.copy(target.current);
  }, []);

  return (
    <group ref={groupRef}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(placed.id);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[placed.radius, 32, 24]} />
        {isSun ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshStandardMaterial
            map={texture}
            color="#ffffff"
            roughness={0.65}
            metalness={0.05}
          />
        )}
      </mesh>

      {/* Earth Cloud Layer */}
      {isEarth && cloudTexture && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[placed.radius * 1.015, 32, 24]} />
          <meshStandardMaterial
            map={cloudTexture}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Saturn Ring System */}
      {isSaturn && saturnRingTexture && (
        <group rotation={[0.46, 0, 0]}>
          <mesh>
            <ringGeometry args={[placed.radius * 1.3, placed.radius * 2.3, 64]} />
            <meshStandardMaterial
              map={saturnRingTexture}
              transparent
              side={THREE.DoubleSide}
              roughness={0.8}
            />
          </mesh>
        </group>
      )}

      {/* Larger invisible hit area for touch targets */}
      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(placed.id);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[Math.max(placed.radius * 2.4, 0.35), 8, 6]} />
      </mesh>
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[placed.radius * 1.4, placed.radius * 1.55, 48]} />
          <meshBasicMaterial color="#8fd4ff" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
      {showLabel && (
        <Html
          center
          position={[0, placed.radius + 0.35, 0]}
          style={{ pointerEvents: "none" }}
          zIndexRange={[10, 0]}
        >
          <span
            className={`whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase ${
              selected ? "bg-primary/25 text-foreground" : "text-muted-foreground"
            }`}
          >
            {meta.name}
          </span>
        </Html>
      )}
    </group>
  );
}

function CameraRig({
  placedBodies,
  selectedBody,
  viewMode,
}: {
  placedBodies: PlacedBody[];
  selectedBody: BodyId;
  viewMode: ViewMode;
}) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  const prevSelected = useRef<BodyId | null>(null);
  const isFirstFrame = useRef(true);

  // Automatically fly camera directly to the selected body when focus changes
  useEffect(() => {
    const focus = placedBodies.find((b) => b.id === selectedBody);
    if (!focus) return;

    const c = controls.current;
    const focusDist =
      selectedBody === "sun"
        ? (viewMode === "scientific" ? 2.5 : 6.0)
        : Math.max(focus.radius * 4.5, viewMode === "scientific" ? 0.015 : 2.5);
    const offset = new THREE.Vector3(focusDist * 0.7, focusDist * 0.5, focusDist * 0.85);

    if (prevSelected.current !== selectedBody || isFirstFrame.current) {
      prevSelected.current = selectedBody;
      camera.position.set(
        focus.position.x + offset.x,
        focus.position.y + offset.y,
        focus.position.z + offset.z,
      );
      if (c) {
        c.target.set(focus.position.x, focus.position.y, focus.position.z);
        c.update();
      }
    }
  }, [camera, placedBodies, selectedBody, viewMode]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;
    const focus = placedBodies.find((b) => b.id === selectedBody);
    if (!focus) return;

    if (isFirstFrame.current) {
      isFirstFrame.current = false;
      const focusDist =
        selectedBody === "sun"
          ? (viewMode === "scientific" ? 2.5 : 6.0)
          : Math.max(focus.radius * 4.5, viewMode === "scientific" ? 0.015 : 2.5);
      const offset = new THREE.Vector3(focusDist * 0.7, focusDist * 0.5, focusDist * 0.85);
      camera.position.set(
        focus.position.x + offset.x,
        focus.position.y + offset.y,
        focus.position.z + offset.z,
      );
      c.target.set(focus.position.x, focus.position.y, focus.position.z);
      c.update();
    }

    // Adaptive camera near/far clipping so user can zoom infinitely close in Scientific mode
    if (camera instanceof THREE.PerspectiveCamera) {
      const minNear = Math.max(0.000005, focus.radius * 0.005);
      if (Math.abs(camera.near - minNear) > 0.000001) {
        camera.near = minNear;
        camera.far = viewMode === "scientific" ? 5000 : 2000;
        camera.updateProjectionMatrix();
      }
    }

    desired.current.set(focus.position.x, focus.position.y, focus.position.z);
    c.target.lerp(desired.current, Math.min(1, delta * 2.5));
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.00001}
      maxDistance={5000}
      makeDefault
    />
  );
}

function Starfield({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 400 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <points>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial color="#cfe4f5" size={1.4} sizeAttenuation transparent opacity={0.55} />
    </points>
  );
}

function SceneContents({ state }: { state: SolarSystemState }) {
  const viewMode = useOrbitStore((s) => s.viewMode);
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);
  const performanceMode = useOrbitStore((s) => s.performanceMode);
  const reducedMotion = useReducedMotion();

  const placed = useMemo(() => layoutSolarSystem(state, viewMode), [state, viewMode]);

  const adjusted = useMemo(() => {
    if (viewMode === "scientific") return placed;
    // Offset the Moon so it is visible next to Earth in the compressed layouts.
    const earth = placed.find((p) => p.id === "earth");
    const moon = placed.find((p) => p.id === "moon");
    if (!earth || !moon) return placed;
    const geo = state.bodies.moon.geoAu;
    const len = Math.hypot(geo.x, geo.y, geo.z) || 1;
    const offset = earth.radius * 3;
    const moonAdjusted: PlacedBody = {
      ...moon,
      position: {
        x: earth.position.x + (geo.x / len) * offset,
        y: earth.position.y + (geo.z / len) * offset,
        z: earth.position.z - (geo.y / len) * offset,
      },
      radius: Math.max(earth.radius * 0.32, 0.05),
      orbitRadius: 0,
      orbitPathPoints: [],
    };
    return placed.map((p) => (p.id === "moon" ? moonAdjusted : p));
  }, [placed, state, viewMode]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={performanceMode ? 250 : 500} distance={0} decay={1.2} />
      {!performanceMode && <Starfield count={1200} />}
      {adjusted
        .filter((p) => p.orbitPathPoints && p.orbitPathPoints.length > 0)
        .map((p) => (
          <OrbitPathLine
            key={`orbit-${p.id}`}
            points={p.orbitPathPoints}
            dim={viewMode === "scientific"}
          />
        ))}
      {adjusted.map((p) => (
        <BodyMesh
          key={p.id}
          placed={p}
          selected={p.id === selectedBody}
          showLabel={!performanceMode || p.id === selectedBody}
          onSelect={selectBody}
          smooth={!reducedMotion}
        />
      ))}
      <CameraRig placedBodies={adjusted} selectedBody={selectedBody} viewMode={viewMode} />
    </>
  );
}

/** Full-screen WebGL centrepiece. Rendered client-side only. */
export default function SolarSystemScene() {
  const performanceMode = useOrbitStore((s) => s.performanceMode);
  usePlaybackClock();
  const state = useSolarSystemState();

  return (
    <Canvas
      className="h-full w-full"
      dpr={performanceMode ? 1 : [1, 1.8]}
      gl={{ antialias: !performanceMode, powerPreference: "high-performance", logarithmicDepthBuffer: true }}
      camera={{ fov: 45, near: 0.00005, far: 5000, position: [18, 14, 24] }}
    >
      <SceneContents state={state} />
    </Canvas>
  );
}

