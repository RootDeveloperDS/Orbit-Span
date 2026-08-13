import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { BODIES, type BodyId } from "@/lib/orbit/constants";
import type { SolarSystemState } from "@/lib/orbit/ephemeris";
import { layoutSolarSystem, type PlacedBody } from "@/lib/orbit/sceneLayout";
import { useOrbitStore, type ViewMode } from "@/store/useOrbitStore";
import { usePlaybackClock, useSolarSystemState } from "@/hooks/useSolarSystemState";

const ORBIT_SEGMENTS = 128;

function useReducedMotion(): boolean {
  const ref = useRef(false);
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    ref.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return ref.current;
}

/** Static ring geometry for an orbit path; created once per radius. */
function OrbitRing({ radius, dim }: { radius: number; dim: boolean }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
      const a = (i / ORBIT_SEGMENTS) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#7fb6d9" transparent opacity={dim ? 0.12 : 0.22} />
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
  const target = useRef(new THREE.Vector3(placed.position.x, placed.position.y, placed.position.z));
  const meta = BODIES[placed.id];
  const isSun = placed.id === "sun";

  target.current.set(placed.position.x, placed.position.y, placed.position.z);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (!smooth) {
      group.position.copy(target.current);
      return;
    }
    // Interpolate between controlled astronomy samples; no React state per frame.
    group.position.lerp(target.current, Math.min(1, delta * 6));
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
      >
        <sphereGeometry args={[placed.radius, 24, 16]} />
        {isSun ? (
          <meshBasicMaterial color={meta.color} />
        ) : (
          <meshStandardMaterial
            color={meta.color}
            roughness={0.75}
            metalness={0.05}
            emissive={selected ? meta.color : "#000000"}
            emissiveIntensity={selected ? 0.35 : 0}
          />
        )}
      </mesh>
      {/* Larger invisible hit area for touch targets */}
      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(placed.id);
        }}
      >
        <sphereGeometry args={[Math.max(placed.radius * 2.4, 0.35), 8, 6]} />
      </mesh>
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[placed.radius * 1.7, placed.radius * 1.9, 48]} />
          <meshBasicMaterial color="#8fd4ff" transparent opacity={0.8} side={THREE.DoubleSide} />
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

  useEffect(() => {
    const dist = viewMode === "scientific" ? 90 : 34;
    camera.position.set(dist * 0.55, dist * 0.42, dist * 0.7);
  }, [camera, viewMode]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;
    const focus = placedBodies.find((b) => b.id === selectedBody);
    if (!focus) return;
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
      minDistance={1.5}
      maxDistance={400}
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
    };
    return placed.map((p) => (p.id === "moon" ? moonAdjusted : p));
  }, [placed, state, viewMode]);

  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight position={[0, 0, 0]} intensity={performanceMode ? 220 : 400} distance={0} decay={1.4} />
      {!performanceMode && <Starfield count={1200} />}
      {adjusted
        .filter((p) => p.orbitRadius > 0)
        .map((p) => (
          <OrbitRing key={`orbit-${p.id}`} radius={p.orbitRadius} dim={viewMode === "scientific"} />
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
      gl={{ antialias: !performanceMode, powerPreference: "high-performance" }}
      camera={{ fov: 45, near: 0.01, far: 2000, position: [18, 14, 24] }}
    >
      <SceneContents state={state} />
    </Canvas>
  );
}
