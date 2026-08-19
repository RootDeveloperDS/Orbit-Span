import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import {
  SPACECRAFT,
  SPACECRAFT_ORDER,
  computeJWSTL2ScenePosition,
  computeJWSTHaloOrbitPoints,
  computeSpacecraftTrajectory,
  type SpacecraftId,
} from "@/lib/orbit/spacecraft";
import type { LayoutMode } from "@/lib/orbit/sceneLayout";
import { useOrbitStore } from "@/store/useOrbitStore";

interface SpacecraftSceneProps {
  viewMode: LayoutMode;
  earthPositionRef?: React.RefObject<THREE.Vector3>;
  earthRadius: number;
}

/** Interstellar Probe Flight Path Line (Voyager 1, 2, New Horizons) */
const ProbeTrajectoryLine = React.memo(function ProbeTrajectoryLine({
  id,
  viewMode,
}: {
  id: SpacecraftId;
  viewMode: LayoutMode;
}) {
  const meta = SPACECRAFT[id];
  const geometry = useMemo(() => {
    if (id === "jwst") return null; // Handled separately around L2
    const points = computeSpacecraftTrajectory(id, viewMode);
    if (points.length < 2) return null;

    const threePoints = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    const curve = new THREE.CatmullRomCurve3(threePoints, false, "catmullrom", 0.3);
    const smoothPoints = curve.getPoints(100);
    return new THREE.BufferGeometry().setFromPoints(smoothPoints);
  }, [id, viewMode]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (!geometry || id === "jwst") return null;

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color={meta.color} transparent opacity={0.65} />
    </line>
  );
});

/** Interstellar Probe Beacon (Voyager 1, 2, New Horizons) */
const ProbeBeaconMesh = React.memo(function ProbeBeaconMesh({
  id,
  viewMode,
}: {
  id: SpacecraftId;
  viewMode: LayoutMode;
}) {
  const meta = SPACECRAFT[id];
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);
  const showLabels = useOrbitStore((s) => s.showLabels);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const tipPos = useMemo(() => {
    const points = computeSpacecraftTrajectory(id, viewMode);
    return points[points.length - 1] || { x: 0, y: 0, z: 0 };
  }, [id, viewMode]);

  const selected = selectedBody === id;

  const handlePointerOver = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
  }, []);

  if (id === "jwst") return null;

  return (
    <group position={[tipPos.x, tipPos.y, tipPos.z]}>
      {/* Octahedron beacon */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          selectBody(id);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial
          color={meta.color}
          emissive={meta.color}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Hit target */}
      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          selectBody(id);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.35, 8, 8]} />
      </mesh>

      {/* Selected Halo */}
      {selected && (
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} wireframe />
        </mesh>
      )}

      {/* Smart Proximity Label */}
      <Html
        position={[0, 0.22, 0]}
        center
        style={{
          pointerEvents: showLabels ? "auto" : "none",
          opacity: showLabels ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
        zIndexRange={[14, 0]}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            selectBody(id);
          }}
          className={`cursor-pointer select-none whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[8px] sm:text-[9px] tracking-wider uppercase transition-all duration-150 shadow-sm ${
            selected
              ? "border border-amber-400/80 bg-amber-950/80 text-amber-200"
              : hovered
                ? "border border-foreground/50 bg-background/95 text-foreground"
                : "border border-border/40 bg-background/60 text-muted-foreground backdrop-blur-[2px]"
          }`}
          title={`${meta.name} (${meta.status.replace(/_/g, " ")}, Speed: ${meta.speedKmS} km/s)`}
        >
          {meta.name}
        </button>
      </Html>
    </group>
  );
});

/** JWST Dedicated Spacecraft Beacon & Halo Orbit at Sun-Earth L2 */
const JWSTSpacecraft = React.memo(function JWSTSpacecraft({
  viewMode,
  earthPositionRef,
  earthRadius,
}: {
  viewMode: LayoutMode;
  earthPositionRef?: React.RefObject<THREE.Vector3>;
  earthRadius: number;
}) {
  const meta = SPACECRAFT.jwst;
  const groupRef = useRef<THREE.Group>(null);
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);
  const showLabels = useOrbitStore((s) => s.showLabels);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const selected = selectedBody === "jwst";

  // Pre-calculate halo geometry relative to L2 point
  const { haloGeometry, haloRadius } = useMemo(() => {
    const dummyEarth = { x: 7, y: 0, z: 0 };
    const { haloRadius } = computeJWSTL2ScenePosition(dummyEarth, viewMode, earthRadius);
    const points = computeJWSTHaloOrbitPoints({ x: 0, y: 0, z: 0 }, haloRadius, 48);
    const threePoints = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    return {
      haloGeometry: new THREE.BufferGeometry().setFromPoints(threePoints),
      haloRadius,
    };
  }, [viewMode, earthRadius]);

  useEffect(() => () => haloGeometry.dispose(), [haloGeometry]);

  // Frame update: keep JWST dynamically locked to Sun-Earth L2 anti-sunward vector
  useFrame(() => {
    if (groupRef.current && earthPositionRef?.current) {
      const ePos = earthPositionRef.current;
      const { l2Pos } = computeJWSTL2ScenePosition(ePos, viewMode, earthRadius);
      groupRef.current.position.set(l2Pos.x, l2Pos.y, l2Pos.z);
    }
  });

  const handlePointerOver = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <group ref={groupRef}>
      {/* Halo Orbit Ring around L2 */}
      <line>
        <primitive object={haloGeometry} attach="geometry" />
        <lineBasicMaterial color={meta.color} transparent opacity={0.45} />
      </line>

      {/* JWST Telescope Model / Diamond Beacon */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          selectBody("jwst");
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <octahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial
          color={meta.color}
          emissive={meta.color}
          emissiveIntensity={0.9}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Hit target */}
      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          selectBody("jwst");
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.35, 8, 8]} />
      </mesh>

      {/* Selection halo */}
      {selected && (
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} wireframe />
        </mesh>
      )}

      {/* Smart Proximity Label */}
      <Html
        position={[0, haloRadius + 0.15, 0]}
        center
        style={{
          pointerEvents: showLabels ? "auto" : "none",
          opacity: showLabels ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
        zIndexRange={[14, 0]}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            selectBody("jwst");
          }}
          className={`cursor-pointer select-none whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[8px] sm:text-[9px] tracking-wider uppercase transition-all duration-150 shadow-sm ${
            selected
              ? "border border-purple-400/80 bg-purple-950/80 text-purple-200"
              : hovered
                ? "border border-foreground/50 bg-background/95 text-foreground"
                : "border border-border/40 bg-background/60 text-muted-foreground backdrop-blur-[2px]"
          }`}
          title={`${meta.name} (Orbiting Sun-Earth L2 Lagrange Point)`}
        >
          {meta.name}
        </button>
      </Html>
    </group>
  );
});

export const SpacecraftScene = React.memo(function SpacecraftScene({
  viewMode,
  earthPositionRef,
  earthRadius,
}: SpacecraftSceneProps) {
  const showSpacecraft = useOrbitStore((s) => s.showSpacecraft);

  if (!showSpacecraft) return null;

  return (
    <group>
      {/* Interstellar Probes (Voyager 1, 2, New Horizons) */}
      {SPACECRAFT_ORDER.filter((id) => id !== "jwst").map((id) => (
        <React.Fragment key={id}>
          <ProbeTrajectoryLine id={id} viewMode={viewMode} />
          <ProbeBeaconMesh id={id} viewMode={viewMode} />
        </React.Fragment>
      ))}

      {/* JWST at Sun-Earth L2 Point */}
      <JWSTSpacecraft
        viewMode={viewMode}
        earthPositionRef={earthPositionRef}
        earthRadius={earthRadius}
      />
    </group>
  );
});
