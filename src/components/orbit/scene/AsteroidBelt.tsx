import { useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { generateAsteroidBeltData } from "@/lib/orbit/minorBodies";
import { SCIENTIFIC_UNITS_PER_AU, type LayoutMode } from "@/lib/orbit/sceneLayout";
import { useOrbitStore } from "@/store/useOrbitStore";

interface AsteroidBeltProps {
  viewMode: LayoutMode;
}

const MAX_ASTEROIDS = 5000;

export const AsteroidBelt = React.memo(function AsteroidBelt({ viewMode }: AsteroidBeltProps) {
  const showAsteroidBelt = useOrbitStore((s) => s.showAsteroidBelt);
  const performanceMode = useOrbitStore((s) => s.performanceMode);
  const epochMs = useOrbitStore((s) => s.epochMs);
  const playbackRate = useOrbitStore((s) => s.playbackRate);

  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const activeCount = performanceMode ? 1500 : MAX_ASTEROIDS;

  // Stable procedural particle data
  const data = useMemo(() => generateAsteroidBeltData(MAX_ASTEROIDS), []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Lightweight low-poly icosahedron
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.008, 0), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Initialize instanced colors once
  useEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) return;

    for (let i = 0; i < data.length; i++) {
      const ast = data[i]!;
      color.set(ast.colorHex);
      mesh.setColorAt(i, color);
    }
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [data, color]);

  // Update instance positions based on Keplerian mean motion
  const updateInstances = (currentEpochMs: number) => {
    const mesh = instancedRef.current;
    if (!mesh) return;

    mesh.count = activeCount;
    const epochSec = currentEpochMs / 1000;

    for (let i = 0; i < activeCount; i++) {
      const ast = data[i]!;
      const angle = ast.initialMeanAnomalyRad + ast.orbitalSpeedRadPerSec * epochSec;
      const rAu = ast.semiMajorAxisAu * (1 - ast.eccentricity * Math.cos(angle));

      let sceneRadius: number;
      let particleScale: number;

      if (viewMode === "scientific") {
        sceneRadius = rAu * SCIENTIFIC_UNITS_PER_AU;
        particleScale = ast.scale * 0.7;
      } else {
        const compressed = Math.pow(rAu, 0.5) * 7;
        sceneRadius = compressed;
        particleScale = ast.scale * 1.35;
      }

      const xOrb = Math.cos(angle) * sceneRadius;
      const zOrb = Math.sin(angle) * sceneRadius;

      const x = xOrb * Math.cos(ast.nodeRad) - zOrb * Math.sin(ast.nodeRad) * Math.cos(ast.inclinationRad);
      const z = -(xOrb * Math.sin(ast.nodeRad) + zOrb * Math.cos(ast.nodeRad) * Math.cos(ast.inclinationRad));
      const y = zOrb * Math.sin(ast.inclinationRad);

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
      args={[geometry, undefined, MAX_ASTEROIDS]}
      frustumCulled={false}
      visible={showAsteroidBelt}
    >
      <meshStandardMaterial
        roughness={0.85}
        metalness={0.15}
        vertexColors
        transparent
        opacity={0.82}
      />
    </instancedMesh>
  );
});
