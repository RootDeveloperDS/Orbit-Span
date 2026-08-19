import { Html, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import {
  MOONS,
  MOONS_BY_PARENT,
  computeMoonOrbitRingPoints,
  computeMoonPositionRelative,
  type MoonId,
  type MoonParentId,
} from "@/lib/orbit/moons";
import type { LayoutMode, PlacedBody } from "@/lib/orbit/sceneLayout";
import { useOrbitStore } from "@/store/useOrbitStore";

interface PlanetMoonsProps {
  parentId: MoonParentId;
  parentPlaced: PlacedBody;
  viewMode: LayoutMode;
  trueScaleUniverse: boolean;
  parentPositionRef?: React.RefObject<THREE.Vector3>;
}

/** Individual Moon 3D Sphere Mesh & Selection */
const MoonBodyMesh = React.memo(function MoonBodyMesh({
  moonId,
  viewMode,
  trueScaleUniverse,
  parentRadius,
  epochMs,
  selected,
  onSelect,
  systemOpacity,
}: {
  moonId: MoonId;
  viewMode: LayoutMode;
  trueScaleUniverse: boolean;
  parentRadius: number;
  epochMs: number;
  selected: boolean;
  onSelect: (id: MoonId) => void;
  systemOpacity: number;
}) {
  const meta = MOONS[moonId];
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Instantaneous relative coordinates
  const { position, radius } = useMemo(() => {
    return computeMoonPositionRelative(
      moonId,
      epochMs,
      viewMode,
      trueScaleUniverse,
      parentRadius,
    );
  }, [moonId, epochMs, viewMode, trueScaleUniverse, parentRadius]);

  const targetPos = useRef(new THREE.Vector3(position.x, position.y, position.z));
  targetPos.current.set(position.x, position.y, position.z);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos.current, 1 - Math.exp(-16 * delta));
    }
  });

  const handlePointerOver = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
  }, []);

  const hitRadius = Math.max(radius * 2.8, 0.02);
  const isVisible = systemOpacity > 0.005 || selected || hovered;
  const showLabel = hovered || selected || systemOpacity > 0.45;

  return (
    <group visible={isVisible}>
      {/* Central Moon Sphere */}
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(moonId);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[radius, 24, 18]} />
        <meshStandardMaterial
          color={meta.color}
          roughness={0.7}
          metalness={0.1}
          transparent
          opacity={Math.min(1.0, systemOpacity + 0.3)}
        />
      </mesh>

      {/* Touch / Click Hit Target */}
      <mesh
        position={[position.x, position.y, position.z]}
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(moonId);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[hitRadius, 12, 8]} />
      </mesh>

      {/* Selected Indicator */}
      {selected && (
        <mesh position={[position.x, position.y, position.z]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.35, radius * 1.55, 32]} />
          <meshBasicMaterial color="#a7f3d0" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Smart Non-Unmounting CSS Opacity Label */}
      <Html
        position={[position.x, position.y + radius * 1.8 + 0.01, position.z]}
        center
        style={{
          pointerEvents: showLabel ? "auto" : "none",
          opacity: showLabel ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
        zIndexRange={[15, 0]}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(moonId);
          }}
          className={`cursor-pointer select-none whitespace-nowrap rounded px-1 py-0.5 font-mono text-[8px] sm:text-[9px] tracking-wider uppercase transition-all duration-150 shadow-sm ${
            selected
              ? "border border-emerald-400/80 bg-emerald-950/80 text-emerald-200"
              : hovered
                ? "border border-foreground/50 bg-background/95 text-foreground"
                : "border border-border/40 bg-background/60 text-muted-foreground backdrop-blur-[2px]"
          }`}
          title={`${meta.name} (Orbit: ${Math.abs(meta.orbitalPeriodDays).toFixed(2)}d, Semi-major: ${(meta.semiMajorAxisKm / 1000).toLocaleString()}k km)`}
        >
          {meta.name}
        </button>
      </Html>
    </group>
  );
});

/** Static Orbit Line Geometry for a Single Moon */
const MoonOrbitRing = React.memo(function MoonOrbitRing({
  moonId,
  viewMode,
  trueScaleUniverse,
  parentRadius,
  opacity,
}: {
  moonId: MoonId;
  viewMode: LayoutMode;
  trueScaleUniverse: boolean;
  parentRadius: number;
  opacity: number;
}) {
  const meta = MOONS[moonId];
  const geometry = useMemo(() => {
    const points = computeMoonOrbitRingPoints(moonId, viewMode, trueScaleUniverse, parentRadius, 96);
    const threePoints = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    return new THREE.BufferGeometry().setFromPoints(threePoints);
  }, [moonId, viewMode, trueScaleUniverse, parentRadius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  if (opacity <= 0.005) return null;

  return (
    // @ts-expect-error Three.js line element has visible prop at runtime
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color={meta.color} transparent opacity={Math.max(0, opacity * 0.38)} />
    </line>
  );
});

/**
 * Parent Moon System: manages all moons of a parent planet (Mars, Jupiter, Saturn, Uranus, Neptune, Pluto).
 * Automatically detects camera distance to smoothly fade in orbits when the user zooms in!
 */
export const PlanetMoonSystem = React.memo(function PlanetMoonSystem({
  parentId,
  parentPlaced,
  viewMode,
  trueScaleUniverse,
  parentPositionRef,
}: PlanetMoonsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const moonIds = MOONS_BY_PARENT[parentId] || [];

  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);
  const showMoons = useOrbitStore((s) => s.showMoons);
  const showMoonOrbits = useOrbitStore((s) => s.showMoonOrbits);
  const epochMs = useOrbitStore((s) => s.epochMs);

  const [systemOpacity, setSystemOpacity] = useState(0.0);

  const isParentOrMoonSelected = useMemo(() => {
    return selectedBody === parentId || moonIds.includes(selectedBody as MoonId);
  }, [selectedBody, parentId, moonIds]);

  // Frame update: smooth position tracking to parent planet + camera proximity fade
  useFrame(() => {
    if (groupRef.current) {
      if (parentPositionRef?.current) {
        groupRef.current.position.copy(parentPositionRef.current);
      } else {
        groupRef.current.position.set(
          parentPlaced.position.x,
          parentPlaced.position.y,
          parentPlaced.position.z,
        );
      }

      // Proximity check: when zooming in towards the planet, smoothly ramp up orbit visibility!
      const dist = camera.position.distanceTo(groupRef.current.position);
      const threshold =
        viewMode === "scientific"
          ? trueScaleUniverse
            ? parentPlaced.radius * 250 + 0.05
            : parentPlaced.radius * 60 + 0.5
          : parentPlaced.radius * 25 + 4.0;

      let targetOpacity = 0.0;
      if (isParentOrMoonSelected) {
        targetOpacity = 1.0;
      } else if (dist < threshold) {
        const ratio = Math.max(0, Math.min(1, 1 - dist / threshold));
        targetOpacity = Math.pow(ratio, 0.7);
      }

      if (Math.abs(targetOpacity - systemOpacity) > 0.02) {
        setSystemOpacity((prev) => prev + (targetOpacity - prev) * 0.15);
      }
    }
  });

  if (!showMoons || moonIds.length === 0) return null;

  return (
    <group ref={groupRef}>
      {/* Orbit Rings (Visible on Zoom In or Selection) */}
      {showMoonOrbits &&
        moonIds.map((moonId) => (
          <MoonOrbitRing
            key={`orbit-ring-${moonId}`}
            moonId={moonId}
            viewMode={viewMode}
            trueScaleUniverse={trueScaleUniverse}
            parentRadius={parentPlaced.radius}
            opacity={systemOpacity}
          />
        ))}

      {/* Moon Spheres */}
      {moonIds.map((moonId) => (
        <MoonBodyMesh
          key={`moon-${moonId}`}
          moonId={moonId}
          viewMode={viewMode}
          trueScaleUniverse={trueScaleUniverse}
          parentRadius={parentPlaced.radius}
          epochMs={epochMs}
          selected={selectedBody === moonId}
          onSelect={selectBody}
          systemOpacity={systemOpacity}
        />
      ))}
    </group>
  );
});
