import { useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { generateKuiperBeltData } from "@/lib/orbit/minorBodies";
import { SCIENTIFIC_UNITS_PER_AU, type LayoutMode } from "@/lib/orbit/sceneLayout";
import { useOrbitStore } from "@/store/useOrbitStore";

interface KuiperBeltProps {
  viewMode: LayoutMode;
}

const MAX_KUIPER = 2500;

export const KuiperBelt = React.memo(function KuiperBelt({ viewMode }: KuiperBeltProps) {
  const showKuiperBelt = useOrbitStore((s) => s.showKuiperBelt);
  const performanceMode = useOrbitStore((s) => s.performanceMode);
  const epochMs = useOrbitStore((s) => s.epochMs);
  const playbackRate = useOrbitStore((s) => s.playbackRate);

  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const activeCount = performanceMode ? 800 : MAX_KUIPER;

  const data = useMemo(() => generateKuiperBeltData(MAX_KUIPER), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.012, 0), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) return;

    for (let i = 0; i < data.length; i++) {
      const p = data[i]!;
      color.set(p.colorHex);
      mesh.setColorAt(i, color);
    }
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [data, color]);

  const updateInstances = (currentEpochMs: number) => {
    const mesh = instancedRef.current;
    if (!mesh) return;

    mesh.count = activeCount;
    const epochSec = currentEpochMs / 1000;

    for (let i = 0; i < activeCount; i++) {
      const p = data[i]!;
      const angle = p.initialMeanAnomalyRad + p.orbitalSpeedRadPerSec * epochSec;
      const rAu = p.semiMajorAxisAu * (1 - p.eccentricity * Math.cos(angle));

      let sceneRadius: number;
      let particleScale: number;

      if (viewMode === "scientific") {
        sceneRadius = rAu * SCIENTIFIC_UNITS_PER_AU;
        particleScale = p.scale * 1.0;
      } else {
        const compressed = Math.pow(rAu, 0.5) * 7;
        sceneRadius = compressed;
        particleScale = p.scale * 1.5;
      }

      const xOrb = Math.cos(angle) * sceneRadius;
      const zOrb = Math.sin(angle) * sceneRadius;

      const x = xOrb * Math.cos(p.nodeRad) - zOrb * Math.sin(p.nodeRad) * Math.cos(p.inclinationRad);
      const z = -(xOrb * Math.sin(p.nodeRad) + zOrb * Math.cos(p.nodeRad) * Math.cos(p.inclinationRad));
      const y = zOrb * Math.sin(p.inclinationRad);

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(particleScale);
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    updateInstances(epochMs);
  }, [epochMs, viewMode, activeCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    if (playbackRate !== 0) {
      updateInstances(epochMs);
    }
  });

  return (
    <instancedMesh
      ref={instancedRef}
      args={[geometry, undefined, MAX_KUIPER]}
      frustumCulled={false}
      visible={showKuiperBelt}
    >
      <meshStandardMaterial
        roughness={0.7}
        metalness={0.2}
        vertexColors
        transparent
        opacity={0.65}
      />
    </instancedMesh>
  );
});
