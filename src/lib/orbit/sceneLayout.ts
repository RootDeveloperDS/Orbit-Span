/**
 * Pure mapping from astronomical state to 3D scene coordinates.
 * No React, no Three.js imports.
 */
import { AU_IN_M, BODIES, type BodyId } from "./constants";
import type { SolarSystemState, Vec3 } from "./ephemeris";

export type LayoutMode = "scientific" | "exploration" | "human";

/** Scene units per AU in true-scale mode. */
export const SCIENTIFIC_UNITS_PER_AU = 6;

export interface PlacedBody {
  readonly id: BodyId;
  /** Scene-space position (Three.js: y is up, orbits lie near the XZ plane). */
  readonly position: Vec3;
  /** Scene-space radius. */
  readonly radius: number;
  /** Orbit ring radius in scene units (0 for the Sun). */
  readonly orbitRadius: number;
}

/** Convert an equatorial-J2000 AU vector into scene axes (x, z horizontal; y up). */
function toSceneAxes(v: Vec3, k: number): Vec3 {
  return { x: v.x * k, y: v.z * k, z: -v.y * k };
}

function auRadius(id: BodyId): number {
  return BODIES[id].radiusM / AU_IN_M;
}

/**
 * Compress heliocentric distance for the exploration layout so that the
 * inner planets stay readable while Neptune remains on screen.
 */
export function explorationRadius(au: number): number {
  return Math.pow(au, 0.5) * 7;
}

export function layoutSolarSystem(state: SolarSystemState, mode: LayoutMode): PlacedBody[] {
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

  return ids.map((id) => {
    const body = state.bodies[id];
    const helioAu = body.helioAu;
    const distAu = Math.sqrt(helioAu.x ** 2 + helioAu.y ** 2 + helioAu.z ** 2);

    if (mode === "scientific") {
      const scenePos = toSceneAxes(helioAu, SCIENTIFIC_UNITS_PER_AU);
      return {
        id,
        position: scenePos,
        // True relative sizes: planets become sub-pixel dots on purpose.
        radius: Math.max(auRadius(id) * SCIENTIFIC_UNITS_PER_AU, 0.004),
        orbitRadius: BODIES[id].semiMajorAxisAu * SCIENTIFIC_UNITS_PER_AU,
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
    };
  });
}

/** Camera distance appropriate for focusing a placed body. */
export function focusDistance(placed: PlacedBody): number {
  return Math.max(placed.radius * 9, 2.5);
}
