import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import {
  MINOR_BODIES,
  MINOR_BODY_ORDER,
  computeCometTail,
  computeKeplerianPositionAu,
  computeMinorBodyOrbitPath,
  type MinorBodyId,
} from "@/lib/orbit/minorBodies";
import { AU_IN_M } from "@/lib/orbit/constants";
import { SCIENTIFIC_UNITS_PER_AU, toSceneAxes, type LayoutMode } from "@/lib/orbit/sceneLayout";
import { useOrbitStore } from "@/store/useOrbitStore";

interface MinorBodiesSceneProps {
  viewMode: LayoutMode;
  trueScaleUniverse: boolean;
}

/** Stable Orbit Line for Minor Body */
const MinorBodyOrbitLine = React.memo(function MinorBodyOrbitLine({
  id,
  viewMode,
}: {
  id: MinorBodyId;
  viewMode: LayoutMode;
}) {
  const meta = MINOR_BODIES[id];
  const geometry = useMemo(() => {
    const points = computeMinorBodyOrbitPath(meta.elements, viewMode, 360);
    const threePoints = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    return new THREE.BufferGeometry().setFromPoints(threePoints);
  }, [meta.elements, viewMode]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial
        color={meta.color}
        transparent
        opacity={id === "halley" ? 0.35 : 0.22}
      />
    </line>
  );
});

/** Stable Comet Tail Mesh with zero memory reallocation per frame */
const CometTailMesh = React.memo(function CometTailMesh({
  tailEndPos,
  scenePos,
  intensity,
  radius,
}: {
  tailEndPos: { x: number; y: number; z: number };
  scenePos: { x: number; y: number; z: number };
  intensity: number;
  radius: number;
}) {
  const lineGeometry = useMemo(() => {
    const p1 = new THREE.Vector3(0, 0, 0);
    const p2 = new THREE.Vector3(tailEndPos.x - scenePos.x, tailEndPos.y - scenePos.y, tailEndPos.z - scenePos.z);
    return new THREE.BufferGeometry().setFromPoints([p1, p2]);
  }, [tailEndPos, scenePos]);

  useEffect(() => () => lineGeometry.dispose(), [lineGeometry]);

  if (intensity <= 0.02) return null;

  return (
    <group>
      <line>
        <primitive object={lineGeometry} attach="geometry" />
        <lineBasicMaterial color="#38bdf8" transparent opacity={Math.min(0.9, intensity * 0.8)} />
      </line>
      <mesh>
        <sphereGeometry args={[radius * 2.8, 16, 12]} />
        <meshBasicMaterial color="#a5f3fc" transparent opacity={intensity * 0.35} />
      </mesh>
    </group>
  );
});

/** Individual Minor Body Sphere & Label */
const MinorBodyMesh = React.memo(function MinorBodyMesh({
  id,
  viewMode,
  trueScaleUniverse,
  epochMs,
}: {
  id: MinorBodyId;
  viewMode: LayoutMode;
  trueScaleUniverse: boolean;
  epochMs: number;
}) {
  const meta = MINOR_BODIES[id];
  const meshRef = useRef<THREE.Group>(null);
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);
  const showLabels = useOrbitStore((s) => s.showLabels);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const posAu = useMemo(() => {
    return computeKeplerianPositionAu(meta.elements, epochMs);
  }, [meta.elements, epochMs]);

  const targetPos = useRef(new THREE.Vector3());

  const radius = useMemo(() => {
    if (viewMode === "scientific") {
      if (trueScaleUniverse) {
        return (meta.radiusM / AU_IN_M) * SCIENTIFIC_UNITS_PER_AU;
      }
      return Math.max((meta.radiusM / AU_IN_M) * SCIENTIFIC_UNITS_PER_AU, 0.0035);
    }
    return id === "pluto" ? 0.16 : id === "ceres" ? 0.12 : 0.08;
  }, [viewMode, trueScaleUniverse, meta.radiusM, id]);

  const scenePos = useMemo(() => {
    if (viewMode === "scientific") {
      return toSceneAxes(posAu, SCIENTIFIC_UNITS_PER_AU);
    }
    const dist = Math.sqrt(posAu.x * posAu.x + posAu.y * posAu.y + posAu.z * posAu.z);
    const compressed = Math.pow(dist, 0.5) * 7;
    const scale = dist > 0 ? compressed / dist : 0;
    return toSceneAxes(posAu, scale);
  }, [posAu, viewMode]);

  targetPos.current.set(scenePos.x, scenePos.y, scenePos.z);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos.current, 1 - Math.exp(-14 * delta));
    }
  });

  const cometTail = useMemo(() => {
    if (id !== "halley") return null;
    return computeCometTail(posAu, viewMode);
  }, [id, posAu, viewMode]);

  const selected = selectedBody === id;

  const handlePointerOver = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
  }, []);

  const hitRadius = Math.max(radius * 3.5, 0.05);

  return (
    <group ref={meshRef} position={[scenePos.x, scenePos.y, scenePos.z]}>
      {/* Central Mesh */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          selectBody(id);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[radius, 24, 18]} />
        <meshStandardMaterial
          color={meta.color}
          roughness={0.8}
          metalness={0.1}
          emissive={id === "halley" ? "#67e8f9" : "#000000"}
          emissiveIntensity={id === "halley" ? 0.35 : 0}
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
        <sphereGeometry args={[hitRadius, 12, 8]} />
      </mesh>

      {/* Selection Ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.4, radius * 1.6, 32]} />
          <meshBasicMaterial color="#fcd34d" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Comet Halley Tail */}
      {id === "halley" && cometTail && (
        <CometTailMesh
          tailEndPos={cometTail.tailEndPos}
          scenePos={scenePos}
          intensity={cometTail.intensity}
          radius={radius}
        />
      )}

      {/* Smart Proximity Label */}
      <Html
        position={[0, radius * 2.0 + 0.02, 0]}
        center
        style={{
          pointerEvents: showLabels ? "auto" : "none",
          opacity: showLabels ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
        zIndexRange={[12, 0]}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            selectBody(id);
          }}
          className={`cursor-pointer select-none whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase transition-all duration-150 shadow-sm ${
            selected
              ? "border border-amber-400/80 bg-amber-950/80 text-amber-200"
              : hovered
                ? "border border-foreground/50 bg-background/95 text-foreground"
                : "border border-border/40 bg-background/60 text-muted-foreground backdrop-blur-[2px]"
          }`}
          title={`${meta.name} (${meta.category.replace("_", " ")}, ${meta.elements.semiMajorAxisAu} AU)`}
        >
          {meta.name}
        </button>
      </Html>
    </group>
  );
});

export const MinorBodiesScene = React.memo(function MinorBodiesScene({
  viewMode,
  trueScaleUniverse,
}: MinorBodiesSceneProps) {
  const showAsteroidBelt = useOrbitStore((s) => s.showAsteroidBelt);
  const epochMs = useOrbitStore((s) => s.epochMs);

  if (!showAsteroidBelt) return null;

  return (
    <group>
      {MINOR_BODY_ORDER.map((id) => (
        <MinorBodyOrbitLine key={`orbit-${id}`} id={id} viewMode={viewMode} />
      ))}
      {MINOR_BODY_ORDER.map((id) => (
        <MinorBodyMesh
          key={`mesh-${id}`}
          id={id}
          viewMode={viewMode}
          trueScaleUniverse={trueScaleUniverse}
          epochMs={epochMs}
        />
      ))}
    </group>
  );
});
