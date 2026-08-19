/**
 * Minor Bodies, Dwarf Planets, Comets & Asteroid Belt Mathematical Engine.
 * Implements analytical Keplerian orbital mechanics (Newton-Raphson solver),
 * realistic Kirkwood gap distribution, comet tail outgassing dynamics, and Kuiper belt.
 */
import { AU_IN_M } from "./constants";
import type { Vec3 } from "./ephemeris";
import { SCIENTIFIC_UNITS_PER_AU, toSceneAxes, type LayoutMode } from "./sceneLayout";

export type MinorBodyId = "ceres" | "vesta" | "pallas" | "pluto" | "halley";

export interface KeplerianElements {
  /** Semi-major axis in Astronomical Units (AU). */
  readonly semiMajorAxisAu: number;
  /** Orbital eccentricity [0, 1). */
  readonly eccentricity: number;
  /** Inclination to ecliptic J2000 in degrees. */
  readonly inclinationDeg: number;
  /** Longitude of ascending node in degrees. */
  readonly longitudeOfAscendingNodeDeg: number;
  /** Argument of periapsis in degrees. */
  readonly argumentOfPeriapsisDeg: number;
  /** Mean anomaly at epoch J2000 (2000-01-01T12:00:00Z) in degrees. */
  readonly meanAnomalyEpochDeg: number;
  /** Orbital sidereal period in Julian years (365.25 days). */
  readonly periodYears: number;
}

export interface MinorBodyMeta {
  readonly id: MinorBodyId;
  readonly name: string;
  readonly category: "dwarf_planet" | "asteroid" | "comet";
  /** Mean physical radius in metres. */
  readonly radiusM: number;
  readonly color: string;
  readonly blurb: string;
  readonly elements: KeplerianElements;
}

export const MINOR_BODIES: Readonly<Record<MinorBodyId, MinorBodyMeta>> = {
  ceres: {
    id: "ceres",
    name: "Ceres",
    category: "dwarf_planet",
    radiusM: 469_700,
    color: "#a49f99",
    blurb: "Largest object in the Asteroid Belt, containing 1/3 of the belt's total mass with active water-ice cryovolcanism.",
    elements: {
      semiMajorAxisAu: 2.767,
      eccentricity: 0.076,
      inclinationDeg: 10.59,
      longitudeOfAscendingNodeDeg: 80.33,
      argumentOfPeriapsisDeg: 73.60,
      meanAnomalyEpochDeg: 77.37,
      periodYears: 4.60,
    },
  },
  vesta: {
    id: "vesta",
    name: "Vesta",
    category: "asteroid",
    radiusM: 262_700,
    color: "#cfc7bc",
    blurb: "Second-largest asteroid and the brightest visible from Earth; features the towering 22 km Rheasilvia central peak.",
    elements: {
      semiMajorAxisAu: 2.362,
      eccentricity: 0.089,
      inclinationDeg: 7.14,
      longitudeOfAscendingNodeDeg: 103.81,
      argumentOfPeriapsisDeg: 151.20,
      meanAnomalyEpochDeg: 20.86,
      periodYears: 3.63,
    },
  },
  pallas: {
    id: "pallas",
    name: "Pallas",
    category: "asteroid",
    radiusM: 256_000,
    color: "#8c8780",
    blurb: "Third largest asteroid, characterized by an exceptionally high orbital inclination of 34.8°.",
    elements: {
      semiMajorAxisAu: 2.773,
      eccentricity: 0.231,
      inclinationDeg: 34.84,
      longitudeOfAscendingNodeDeg: 173.08,
      argumentOfPeriapsisDeg: 310.20,
      meanAnomalyEpochDeg: 320.15,
      periodYears: 4.62,
    },
  },
  pluto: {
    id: "pluto",
    name: "Pluto",
    category: "dwarf_planet",
    radiusM: 1_188_300,
    color: "#d1a884",
    blurb: "King of the Kuiper Belt in a 3:2 orbital resonance with Neptune; features nitrogen glaciers in Tombaugh Regio.",
    elements: {
      semiMajorAxisAu: 39.482,
      eccentricity: 0.2488,
      inclinationDeg: 17.16,
      longitudeOfAscendingNodeDeg: 110.30,
      argumentOfPeriapsisDeg: 113.83,
      meanAnomalyEpochDeg: 14.88,
      periodYears: 247.94,
    },
  },
  halley: {
    id: "halley",
    name: "1P/Halley",
    category: "comet",
    radiusM: 5_500,
    color: "#99d6ea",
    blurb: "Most famous periodic comet (75.3-year retrograde orbit), producing spectacular ion and dust tails near perihelion.",
    elements: {
      semiMajorAxisAu: 17.834,
      eccentricity: 0.9671,
      inclinationDeg: 162.26, // Retrograde
      longitudeOfAscendingNodeDeg: 58.42,
      argumentOfPeriapsisDeg: 111.33,
      meanAnomalyEpochDeg: 38.38,
      periodYears: 75.32,
    },
  },
};

export const MINOR_BODY_ORDER: readonly MinorBodyId[] = [
  "ceres",
  "vesta",
  "pallas",
  "pluto",
  "halley",
];

const J2000_EPOCH_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

/**
 * Solve Kepler's Equation $M = E - e \sin(E)$ for Eccentric Anomaly $E$ via Newton-Raphson iteration.
 */
export function solveKeplerEccentricAnomaly(M: number, e: number, tolerance = 1e-7): number {
  let mNorm = M % (Math.PI * 2);
  if (mNorm < 0) mNorm += Math.PI * 2;

  let E = e > 0.8 ? Math.PI : mNorm;
  for (let i = 0; i < 30; i++) {
    const f = E - e * Math.sin(E) - mNorm;
    const fPrime = 1 - e * Math.cos(E);
    const delta = f / fPrime;
    E -= delta;
    if (Math.abs(delta) < tolerance) break;
  }
  return E;
}

/**
 * Compute 3D Heliocentric Ecliptic coordinates in AU given an Eccentric Anomaly E directly.
 * Guaranteed to generate mathematically smooth geometric ellipses for any eccentricity e in [0, 1).
 */
export function computeKeplerianPositionFromE(elements: KeplerianElements, E: number): Vec3 {
  const e = elements.eccentricity;
  const a = elements.semiMajorAxisAu;

  // True anomaly v from E
  const cosV = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const sinV = (Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E)) / (1 - e * Math.cos(E));
  const v = Math.atan2(sinV, cosV);

  // Distance from central body r in AU
  const r = a * (1 - e * Math.cos(E));

  // Coordinates in orbital plane
  const xOrb = r * Math.cos(v);
  const yOrb = r * Math.sin(v);

  // Convert orbital angles to radians
  const inc = (elements.inclinationDeg * Math.PI) / 180;
  const omega = (elements.argumentOfPeriapsisDeg * Math.PI) / 180;
  const Omega = (elements.longitudeOfAscendingNodeDeg * Math.PI) / 180;

  // Coordinate transformation matrix from orbital plane to Ecliptic J2000
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);
  const cosI = Math.cos(inc);
  const sinI = Math.sin(inc);

  const Px = cosOmega * cosW - sinOmega * sinW * cosI;
  const Py = sinOmega * cosW + cosOmega * sinW * cosI;
  const Pz = sinW * sinI;

  const Qx = -cosOmega * sinW - sinOmega * cosW * cosI;
  const Qy = -sinOmega * sinW + cosOmega * sinW * cosI;
  const Qz = cosW * sinI;

  const xEcl = xOrb * Px + yOrb * Qx;
  const yEcl = xOrb * Py + yOrb * Qy;
  const zEcl = xOrb * Pz + yOrb * Qz;

  return { x: xEcl, y: yEcl, z: zEcl };
}

/**
 * Compute the 3D Heliocentric Ecliptic coordinates (in AU) from Keplerian elements at a given UTC timestamp.
 */
export function computeKeplerianPositionAu(elements: KeplerianElements, epochMs: number): Vec3 {
  const yearsSinceJ2000 = (epochMs - J2000_EPOCH_MS) / (365.25 * 86400 * 1000);
  const n = (Math.PI * 2) / elements.periodYears; // Mean motion (rad/yr)
  const M0 = (elements.meanAnomalyEpochDeg * Math.PI) / 180;
  const M = M0 + n * yearsSinceJ2000;

  const E = solveKeplerEccentricAnomaly(M, elements.eccentricity);
  return computeKeplerianPositionFromE(elements, E);
}

/**
 * Generate 3D orbit trajectory points in scene space for a minor body.
 * CRITICAL FIX: Samples uniformly in Eccentric Anomaly E (0 to 2pi), guaranteeing
 * a 100% smooth, continuous ellipse without kinks or corners even for extreme eccentricity comets!
 */
export function computeMinorBodyOrbitPath(
  elements: KeplerianElements,
  mode: LayoutMode,
  segments = 360,
): Vec3[] {
  const points: Vec3[] = [];

  for (let i = 0; i <= segments; i++) {
    const E = (i / segments) * Math.PI * 2;
    const posAu = computeKeplerianPositionFromE(elements, E);

    if (mode === "scientific") {
      points.push(toSceneAxes(posAu, SCIENTIFIC_UNITS_PER_AU));
    } else {
      const dist = Math.sqrt(posAu.x * posAu.x + posAu.y * posAu.y + posAu.z * posAu.z);
      const compressedDist = Math.pow(dist, 0.5) * 7;
      const scale = dist > 0 ? compressedDist / dist : 0;
      points.push(toSceneAxes(posAu, scale));
    }
  }

  return points;
}

// ─────────────────────────────────────────────────────────────────────────────
// Asteroid Belt Instanced Particle Distribution Generator
// ─────────────────────────────────────────────────────────────────────────────

export interface InstancedAsteroid {
  readonly semiMajorAxisAu: number;
  readonly eccentricity: number;
  readonly inclinationRad: number;
  readonly nodeRad: number;
  readonly argPeriapsisRad: number;
  readonly initialMeanAnomalyRad: number;
  readonly orbitalSpeedRadPerSec: number;
  readonly scale: number;
  readonly colorHex: string;
}

function isInsideKirkwoodGap(a: number): boolean {
  const gaps = [
    { center: 2.065, width: 0.025 }, // 4:1 resonance
    { center: 2.502, width: 0.045 }, // 3:1 resonance
    { center: 2.825, width: 0.035 }, // 5:2 resonance
    { center: 2.958, width: 0.025 }, // 7:3 resonance
    { center: 3.277, width: 0.055 }, // 2:1 resonance (Hecuba gap)
  ];
  return gaps.some((g) => Math.abs(a - g.center) < g.width);
}

function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateAsteroidBeltData(count = 5000): InstancedAsteroid[] {
  const rand = createSeededRandom(1337);
  const asteroids: InstancedAsteroid[] = [];

  const colorPalette = [
    "#8a847e",
    "#a69e94",
    "#b8b1a5",
    "#7d7874",
    "#c4bcb0",
  ];

  let generated = 0;
  while (generated < count) {
    const u = rand();
    const a = 2.15 + u * 1.15;

    if (isInsideKirkwoodGap(a) && rand() > 0.12) {
      continue;
    }

    const e = 0.03 + rand() * 0.18;
    const incDeg = Math.abs((rand() + rand() - 1) * 14);
    const incRad = (incDeg * Math.PI) / 180;

    const nodeRad = rand() * Math.PI * 2;
    const argPeriapsisRad = rand() * Math.PI * 2;
    const initialMeanAnomalyRad = rand() * Math.PI * 2;

    const periodSeconds = Math.pow(a, 1.5) * 365.25 * 86400;
    const speedRadPerSec = (Math.PI * 2) / periodSeconds;

    const scale = 0.5 + rand() * 1.2;
    const colorHex = colorPalette[Math.floor(rand() * colorPalette.length)]!;

    asteroids.push({
      semiMajorAxisAu: a,
      eccentricity: e,
      inclinationRad: incRad,
      nodeRad,
      argPeriapsisRad,
      initialMeanAnomalyRad,
      orbitalSpeedRadPerSec: speedRadPerSec,
      scale,
      colorHex,
    });
    generated++;
  }

  return asteroids;
}

export function generateKuiperBeltData(count = 3000): InstancedAsteroid[] {
  const rand = createSeededRandom(4242);
  const particles: InstancedAsteroid[] = [];

  const colorPalette = [
    "#829ba8",
    "#9fa8a3",
    "#b89c8a",
    "#c7b5a3",
  ];

  for (let i = 0; i < count; i++) {
    const a = 30 + rand() * 20;
    const e = 0.02 + rand() * 0.24;
    const incDeg = Math.abs((rand() + rand() - 1) * 24);
    const incRad = (incDeg * Math.PI) / 180;

    const nodeRad = rand() * Math.PI * 2;
    const argPeriapsisRad = rand() * Math.PI * 2;
    const initialMeanAnomalyRad = rand() * Math.PI * 2;

    const periodSeconds = Math.pow(a, 1.5) * 365.25 * 86400;
    const speedRadPerSec = (Math.PI * 2) / periodSeconds;

    const scale = 0.6 + rand() * 1.4;
    const colorHex = colorPalette[Math.floor(rand() * colorPalette.length)]!;

    particles.push({
      semiMajorAxisAu: a,
      eccentricity: e,
      inclinationRad: incRad,
      nodeRad,
      argPeriapsisRad,
      initialMeanAnomalyRad,
      orbitalSpeedRadPerSec: speedRadPerSec,
      scale,
      colorHex,
    });
  }

  return particles;
}

export function computeCometTail(
  cometPosAu: Vec3,
  mode: LayoutMode,
): { tailEndPos: Vec3; tailLength: number; intensity: number } {
  const r = Math.sqrt(cometPosAu.x * cometPosAu.x + cometPosAu.y * cometPosAu.y + cometPosAu.z * cometPosAu.z) || 1;

  const antiSunUnit: Vec3 = {
    x: cometPosAu.x / r,
    y: cometPosAu.y / r,
    z: cometPosAu.z / r,
  };

  const intensity = Math.min(1.0, Math.max(0.0, Math.pow(2.8 / Math.max(r, 0.4), 1.8)));
  const tailLengthAu = intensity * 0.75;

  const tailEndAu: Vec3 = {
    x: cometPosAu.x + antiSunUnit.x * tailLengthAu,
    y: cometPosAu.y + antiSunUnit.y * tailLengthAu,
    z: cometPosAu.z + antiSunUnit.z * tailLengthAu,
  };

  let sceneTailEnd: Vec3;
  let sceneLength: number;

  if (mode === "scientific") {
    sceneTailEnd = toSceneAxes(tailEndAu, SCIENTIFIC_UNITS_PER_AU);
    sceneLength = tailLengthAu * SCIENTIFIC_UNITS_PER_AU;
  } else {
    const endDist = Math.sqrt(tailEndAu.x * tailEndAu.x + tailEndAu.y * tailEndAu.y + tailEndAu.z * tailEndAu.z);
    const compressed = Math.pow(endDist, 0.5) * 7;
    const scale = endDist > 0 ? compressed / endDist : 0;
    sceneTailEnd = toSceneAxes(tailEndAu, scale);
    sceneLength = Math.max(intensity * 1.8, 0.1);
  }

  return {
    tailEndPos: sceneTailEnd,
    tailLength: sceneLength,
    intensity,
  };
}
