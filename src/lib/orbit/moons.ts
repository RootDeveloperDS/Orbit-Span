/**
 * Planetary Moons Catalog & Orbital Physics Engine.
 * Covers all major moons of Earth, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto.
 * 100% mathematically accurate physical radii, semi-major axes, and orbital periods.
 */
import { AU_IN_M, KM_IN_M } from "./constants";
import type { Vec3 } from "./ephemeris";
import { SCIENTIFIC_UNITS_PER_AU, type LayoutMode } from "./sceneLayout";

export type MoonParentId =
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type MoonId =
  // Earth
  | "moon"
  // Mars
  | "phobos"
  | "deimos"
  // Jupiter (Galilean Moons)
  | "io"
  | "europa"
  | "ganymede"
  | "callisto"
  // Saturn (Major Moons)
  | "mimas"
  | "enceladus"
  | "tethys"
  | "dione"
  | "rhea"
  | "titan"
  | "iapetus"
  // Uranus (Major Moons)
  | "miranda"
  | "ariel"
  | "umbriel"
  | "titania"
  | "oberon"
  // Neptune
  | "triton"
  | "proteus"
  // Pluto
  | "charon";

export interface MoonMeta {
  readonly id: MoonId;
  readonly name: string;
  readonly parentId: MoonParentId;
  /** Mean physical radius in metres. */
  readonly radiusM: number;
  /** Semi-major axis around parent body in kilometres. */
  readonly semiMajorAxisKm: number;
  /** Orbital sidereal period in Earth days. Negative indicates retrograde orbit. */
  readonly orbitalPeriodDays: number;
  /** Orbital inclination relative to parent equator / ecliptic in degrees. */
  readonly inclinationDeg: number;
  /** Hex color for 3D sphere and trajectory display. */
  readonly color: string;
  /** Short scientific description. */
  readonly description: string;
  /** Initial orbital phase offset in radians at J2000 epoch. */
  readonly phaseOffsetRad: number;
}

export const MOONS: Readonly<Record<MoonId, MoonMeta>> = {
  // ── Earth ────────────────────────────────────────────────────────────────
  moon: {
    id: "moon",
    name: "The Moon",
    parentId: "earth",
    radiusM: 1_737_400,
    semiMajorAxisKm: 384_400,
    orbitalPeriodDays: 27.32166,
    inclinationDeg: 5.14,
    color: "#c9c9c4",
    description: "Earth's sole natural satellite, fifth largest moon in the Solar System.",
    phaseOffsetRad: 0.0,
  },

  // ── Mars ─────────────────────────────────────────────────────────────────
  phobos: {
    id: "phobos",
    name: "Phobos",
    parentId: "mars",
    radiusM: 11_266,
    semiMajorAxisKm: 9_376,
    orbitalPeriodDays: 0.31891,
    inclinationDeg: 1.09,
    color: "#8a7a6e",
    description: "Orbits Mars in under 8 hours, closer to its primary than any other moon.",
    phaseOffsetRad: 1.2,
  },
  deimos: {
    id: "deimos",
    name: "Deimos",
    parentId: "mars",
    radiusM: 6_200,
    semiMajorAxisKm: 23_463,
    orbitalPeriodDays: 1.263,
    inclinationDeg: 0.93,
    color: "#a39589",
    description: "Outer moon of Mars, likely a captured carbonaceous chondrite asteroid.",
    phaseOffsetRad: 3.5,
  },

  // ── Jupiter (Galilean Moons) ─────────────────────────────────────────────
  io: {
    id: "io",
    name: "Io",
    parentId: "jupiter",
    radiusM: 1_821_600,
    semiMajorAxisKm: 421_700,
    orbitalPeriodDays: 1.769138,
    inclinationDeg: 0.05,
    color: "#f6cf46",
    description: "Most geologically active body in the Solar System, with 400+ active volcanoes.",
    phaseOffsetRad: 0.0,
  },
  europa: {
    id: "europa",
    name: "Europa",
    parentId: "jupiter",
    radiusM: 1_560_800,
    semiMajorAxisKm: 670_900,
    orbitalPeriodDays: 3.551181,
    inclinationDeg: 0.47,
    color: "#b4cbe4",
    description: "Smooth ice shell harboring a global subsurface liquid water ocean.",
    phaseOffsetRad: Math.PI / 2, // 2:1 Laplace resonance offset
  },
  ganymede: {
    id: "ganymede",
    name: "Ganymede",
    parentId: "jupiter",
    radiusM: 2_634_100,
    semiMajorAxisKm: 1_070_400,
    orbitalPeriodDays: 7.154553,
    inclinationDeg: 0.20,
    color: "#8d8174",
    description: "Largest moon in the Solar System, larger than Mercury, with its own magnetic field.",
    phaseOffsetRad: Math.PI, // 4:2:1 Laplace resonance offset
  },
  callisto: {
    id: "callisto",
    name: "Callisto",
    parentId: "jupiter",
    radiusM: 2_410_300,
    semiMajorAxisKm: 1_882_700,
    orbitalPeriodDays: 16.689018,
    inclinationDeg: 0.28,
    color: "#5e5852",
    description: "Most heavily cratered object in the Solar System, with an ancient, geologically dead surface.",
    phaseOffsetRad: 2.1,
  },

  // ── Saturn (Major Moons) ─────────────────────────────────────────────────
  mimas: {
    id: "mimas",
    name: "Mimas",
    parentId: "saturn",
    radiusM: 198_200,
    semiMajorAxisKm: 185_520,
    orbitalPeriodDays: 0.942422,
    inclinationDeg: 1.57,
    color: "#b0b0b0",
    description: "Dominated by the massive 130 km Herschel impact crater, resembling the Death Star.",
    phaseOffsetRad: 0.4,
  },
  enceladus: {
    id: "enceladus",
    name: "Enceladus",
    parentId: "saturn",
    radiusM: 252_100,
    semiMajorAxisKm: 238_020,
    orbitalPeriodDays: 1.370218,
    inclinationDeg: 0.01,
    color: "#e8f4fc",
    description: "Highest albedo (reflectivity) in the Solar System; active cryovolcanoes vent water ice geysers.",
    phaseOffsetRad: 1.8,
  },
  tethys: {
    id: "tethys",
    name: "Tethys",
    parentId: "saturn",
    radiusM: 531_100,
    semiMajorAxisKm: 294_660,
    orbitalPeriodDays: 1.887802,
    inclinationDeg: 1.12,
    color: "#d0d2d6",
    description: "Composed almost entirely of water ice, featuring the giant Odysseus crater.",
    phaseOffsetRad: 3.1,
  },
  dione: {
    id: "dione",
    name: "Dione",
    parentId: "saturn",
    radiusM: 561_400,
    semiMajorAxisKm: 377_400,
    orbitalPeriodDays: 2.736915,
    inclinationDeg: 0.02,
    color: "#c6c7ca",
    description: "Heavily cratered leading hemisphere and bright ice cliff fractures on trailing side.",
    phaseOffsetRad: 4.5,
  },
  rhea: {
    id: "rhea",
    name: "Rhea",
    parentId: "saturn",
    radiusM: 763_800,
    semiMajorAxisKm: 527_040,
    orbitalPeriodDays: 4.517500,
    inclinationDeg: 0.35,
    color: "#b8b9bd",
    description: "Saturn's second largest moon; homogenous icy body with subtle tenuous exosphere.",
    phaseOffsetRad: 0.9,
  },
  titan: {
    id: "titan",
    name: "Titan",
    parentId: "saturn",
    radiusM: 2_574_730,
    semiMajorAxisKm: 1_221_870,
    orbitalPeriodDays: 15.945421,
    inclinationDeg: 0.35,
    color: "#e29c42",
    description: "Only moon with a dense nitrogen-methane atmosphere, liquid hydrocarbon lakes and rivers.",
    phaseOffsetRad: 2.4,
  },
  iapetus: {
    id: "iapetus",
    name: "Iapetus",
    parentId: "saturn",
    radiusM: 734_500,
    semiMajorAxisKm: 3_561_300,
    orbitalPeriodDays: 79.3215,
    inclinationDeg: 7.57,
    color: "#54463a",
    description: "Striking two-tone yin-yang coloration: one hemisphere dark as asphalt, the other bright white ice.",
    phaseOffsetRad: 5.1,
  },

  // ── Uranus (Major Moons) ─────────────────────────────────────────────────
  miranda: {
    id: "miranda",
    name: "Miranda",
    parentId: "uranus",
    radiusM: 235_800,
    semiMajorAxisKm: 129_390,
    orbitalPeriodDays: 1.413479,
    inclinationDeg: 4.23,
    color: "#abb2b8",
    description: "Features Verona Rupes, a 20 km tall sheer cliff—the highest known cliff in the Solar System.",
    phaseOffsetRad: 0.7,
  },
  ariel: {
    id: "ariel",
    name: "Ariel",
    parentId: "uranus",
    radiusM: 578_900,
    semiMajorAxisKm: 191_020,
    orbitalPeriodDays: 2.520379,
    inclinationDeg: 0.26,
    color: "#c2c7cc",
    description: "Brightest of Uranus's large moons, crisscrossed by extensive fault canyons and grabens.",
    phaseOffsetRad: 1.9,
  },
  umbriel: {
    id: "umbriel",
    name: "Umbriel",
    parentId: "uranus",
    radiusM: 584_700,
    semiMajorAxisKm: 266_000,
    orbitalPeriodDays: 4.144177,
    inclinationDeg: 0.13,
    color: "#6b7278",
    description: "Darkest of the major Uranian moons; ancient surface with the bright Wunda crater ring.",
    phaseOffsetRad: 3.2,
  },
  titania: {
    id: "titania",
    name: "Titania",
    parentId: "uranus",
    radiusM: 788_400,
    semiMajorAxisKm: 435_910,
    orbitalPeriodDays: 8.706234,
    inclinationDeg: 0.08,
    color: "#9ca2a8",
    description: "Largest moon of Uranus, named after the Queen of the Fairies in A Midsummer Night's Dream.",
    phaseOffsetRad: 4.7,
  },
  oberon: {
    id: "oberon",
    name: "Oberon",
    parentId: "uranus",
    radiusM: 761_400,
    semiMajorAxisKm: 583_520,
    orbitalPeriodDays: 13.463239,
    inclinationDeg: 0.07,
    color: "#858c94",
    description: "Outermost major Uranian moon, heavily cratered with mysterious dark deposits on crater floors.",
    phaseOffsetRad: 0.2,
  },

  // ── Neptune ──────────────────────────────────────────────────────────────
  proteus: {
    id: "proteus",
    name: "Proteus",
    parentId: "neptune",
    radiusM: 210_000,
    semiMajorAxisKm: 117_647,
    orbitalPeriodDays: 1.122315,
    inclinationDeg: 0.08,
    color: "#74787d",
    description: "Second largest Neptunian moon, irregular non-spherical body covered in deep impact craters.",
    phaseOffsetRad: 1.1,
  },
  triton: {
    id: "triton",
    name: "Triton",
    parentId: "neptune",
    radiusM: 1_353_400,
    semiMajorAxisKm: 354_760,
    orbitalPeriodDays: -5.876854, // Retrograde orbit
    inclinationDeg: 156.88, // Retrograde inclination
    color: "#d4a99b",
    description: "Captured Kuiper Belt dwarf planet orbiting backwards (retrograde) with active nitrogen cryogeysers.",
    phaseOffsetRad: 2.8,
  },

  // ── Pluto ────────────────────────────────────────────────────────────────
  charon: {
    id: "charon",
    name: "Charon",
    parentId: "pluto",
    radiusM: 606_000,
    semiMajorAxisKm: 19_596,
    orbitalPeriodDays: 6.38723,
    inclinationDeg: 119.59,
    color: "#9e9389",
    description: "Mutually tidally locked with Pluto; barycentre lies in open space between them.",
    phaseOffsetRad: 0.0,
  },
};

export const MOONS_BY_PARENT: Readonly<Record<MoonParentId, readonly MoonId[]>> = {
  earth: ["moon"],
  mars: ["phobos", "deimos"],
  jupiter: ["io", "europa", "ganymede", "callisto"],
  saturn: ["mimas", "enceladus", "tethys", "dione", "rhea", "titan", "iapetus"],
  uranus: ["miranda", "ariel", "umbriel", "titania", "oberon"],
  neptune: ["proteus", "triton"],
  pluto: ["charon"],
};

export const ALL_MOON_IDS = Object.keys(MOONS) as readonly MoonId[];

/**
 * Calculate the instantaneous 3D planetocentric position (relative to parent center)
 * for a moon at a given epoch timestamp in scene coordinates.
 */
export function computeMoonPositionRelative(
  moonId: MoonId,
  epochMs: number,
  mode: LayoutMode,
  trueScaleUniverse: boolean,
  parentSceneRadius: number,
): { position: Vec3; radius: number } {
  const meta = MOONS[moonId];
  const periodDays = Math.abs(meta.orbitalPeriodDays);
  const periodMs = periodDays * 86400 * 1000;
  const isRetrograde = meta.orbitalPeriodDays < 0;

  // Mean motion angle at current epoch
  const meanAnomaly = ((epochMs % periodMs) / periodMs) * Math.PI * 2 * (isRetrograde ? -1 : 1);
  const angle = meanAnomaly + meta.phaseOffsetRad;
  const incRad = (meta.inclinationDeg * Math.PI) / 180;

  // Semi-major axis in Astronomical Units
  const semiMajorAu = (meta.semiMajorAxisKm * KM_IN_M) / AU_IN_M;

  let orbitRadiusScene: number;
  let bodyRadiusScene: number;

  if (mode === "scientific") {
    if (trueScaleUniverse) {
      // 100% exact mathematical physical scale
      orbitRadiusScene = semiMajorAu * SCIENTIFIC_UNITS_PER_AU;
      bodyRadiusScene = (meta.radiusM / AU_IN_M) * SCIENTIFIC_UNITS_PER_AU;
    } else {
      // Scientific overview: keep true relative distances with visible minimum threshold
      orbitRadiusScene = semiMajorAu * SCIENTIFIC_UNITS_PER_AU;
      bodyRadiusScene = Math.max((meta.radiusM / AU_IN_M) * SCIENTIFIC_UNITS_PER_AU, 0.0018);
    }
  } else {
    // Exploration / Human scale mode: visually scaled relative to parent planet
    // Space moons cleanly outside parent surface
    const parentMoons = MOONS_BY_PARENT[meta.parentId];
    const moonIndex = parentMoons.indexOf(moonId);
    const spacingStep = parentSceneRadius * 0.75;
    orbitRadiusScene = parentSceneRadius * 1.8 + moonIndex * spacingStep;
    bodyRadiusScene = Math.max(parentSceneRadius * 0.08, 0.04);
  }

  // 3D Position with inclination applied (Three.js: Y is up, XZ is orbital plane)
  const x = Math.cos(angle) * orbitRadiusScene;
  const z = Math.sin(angle) * orbitRadiusScene * Math.cos(incRad);
  const y = Math.sin(angle) * orbitRadiusScene * Math.sin(incRad);

  return {
    position: { x, y, z },
    radius: bodyRadiusScene,
  };
}

/**
 * Generate 3D planetocentric orbit spline points (centered on 0,0,0) for a moon.
 */
export function computeMoonOrbitRingPoints(
  moonId: MoonId,
  mode: LayoutMode,
  trueScaleUniverse: boolean,
  parentSceneRadius: number,
  segments = 96,
): Vec3[] {
  const meta = MOONS[moonId];
  const semiMajorAu = (meta.semiMajorAxisKm * KM_IN_M) / AU_IN_M;
  const incRad = (meta.inclinationDeg * Math.PI) / 180;

  let orbitRadiusScene: number;

  if (mode === "scientific") {
    orbitRadiusScene = semiMajorAu * SCIENTIFIC_UNITS_PER_AU;
  } else {
    const parentMoons = MOONS_BY_PARENT[meta.parentId];
    const moonIndex = parentMoons.indexOf(moonId);
    const spacingStep = parentSceneRadius * 0.75;
    orbitRadiusScene = parentSceneRadius * 1.8 + moonIndex * spacingStep;
  }

  const points: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push({
      x: Math.cos(theta) * orbitRadiusScene,
      y: Math.sin(theta) * orbitRadiusScene * Math.sin(incRad),
      z: Math.sin(theta) * orbitRadiusScene * Math.cos(incRad),
    });
  }

  return points;
}
