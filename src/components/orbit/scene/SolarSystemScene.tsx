import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useCursor } from "@react-three/drei";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { BODIES, type BodyId } from "@/lib/orbit/constants";
import { MOONS, type MoonId, computeMoonPositionRelative } from "@/lib/orbit/moons";
import { MINOR_BODIES, computeKeplerianPositionAu, type MinorBodyId } from "@/lib/orbit/minorBodies";
import { SPACECRAFT, computeJWSTL2ScenePosition, computeSpacecraftTrajectory, type SpacecraftId } from "@/lib/orbit/spacecraft";
import type { SolarSystemState } from "@/lib/orbit/ephemeris";
import {
  computeRelativeMoonOrbitPath,
  computeOrbitPaths,
  focusDistance,
  layoutSolarSystem,
  toSceneAxes,
  SCIENTIFIC_UNITS_PER_AU,
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

import { PlanetMoonSystem } from "./PlanetaryMoons";
import { AsteroidBelt } from "./AsteroidBelt";
import { KuiperBelt } from "./KuiperBelt";
import { MinorBodiesScene } from "./MinorBodiesScene";
import { SpacecraftScene } from "./SpacecraftScene";

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
  onSelect: (id: string) => void;
  viewMode: ViewMode;
  trueScaleUniverse: boolean;
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
  const target = useRef(new THREE.Vector3(placed.position.x, placed.position.y, placed.position.z));
  const meta = BODIES[placed.id];
  const isSun = placed.id === "sun";
  const isEarth = placed.id === "earth";
  const isSaturn = placed.id === "saturn";

  const [hovered, setHovered] = useState(false);
  const [isCloseUp, setIsCloseUp] = useState(false);
  useCursor(hovered);

  const handlePointerOver = useCallback((e: { stopPropagation: () => void }) => {
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

  target.current.set(placed.position.x, placed.position.y, placed.position.z);

  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    if (group) {
      group.position.lerp(target.current, 1 - Math.exp(-14 * delta));

      if (livePositionRef) {
        livePositionRef.current?.copy(group.position);
      }

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
      <Html
        center
        position={[0, labelOffsetY, 0]}
        style={{
          pointerEvents: showLabel ? "auto" : "none",
          opacity: showLabel ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
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
    </group>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// CameraRig — Universal Target Tracking (Planets, Moons, Minor Bodies, Probes)
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig({
  placedBodies,
  selectedBody,
  viewMode,
  trueScaleUniverse,
  epochMs,
}: {
  placedBodies: PlacedBody[];
  selectedBody: string;
  viewMode: ViewMode;
  trueScaleUniverse: boolean;
  epochMs: number;
}) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const prevSelected = useRef<string | null>(null);
  const desiredFocusPos = useRef(new THREE.Vector3());
  const smoothedFocusPos = useRef(new THREE.Vector3());
  const focusStep = useRef(new THREE.Vector3());
  const isFirstFrame = useRef(true);

  const placedRef = useRef(placedBodies);
  placedRef.current = placedBodies;

  const getFocusTarget = useCallback((): { pos: THREE.Vector3; focusDist: number; minNear: number } => {
    // 1. Standard Planet Focus
    const planet = placedRef.current.find((b) => b.id === selectedBody);
    if (planet) {
      const dist = focusDistance(planet, viewMode, trueScaleUniverse);
      return {
        pos: new THREE.Vector3(planet.position.x, planet.position.y, planet.position.z),
        focusDist: dist,
        minNear: Math.max(1e-7, planet.radius * 0.01),
      };
    }

    // 2. Moon Focus
    if (selectedBody in MOONS) {
      const moonMeta = MOONS[selectedBody as MoonId];
      const parent = placedRef.current.find((b) => b.id === moonMeta.parentId);
      if (parent) {
        const { position, radius } = computeMoonPositionRelative(
          selectedBody as MoonId,
          epochMs,
          viewMode,
          trueScaleUniverse,
          parent.radius,
        );
        const moonPos = new THREE.Vector3(
          parent.position.x + position.x,
          parent.position.y + position.y,
          parent.position.z + position.z,
        );
        const dist = viewMode === "scientific" ? Math.max(radius * 5.0, 0.0008) : Math.max(radius * 4.0, 0.35);
        return {
          pos: moonPos,
          focusDist: dist,
          minNear: Math.max(1e-7, radius * 0.01),
        };
      }
    }

    // 3. Minor Body / Comet Focus
    if (selectedBody in MINOR_BODIES) {
      const mb = MINOR_BODIES[selectedBody as MinorBodyId];
      const posAu = computeKeplerianPositionAu(mb.elements, epochMs);
      let p: { x: number; y: number; z: number };
      if (viewMode === "scientific") {
        p = toSceneAxes(posAu, SCIENTIFIC_UNITS_PER_AU);
      } else {
        const d = Math.sqrt(posAu.x * posAu.x + posAu.y * posAu.y + posAu.z * posAu.z);
        const s = d > 0 ? (Math.pow(d, 0.5) * 7) / d : 0;
        p = toSceneAxes(posAu, s);
      }
      return {
        pos: new THREE.Vector3(p.x, p.y, p.z),
        focusDist: viewMode === "scientific" ? 0.08 : 0.8,
        minNear: 1e-6,
      };
    }

    // 4. Spacecraft Focus
    if (selectedBody === "jwst") {
      const earth = placedRef.current.find((b) => b.id === "earth");
      if (earth) {
        const { l2Pos } = computeJWSTL2ScenePosition(earth.position, viewMode, earth.radius);
        return {
          pos: new THREE.Vector3(l2Pos.x, l2Pos.y, l2Pos.z),
          focusDist: viewMode === "scientific" ? 0.08 : 0.6,
          minNear: 1e-6,
        };
      }
    } else if (selectedBody in SPACECRAFT) {
      const points = computeSpacecraftTrajectory(selectedBody as SpacecraftId, viewMode);
      const tip = points[points.length - 1] || { x: 0, y: 0, z: 0 };
      return {
        pos: new THREE.Vector3(tip.x, tip.y, tip.z),
        focusDist: viewMode === "scientific" ? 0.5 : 1.2,
        minNear: 1e-6,
      };
    }

    return { pos: new THREE.Vector3(0, 0, 0), focusDist: 15, minNear: 1e-6 };
  }, [selectedBody, viewMode, trueScaleUniverse, epochMs]);

  useEffect(() => {
    const { pos, focusDist, minNear } = getFocusTarget();
    const c = controls.current;
    const offset = new THREE.Vector3(focusDist * 0.7, focusDist * 0.5, focusDist * 0.85);

    if (prevSelected.current !== selectedBody || isFirstFrame.current) {
      prevSelected.current = selectedBody;
      isFirstFrame.current = false;

      camera.position.set(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z);

      if (c) {
        c.target.copy(pos);
        c.minDistance = Math.max(1e-7, minNear * 1.2);
        c.maxDistance = 10000;
        c.update();
      }

      desiredFocusPos.current.copy(pos);
      smoothedFocusPos.current.copy(pos);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.near = Math.max(1e-7, minNear);
        camera.far = viewMode === "scientific" ? 20000 : 2000;
        camera.updateProjectionMatrix();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, selectedBody, viewMode, trueScaleUniverse]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;

    const { pos, minNear } = getFocusTarget();
    desiredFocusPos.current.copy(pos);

    focusStep.current
      .subVectors(desiredFocusPos.current, smoothedFocusPos.current)
      .multiplyScalar(1 - Math.exp(-14 * delta));

    if (focusStep.current.lengthSq() > 1e-12) {
      camera.position.add(focusStep.current);
      c.target.add(focusStep.current);
      smoothedFocusPos.current.add(focusStep.current);
      c.update();
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      const safeNear = Math.max(1e-7, minNear);
      if (Math.abs(camera.near - safeNear) > 1e-8) {
        camera.near = safeNear;
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
      new THREE.Color("#d8ecf8"),
      new THREE.Color("#ffffff"),
      new THREE.Color("#fff2cc"),
      new THREE.Color("#ffd2a1"),
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
  const epochMs = useOrbitStore((s) => s.epochMs);
  const [orbitEpochMs, setOrbitEpochMs] = useState(state?.epochMs ?? Date.now());
  const lastOrbitMode = useRef(viewMode);

  useEffect(() => {
    if (lastOrbitMode.current !== viewMode || playbackRate === 0) {
      lastOrbitMode.current = viewMode;
      setOrbitEpochMs((current) => (current === state.epochMs ? current : state.epochMs));
    }
  }, [playbackRate, state?.epochMs, viewMode]);

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
    const earth = placed.find((p) => p.id === "earth");
    const moon = placed.find((p) => p.id === "moon");
    if (!earth || !moon) return placed;
    const geo = state?.bodies?.moon?.geoAu;
    const len = geo ? Math.hypot(geo.x, geo.y, geo.z) : 1;
    const offset = earth.radius * 3;
    const moonAdjusted: PlacedBody = {
      ...moon,
      position: {
        x: earth.position.x + ((geo?.x ?? 0) / len) * offset,
        y: earth.position.y + ((geo?.z ?? 0) / len) * offset,
        z: earth.position.z - ((geo?.y ?? 0) / len) * offset,
      },
      radius: Math.max(earth.radius * 0.32, 0.05),
      orbitRadius: offset,
      orbitPathPoints: [],
    };
    return placed.map((p) => (p.id === "moon" ? moonAdjusted : p));
  }, [placed, state, viewMode]);

  const earthPlaced = adjusted.find((p) => p.id === "earth");
  const marsPlaced = adjusted.find((p) => p.id === "mars");
  const jupiterPlaced = adjusted.find((p) => p.id === "jupiter");
  const saturnPlaced = adjusted.find((p) => p.id === "saturn");
  const uranusPlaced = adjusted.find((p) => p.id === "uranus");
  const neptunePlaced = adjusted.find((p) => p.id === "neptune");

  const earthLivePosRef = useRef(new THREE.Vector3(earthPlaced?.position.x ?? 0, earthPlaced?.position.y ?? 0, earthPlaced?.position.z ?? 0));
  const marsLivePosRef = useRef(new THREE.Vector3(marsPlaced?.position.x ?? 0, marsPlaced?.position.y ?? 0, marsPlaced?.position.z ?? 0));
  const jupiterLivePosRef = useRef(new THREE.Vector3(jupiterPlaced?.position.x ?? 0, jupiterPlaced?.position.y ?? 0, jupiterPlaced?.position.z ?? 0));
  const saturnLivePosRef = useRef(new THREE.Vector3(saturnPlaced?.position.x ?? 0, saturnPlaced?.position.y ?? 0, saturnPlaced?.position.z ?? 0));
  const uranusLivePosRef = useRef(new THREE.Vector3(uranusPlaced?.position.x ?? 0, uranusPlaced?.position.y ?? 0, uranusPlaced?.position.z ?? 0));
  const neptuneLivePosRef = useRef(new THREE.Vector3(neptunePlaced?.position.x ?? 0, neptunePlaced?.position.y ?? 0, neptunePlaced?.position.z ?? 0));

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

      {/* Earth's Lunar Orbit Ring */}
      {earthPlaced && (
        <LunarOrbitRing
          viewMode={viewMode}
          earthPositionRef={earthLivePosRef}
          earthRadius={earthPlaced.radius}
          orbitEpochMs={orbitEpochMs}
        />
      )}

      {/* Planetary Moon Systems with Proximity Fade-in */}
      {marsPlaced && (
        <PlanetMoonSystem
          parentId="mars"
          parentPlaced={marsPlaced}
          viewMode={viewMode}
          trueScaleUniverse={trueScaleUniverse}
          parentPositionRef={marsLivePosRef}
        />
      )}
      {jupiterPlaced && (
        <PlanetMoonSystem
          parentId="jupiter"
          parentPlaced={jupiterPlaced}
          viewMode={viewMode}
          trueScaleUniverse={trueScaleUniverse}
          parentPositionRef={jupiterLivePosRef}
        />
      )}
      {saturnPlaced && (
        <PlanetMoonSystem
          parentId="saturn"
          parentPlaced={saturnPlaced}
          viewMode={viewMode}
          trueScaleUniverse={trueScaleUniverse}
          parentPositionRef={saturnLivePosRef}
        />
      )}
      {uranusPlaced && (
        <PlanetMoonSystem
          parentId="uranus"
          parentPlaced={uranusPlaced}
          viewMode={viewMode}
          trueScaleUniverse={trueScaleUniverse}
          parentPositionRef={uranusLivePosRef}
        />
      )}
      {neptunePlaced && (
        <PlanetMoonSystem
          parentId="neptune"
          parentPlaced={neptunePlaced}
          viewMode={viewMode}
          trueScaleUniverse={trueScaleUniverse}
          parentPositionRef={neptuneLivePosRef}
        />
      )}

      {/* Main Asteroid Belt & Kuiper Belt */}
      <AsteroidBelt viewMode={viewMode} />
      <KuiperBelt viewMode={viewMode} />

      {/* Minor Bodies, Dwarf Planets & Comet Halley */}
      <MinorBodiesScene viewMode={viewMode} trueScaleUniverse={trueScaleUniverse} />

      {/* Historic Spacecraft Probes & JWST at L2 */}
      <SpacecraftScene
        viewMode={viewMode}
        earthPositionRef={earthLivePosRef}
        earthRadius={earthPlaced?.radius ?? 0.42}
      />

      {/* Primary Planetary Bodies */}
      {adjusted.map((p) => (
        <BodyMesh
          key={p.id}
          placed={p}
          selected={p.id === selectedBody}
          showLabel={showLabels && (!performanceMode || p.id === selectedBody)}
          onSelect={selectBody}
          viewMode={viewMode}
          trueScaleUniverse={trueScaleUniverse}
          livePositionRef={
            p.id === "earth"
              ? earthLivePosRef
              : p.id === "mars"
                ? marsLivePosRef
                : p.id === "jupiter"
                  ? jupiterLivePosRef
                  : p.id === "saturn"
                    ? saturnLivePosRef
                    : p.id === "uranus"
                      ? uranusLivePosRef
                      : p.id === "neptune"
                        ? neptuneLivePosRef
                        : undefined
          }
        />
      ))}

      <CameraRig
        placedBodies={adjusted}
        selectedBody={selectedBody}
        viewMode={viewMode}
        trueScaleUniverse={trueScaleUniverse}
        epochMs={epochMs}
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
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      }}
      camera={{ fov: 45, near: 0.0000001, far: 20000, position: [18, 14, 24] }}
      frameloop="always"
    >
      <SceneContents state={state} />
    </Canvas>
  );
}
