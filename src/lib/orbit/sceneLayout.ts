import { AU_IN_M, BODIES, PLANET_ORDER, type BodyId } from "./constants";
import {
  computeMoonOrbitPathEcl,
  computePlanetOrbitPathEcl,
  lengthAu,
  type SolarSystemState,
  type Vec3,
} from "./ephemeris";

export type LayoutMode = "scientific" | "exploration" | "human";

/** Scene units per AU in scientific mode. */
export const SCIENTIFIC_UNITS_PER_AU = 10;

export interface PlacedBody {
  readonly id: BodyId;
  /** Scene-space position (Three.js: y is up, orbits lie near the XZ plane). */
  readonly position: Vec3;
  /** Scene-space radius. */
  readonly radius: number;
  /** Orbit ring radius in scene units (0 for the Sun). */
  readonly orbitRadius: number;
  /** 3D scene points for drawing the actual orbit trajectory. */
  readonly orbitPathPoints: readonly Vec3[];
}

/**
 * Precomputed orbit line geometry keyed by body.  These paths are expensive:
 * each one samples Astronomy Engine hundreds of times, so they must not be
 * regenerated for every live-clock sample.
 */
export type OrbitPathMap = Readonly<Partial<Record<BodyId, readonly Vec3[]>>>;

/** Convert an Ecliptic J2000 AU vector into scene axes (x, z horizontal; y up). */
export function toSceneAxes(vEcl: Vec3, k: number): Vec3 {
  return { x: vEcl.x * k, y: vEcl.z * k, z: -vEcl.y * k };
}

export function auRadius(id: BodyId): number {
  return BODIES[id].radiusM / AU_IN_M;
}

/**
 * Compress heliocentric distance for the exploration layout so that the
 * inner planets stay readable while Neptune remains on screen.
 */
export function explorationRadius(au: number): number {
  return Math.pow(au, 0.5) * 7;
}

/**
 * Compute the Moon's relative 3D orbit trajectory around Earth in scene space.
 * Centered on (0,0,0) so it can be translated smoothly to Earth's live position.
 * Point 0 is mathematically synchronous with the Moon's current position.
 */
export function computeRelativeMoonOrbitPath(
  mode: LayoutMode,
  earthRadius: number,
  epochMs: number = Date.now(),
  moonGeoAu?: Vec3,
): Vec3[] {
  if (mode === "scientific") {
    const raw = computeMoonOrbitPathEcl(epochMs, 128);
    return raw.map((pt) => toSceneAxes(pt, SCIENTIFIC_UNITS_PER_AU));
  }
  // Exploration and human-scale modes: smooth circular orbit ring around Earth matching the live Moon vector
  const offset = earthRadius * 3;
  const points: Vec3[] = [];
  const segments = 128;
  const initialAngle = moonGeoAu ? Math.atan2(-moonGeoAu.y, moonGeoAu.x) : 0;
  for (let i = 0; i <= segments; i++) {
    const angle = initialAngle + (i / segments) * Math.PI * 2;
    points.push({
      x: Math.cos(angle) * offset,
      y: 0,
      z: Math.sin(angle) * offset,
    });
  }
  return points;
}

/**
 * Build the fixed WebGL orbit-line geometry for one scene configuration.
 * Planet positions themselves are still calculated from the live timestamp.
 */
export function computeOrbitPaths(mode: LayoutMode, epochMs: number): OrbitPathMap {
  const paths: Partial<Record<BodyId, readonly Vec3[]>> = {};

  for (const id of PLANET_ORDER) {
    const rawPathEcl = computePlanetOrbitPathEcl(id, epochMs, 128);
    paths[id] = rawPathEcl.map((pt) => {
      if (mode === "scientific") {
        return toSceneAxes(pt, SCIENTIFIC_UNITS_PER_AU);
      }
      const ptDist = lengthAu(pt);
      const ptScale = ptDist > 0 ? explorationRadius(ptDist) / ptDist : 0;
      return toSceneAxes(pt, ptScale);
    });
  }

  return paths;
}

export function layoutSolarSystem(
  state: SolarSystemState,
  mode: LayoutMode,
  trueScaleUniverse = false,
  orbitPaths?: OrbitPathMap,
): PlacedBody[] {
  const ids: BodyId[] = [
    "sun",
    "mercury",
    "venus",
    "earth",
    "moon",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ];

  // Supplying precomputed paths is the runtime fast path.  The fallback keeps
  // this pure utility self-contained for callers and tests outside the scene.
  const resolvedOrbitPaths = orbitPaths ?? computeOrbitPaths(mode, state.epochMs);
  const earthHelio = state.bodies.earth.helioAu;

  return ids.map((id) => {
    const body = state.bodies[id];
    const helioAu = body.helioAu;
    const distAu = lengthAu(helioAu);

    let orbitPathPoints = resolvedOrbitPaths[id] ?? [];

    // The live scene renders the Moon ring separately so that it can follow
    // Earth without rebuilding geometry.  Retain the complete path for the
    // standalone layout helper when no runtime path cache was supplied.
    if (!orbitPaths && id === "moon" && mode === "scientific") {
      orbitPathPoints = computeMoonOrbitPathEcl(state.epochMs, 128).map((pt) =>
        toSceneAxes(
          {
            x: earthHelio.x + pt.x,
            y: earthHelio.y + pt.y,
            z: earthHelio.z + pt.z,
          },
          SCIENTIFIC_UNITS_PER_AU,
        ),
      );
    }

    if (mode === "scientific") {
      const scenePos = toSceneAxes(helioAu, SCIENTIFIC_UNITS_PER_AU);
      // When trueScaleUniverse is enabled: 100% mathematically exact astronomical physical radius.
      // When disabled (standard scientific baseline): maintains visible threshold for casual exploration.
      const radius = trueScaleUniverse
        ? auRadius(id) * SCIENTIFIC_UNITS_PER_AU
        : Math.max(auRadius(id) * SCIENTIFIC_UNITS_PER_AU, 0.004);

      return {
        id,
        position: scenePos,
        radius,
        orbitRadius: BODIES[id].semiMajorAxisAu * SCIENTIFIC_UNITS_PER_AU,
        orbitPathPoints,
      };
    }

    // Exploration and human modes share a readable compressed layout with
    // visually exaggerated body sizes.
    const compressed = distAu > 0 ? explorationRadius(distAu) / distAu : 0;
    const scenePos = toSceneAxes(helioAu, compressed);
    const sizeExponent = 0.36;
    const radius =
      id === "sun"
        ? 1.5
        : Math.max(0.16, Math.pow(BODIES[id].radiusM / BODIES.earth.radiusM, sizeExponent) * 0.42);

    return {
      id,
      position: scenePos,
      radius,
      orbitRadius: BODIES[id].semiMajorAxisAu > 0 ? explorationRadius(BODIES[id].semiMajorAxisAu) : 0,
      orbitPathPoints,
    };
  });
}

/** Camera distance appropriate for focusing a placed body. */
export function focusDistance(
  placed: PlacedBody,
  mode: LayoutMode,
  trueScaleUniverse = false,
): number {
  if (placed.id === "sun") {
    return mode === "scientific" ? (trueScaleUniverse ? placed.radius * 2.8 : 2.5) : 6.0;
  }
  if (mode === "scientific") {
    if (trueScaleUniverse) {
      return placed.id === "saturn" ? placed.radius * 4.5 : placed.radius * 3.5;
    }
    return Math.max(placed.radius * 4.5, 0.02);
  }
  return Math.max(placed.radius * 4.5, 2.5);
}
