import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { explorationRadius } from "@/lib/orbit/sceneLayout";

import { AU_IN_M } from "@/lib/orbit/constants";
import { scaleFactor } from "@/lib/orbit/scale";
import { useOrbitStore } from "@/store/useOrbitStore";
import { REFERENCE_OPTIONS } from "@/lib/orbit/scale";

interface MetricRing {
  label: string;
  modelDistM: number;
  auEquivalent: number;
  walkTime: string;
}

interface HumanScaleGridProps {
  earthPositionRef?: React.RefObject<THREE.Vector3>;
}

export const HumanScaleGrid = React.memo(function HumanScaleGrid({
  earthPositionRef,
}: HumanScaleGridProps) {
  const earthReference = useOrbitStore((s) => s.earthReference);
  const customEarthM = useOrbitStore((s) => s.customEarthDiameterM);

  const photonMeshRef = useRef<THREE.Mesh>(null);
  const pulseGroupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  const photonSpeedMode = useOrbitStore((s) => s.photonSpeedMode);
  const setPhotonSpeedMode = useOrbitStore((s) => s.setPhotonSpeedMode);

  // Speed:
  // - "realtime": exactly 499 seconds (~8.3 minutes) to cross 1 AU from Sun to Earth!
  // - "preview": ~12 seconds loop to let users see the motion without waiting 8 minutes
  useFrame((_, delta) => {
    if (!pulseGroupRef.current) return;
    const earthPos = earthPositionRef?.current;
    if (!earthPos) return;

    // Real-time speed: delta / 499.0. Preview speed: delta / 12.0
    const transitSeconds = photonSpeedMode === "realtime" ? 499.0 : 12.0;
    progressRef.current = (progressRef.current + delta / transitSeconds) % 1.0;
    const t = progressRef.current;

    pulseGroupRef.current.position.set(
      earthPos.x * t,
      earthPos.y * t,
      earthPos.z * t,
    );

    if (photonMeshRef.current) {
      const scale = 0.85 + Math.sin(t * Math.PI * 8) * 0.25;
      photonMeshRef.current.scale.set(scale, scale, scale);
    }
  });



  const refM = useMemo(() => {
    if (earthReference === "custom") return Math.max(customEarthM, 0.001);
    return REFERENCE_OPTIONS.find((o) => o.id === earthReference)?.metres ?? 0.1;
  }, [earthReference, customEarthM]);

  // Key distances in model space
  const rings = useMemo<MetricRing[]>(() => {
    const k = scaleFactor(refM);
    // Real distance per model meter = 1 / k
    const realPerModelM = 1 / k;

    // Keep it minimal and uncluttered: 3 key intuitive landmarks
    const modelDistances = [
      { m: 100, label: "100 m", walk: "1 min walk" },
      { m: 1170, label: "1.17 km (Earth Orbit)", walk: "14 min walk" },
      { m: 6100, label: "6.1 km (Jupiter)", walk: "1h 15m walk" },
    ];

    return modelDistances.map((d) => {
      const realM = d.m * realPerModelM;
      const au = realM / AU_IN_M;
      return {
        label: d.label,
        modelDistM: d.m,
        auEquivalent: au,
        walkTime: d.walk,
      };
    });
  }, [refM]);

  // Create Three.js ring geometries mapped through explorationRadius
  const renderedRings = useMemo(() => {
    return rings.map((ring) => {
      const sceneRadius = explorationRadius(ring.auEquivalent);
      const points: THREE.Vector3[] = [];
      const segments = 96;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * sceneRadius, 0, Math.sin(theta) * sceneRadius));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      return {
        ...ring,
        sceneRadius,
        geometry: geom,
      };
    });
  }, [rings]);

  return (
    <group position={[0, -0.05, 0]}>
      {renderedRings.map((ring) => (
        <group key={ring.label}>
          <line>
            <primitive object={ring.geometry} attach="geometry" />
            <lineDashedMaterial
              color="#38bdf8"
              transparent
              opacity={0.16}
              dashSize={0.5}
              gapSize={0.4}
              depthWrite={false}
            />
          </line>

          {/* Metric Distance Tag - clean fixed screen pixels */}
          <Html
            position={[ring.sceneRadius, 0.15, 0]}
            center
            zIndexRange={[3, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div className="flex select-none items-center gap-1 whitespace-nowrap rounded border border-primary/20 bg-space-deep/90 px-1.5 py-0.5 font-mono text-[8px] text-primary/80 shadow-sm backdrop-blur-xs">
              <span className="font-semibold text-primary">{ring.label}</span>
              <span className="text-[7px] text-muted-foreground">• {ring.walkTime}</span>
            </div>
          </Html>
        </group>
      ))}


      {/* Scaled Speed of Light Photon Runner */}
      {earthPositionRef && (
        <group ref={pulseGroupRef}>
          <mesh ref={photonMeshRef}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#eab308" transparent opacity={0.35} />
          </mesh>
          {/* Label positioned cleanly above the particle, fixed pixel sizing */}
          <Html center position={[0, 0.55, 0]} zIndexRange={[12, 0]}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPhotonSpeedMode(photonSpeedMode === "realtime" ? "preview" : "realtime");
              }}
              className="flex cursor-pointer select-none items-center gap-1 whitespace-nowrap rounded-full border border-yellow-500/50 bg-space-deep/95 px-2 py-0.5 font-mono text-[9px] text-yellow-300 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-yellow-950/70 active:scale-95"
              title={`Click to switch to ${photonSpeedMode === "realtime" ? "12s Fast Demo Mode" : "8.3 min Exact Real-time Transit"}`}
            >
              <span>⚡ Photon ({photonSpeedMode === "realtime" ? "Real-time 8.3m" : "12s Demo"})</span>
              <span className="rounded bg-yellow-400/25 px-1 py-0.2 text-[7px] font-bold uppercase text-yellow-200">
                {photonSpeedMode === "realtime" ? "Real" : "Demo"}
              </span>
            </button>
          </Html>
        </group>
      )}


    </group>
  );
});

