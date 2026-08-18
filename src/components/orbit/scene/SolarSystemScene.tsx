import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useCursor } from "@react-three/drei";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { BODIES, type BodyId } from "@/lib/orbit/constants";
import type { SolarSystemState } from "@/lib/orbit/ephemeris";
import {
  computeRelativeMoonOrbitPath,
  computeOrbitPaths,
  focusDistance,
  layoutSolarSystem,
  type LayoutMode,
  type PlacedBody,
} from "@/lib/orbit/sceneLayout";
import {
  generateEarthCloudsTexture,
  generateSaturnRingTexture,
  getPlanetTexture,
} from "@/lib/orbit/textures";
import { useOrbitStore, type ViewMode } from "@/store/useOrbitStore";
import { usePlaybackClock, useSolarSystemState } from "@/hooks/useSolarSystemState";

/** Stable 3D trajectory line that does not thrash WebGL buffers on every tick. */
const StableOrbitLine = React.memo(function StableOrbitLine({
  points,
  dim,
  isMoon,
}: {
  points: readonly { x: number; y: number; z: number }[];
  dim: boolean;
  isMoon?: boolean;
}) {
  const geometry = useMemo(() => {
    if (!points || points.length === 0) return null;
    const threePoints = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    return new THREE.BufferGeometry().setFromPoints(threePoints);
  }, [points]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  if (!geometry) return null;

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial
        color={isMoon ? "#9ac7f7" : "#7fb6d9"}
        transparent
        opacity={isMoon ? (dim ? 0.35 : 0.45) : dim ? 0.16 : 0.28}
      />
    </line>
  );
});

/** Lunar orbit ring positioned directly at Earth's dynamic location. */
function LunarOrbitRing({
  viewMode,
  earthPositionRef,
  earthRadius,
  orbitEpochMs,
}: {
  viewMode: LayoutMode;
  earthPositionRef: React.RefObject<THREE.Vector3>;
  earthRadius: number;
  orbitEpochMs: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const points = useMemo(() => {
    return computeRelativeMoonOrbitPath(viewMode, earthRadius, orbitEpochMs);
  }, [viewMode, earthRadius, orbitEpochMs]);

  useFrame(() => {
    if (groupRef.current && earthPositionRef.current) {
      groupRef.current.position.copy(earthPositionRef.current);
    }
  });

  return (
    <group ref={groupRef}>
      <StableOrbitLine points={points} dim={viewMode === "scientific"} isMoon={true} />
    </group>
  );
}

interface BodyProps {
  placed: PlacedBody;
  selected: boolean;
  showLabel: boolean;
  onSelect: (id: BodyId) => void;
  viewMode: ViewMode;
  trueScaleUniverse: boolean;
  /**
   * A stable ref that receives a THREE.Vector3 with the body's live scene position.
   * Updated every useFrame — no React re-render triggered.
   */
  livePositionRef?: React.RefObject<THREE.Vector3>;
}

const BodyMesh = React.memo(function BodyMesh({
  placed,
  selected,
  showLabel,
  onSelect,
  viewMode,
  trueScaleUniverse,
  livePositionRef,
}: BodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  // Keep a mutable target that never triggers re-renders
  const target = useRef(new THREE.Vector3(placed.position.x, placed.position.y, placed.position.z));
  const meta = BODIES[placed.id];
  const isSun = placed.id === "sun";
  const isEarth = placed.id === "earth";
  const isSaturn = placed.id === "saturn";

  const [hovered, setHovered] = useState(false);
  const [isCloseUp, setIsCloseUp] = useState(false);
  useCursor(hovered);

  const handlePointerOver = useCallback((e: THREE.Event) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
  }, []);

  const texture = useMemo(() => getPlanetTexture(placed.id), [placed.id]);
  const cloudTexture = useMemo(() => (isEarth ? generateEarthCloudsTexture() : null), [isEarth]);
  const saturnRingTexture = useMemo(
    () => (isSaturn ? generateSaturnRingTexture() : null),
    [isSaturn],
  );

  // Synchronously update the lerp target — no setState, no re-render.
  target.current.set(placed.position.x, placed.position.y, placed.position.z);

  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    if (group) {
      // Smooth live-clock samples between ephemeris updates without forcing React/WebGL work per frame.
      group.position.lerp(target.current, 1 - Math.exp(-14 * delta));

      // Expose live position to other scene objects (e.g. LunarOrbitRing) via ref.
      if (livePositionRef) {
        livePositionRef.current?.copy(group.position);
      }

      // Check distance to camera for smart non-intrusive label behavior
      const dist = camera.position.distanceTo(group.position);
      const close = dist < placed.radius * 7.5;
      if (close !== isCloseUp) {
        setIsCloseUp(close);
      }
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.04;
    }
  });

  useEffect(() => {
    const group = groupRef.current;
    if (group) {
      group.position.copy(target.current);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Position label cleanly above the body
  const labelOffsetY =
    viewMode === "scientific"
      ? trueScaleUniverse
        ? placed.radius * (isCloseUp ? 1.6 : 1.35) + 0.00004
        : placed.radius + 0.03
      : placed.radius + 0.35;

  const hitSphereRadius =
    viewMode === "scientific"
      ? trueScaleUniverse
        ? Math.max(placed.radius * 1.5, 0.00008)
        : Math.max(placed.radius * 2.0, 0.02)
      : Math.max(placed.radius * 2.4, 0.35);

  return (
    <group ref={groupRef}>
      {/* Central Planet Sphere */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(placed.id);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[placed.radius, 48, 36]} />
        {isSun ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshStandardMaterial
            map={texture}
            color="#ffffff"
            roughness={0.7}
            metalness={0.05}
          />
        )}
      </mesh>

      {/* Sun Radiant Glow Halo */}
      {isSun && (
        <mesh>
          <sphereGeometry args={[placed.radius * 1.04, 32, 24]} />
          <meshBasicMaterial
            color="#ffdd88"
            transparent
            opacity={0.35}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Earth Cloud Layer */}
      {isEarth && cloudTexture && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[placed.radius * 1.015, 48, 36]} />
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
        <group rotation={[0.466, 0, 0]}>
          <mesh>
            <ringGeometry args={[placed.radius * 1.28, placed.radius * 2.35, 96]} />
            <meshStandardMaterial
              map={saturnRingTexture}
              transparent
              side={THREE.DoubleSide}
              roughness={0.8}
            />
          </mesh>
        </group>
      )}

      {/* Touch / Click hit target */}
      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(placed.id);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[hitSphereRadius, 12, 8]} />
      </mesh>

      {/* Selection Ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[placed.radius * 1.35, placed.radius * 1.48, 64]} />
          <meshBasicMaterial color="#8fd4ff" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Smart, Non-Obtrusive 3D Spatial Name Label */}
      {showLabel && (
        <Html
          center
          position={[0, labelOffsetY, 0]}
          style={{ pointerEvents: "auto" }}
          zIndexRange={[10, 0]}
        >
          <div
            className={`transition-all duration-200 ${
              isCloseUp && !hovered && !selected
                ? "opacity-20 hover:opacity-100"
                : isCloseUp && selected && !hovered
                  ? "opacity-60 hover:opacity-100"
                  : "opacity-100"
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(placed.id);
              }}
              className={`cursor-pointer select-none whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] tracking-[0.12em] uppercase transition-all duration-150 shadow-sm ${
                selected
                  ? "border border-primary/70 bg-primary/40 text-foreground shadow-primary/30"
                  : hovered
                    ? "border border-foreground/40 bg-background/90 text-foreground"
                    : "border border-border/40 bg-background/50 text-muted-foreground backdrop-blur-[2px] hover:text-foreground"
              }`}
              title={`Select and zoom to ${meta.name}`}
            >
              {meta.name}
            </button>
          </div>
        </Html>
      )}
    </group>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// CameraRig — KEY FIX:
//   placedBodies is stored in a ref so its identity changes (every 125ms during
//   playback) do NOT trigger the position-snap useEffect.
//   The snap fires ONLY when selectedBody / viewMode / trueScaleUniverse change.
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig({
  placedBodies,
  selectedBody,
  viewMode,
  trueScaleUniverse,
}: {
  placedBodies: PlacedBody[];
  selectedBody: BodyId;
  viewMode: ViewMode;
  trueScaleUniverse: boolean;
}) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const prevSelected = useRef<BodyId | null>(null);
  const desiredFocusPos = useRef(new THREE.Vector3());
  const smoothedFocusPos = useRef(new THREE.Vector3());
  const focusStep = useRef(new THREE.Vector3());
  const isFirstFrame = useRef(true);

  // *** THE FIX: store placedBodies in a ref — updated synchronously on every
  // render but NEVER listed as a useEffect dependency, so position updates
  // during playback (every 125ms) do NOT re-trigger the camera snap. ***
  const placedRef = useRef(placedBodies);
  placedRef.current = placedBodies;

  // Snap camera ONLY when the selected body or view mode changes.
  useEffect(() => {
    const focus = placedRef.current.find((b) => b.id === selectedBody);
    if (!focus) return;

    const c = controls.current;
    const focusDist = focusDistance(focus, viewMode, trueScaleUniverse);
    const offset = new THREE.Vector3(focusDist * 0.7, focusDist * 0.5, focusDist * 0.85);

    if (prevSelected.current !== selectedBody || isFirstFrame.current) {
      prevSelected.current = selectedBody;
      isFirstFrame.current = false;

      camera.position.set(
        focus.position.x + offset.x,
        focus.position.y + offset.y,
        focus.position.z + offset.z,
      );

      if (c) {
        c.target.set(focus.position.x, focus.position.y, focus.position.z);
        c.minDistance = Math.max(1e-7, focus.radius * 1.05);
        c.maxDistance = 10000;
        c.update();
      }

      desiredFocusPos.current.set(focus.position.x, focus.position.y, focus.position.z);
      smoothedFocusPos.current.copy(desiredFocusPos.current);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.near = Math.max(1e-7, focus.radius * 0.01);
        camera.far = viewMode === "scientific" ? 20000 : 2000;
        camera.updateProjectionMatrix();
      }
    }
  // placedBodies intentionally NOT listed — we read from placedRef.current instead.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, selectedBody, viewMode, trueScaleUniverse]);

  // Frame update: dynamically track planet movement during simulation time playback.
  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;
    // Read live positions from ref — no re-render cost.
    const focus = placedRef.current.find((b) => b.id === selectedBody);
    if (!focus) return;

    desiredFocusPos.current.set(focus.position.x, focus.position.y, focus.position.z);
    focusStep.current
      .subVectors(desiredFocusPos.current, smoothedFocusPos.current)
      .multiplyScalar(1 - Math.exp(-14 * delta));

    // Follow the same eased position stream as the bodies.
    if (focusStep.current.lengthSq() > 1e-12) {
      camera.position.add(focusStep.current);
      c.target.add(focusStep.current);
      smoothedFocusPos.current.add(focusStep.current);
      c.update();
    }

    // Dynamic precision near clipping check
    if (camera instanceof THREE.PerspectiveCamera) {
      const minNear = Math.max(1e-7, focus.radius * 0.01);
      if (Math.abs(camera.near - minNear) > 1e-8) {
        camera.near = minNear;
        camera.updateProjectionMatrix();
      }
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.0000001}
      maxDistance={10000}
      makeDefault
    />
  );
}

function Starfield({ count }: { count: number }) {
  const { geometry } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);

    const palette = [
      new THREE.Color("#d8ecf8"), // Blue-white
      new THREE.Color("#ffffff"), // White
      new THREE.Color("#fff2cc"), // Warm yellow
      new THREE.Color("#ffd2a1"), // Amber
    ];

    for (let i = 0; i < count; i++) {
      const r = 500 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const color = palette[Math.floor(Math.random() * palette.length)]!;
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
    return { geometry: g };
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <points>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        size={1.6}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.65}
      />
    </points>
  );
}

function SceneContents({ state }: { state: SolarSystemState }) {
  const viewMode = useOrbitStore((s) => s.viewMode);
  const trueScaleUniverse = useOrbitStore((s) => s.trueScaleUniverse);
  const showLabels = useOrbitStore((s) => s.showLabels);
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);
  const performanceMode = useOrbitStore((s) => s.performanceMode);
  const playbackRate = useOrbitStore((s) => s.playbackRate);
  const [orbitEpochMs, setOrbitEpochMs] = useState(state.epochMs);
  const lastOrbitMode = useRef(viewMode);

  // Orbit lines are static geometry while playback runs.  Rebuild them once
  // after a paused/manual date change or a view-mode change—not every tick.
  useEffect(() => {
    if (lastOrbitMode.current !== viewMode || playbackRate === 0) {
      lastOrbitMode.current = viewMode;
      setOrbitEpochMs((current) => (current === state.epochMs ? current : state.epochMs));
    }
  }, [playbackRate, state.epochMs, viewMode]);

  const orbitPaths = useMemo(
    () => computeOrbitPaths(viewMode, orbitEpochMs),
    [orbitEpochMs, viewMode],
  );

  const placed = useMemo(
    () => layoutSolarSystem(state, viewMode, trueScaleUniverse, orbitPaths),
    [orbitPaths, state, viewMode, trueScaleUniverse],
  );

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
      orbitRadius: offset,
      orbitPathPoints: [],
    };
    return placed.map((p) => (p.id === "moon" ? moonAdjusted : p));
  }, [placed, state, viewMode]);

  const earthPlaced = adjusted.find((p) => p.id === "earth");

  // A stable Vector3 ref that Earth's BodyMesh writes to every frame.
  // LunarOrbitRing reads from it in its own useFrame — zero React overhead.
  const earthLivePosRef = useRef(
    new THREE.Vector3(
      earthPlaced?.position.x ?? 0,
      earthPlaced?.position.y ?? 0,
      earthPlaced?.position.z ?? 0,
    ),
  );

  // Filter planetary orbit lines (excluding moon, handled separately)
  const planetOrbits = useMemo(() => {
    return adjusted.filter((p) => p.id !== "moon" && p.orbitPathPoints && p.orbitPathPoints.length > 0);
  }, [adjusted]);

  return (
    <>
      <ambientLight intensity={viewMode === "scientific" ? 0.15 : 0.35} />
      <pointLight
        position={[0, 0, 0]}
        intensity={performanceMode ? 250 : 600}
        distance={0}
        decay={viewMode === "scientific" ? 1.0 : 1.2}
      />
      {!performanceMode && <Starfield count={1500} />}

      {/* Planetary Orbit Trajectories */}
      {planetOrbits.map((p) => (
        <StableOrbitLine
          key={`orbit-${p.id}`}
          points={p.orbitPathPoints}
          dim={viewMode === "scientific"}
        />
      ))}

      {/* Lunar Orbit Ring — reads Earth's live position via ref, never triggers re-renders */}
      {earthPlaced && (
        <LunarOrbitRing
          viewMode={viewMode}
          earthPositionRef={earthLivePosRef}
          earthRadius={earthPlaced.radius}
          orbitEpochMs={orbitEpochMs}
        />
      )}

      {/* Bodies */}
      {adjusted.map((p) => (
        <BodyMesh
          key={p.id}
          placed={p}
          selected={p.id === selectedBody}
          showLabel={showLabels && (!performanceMode || p.id === selectedBody)}
          onSelect={selectBody}
          viewMode={viewMode}
          trueScaleUniverse={trueScaleUniverse}
          livePositionRef={p.id === "earth" ? earthLivePosRef : undefined}
        />
      ))}

      <CameraRig
        placedBodies={adjusted}
        selectedBody={selectedBody}
        viewMode={viewMode}
        trueScaleUniverse={trueScaleUniverse}
      />
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
      gl={{
        antialias: !performanceMode,
        powerPreference: "high-performance",
        logarithmicDepthBuffer: true,
        // Preserve the drawing buffer so the scene stays visible between frames.
        // Without this, some browsers/drivers clear the canvas between rAF calls,
        // which is the direct cause of the black flash seen during dynamic simulation.
        preserveDrawingBuffer: false,
        // Avoid context loss on battery-saver / throttled mobile GPUs
        failIfMajorPerformanceCaveat: false,
      }}
      camera={{ fov: 45, near: 0.0000001, far: 20000, position: [18, 14, 24] }}
      // Always render every frame — R3F 'demand' mode can skip frames
      // right after a state update lands, which produces the black-frame flash.
      frameloop="always"
    >
      <SceneContents state={state} />
    </Canvas>
  );
}
