/**
 * Centralized SI constants and canonical body metadata.
 * Pure module: no React, no DOM, no side effects.
 */

/** Newtonian constant of gravitation (CODATA 2018), m^3 kg^-1 s^-2. */
export const G = 6.6743e-11;

/** Astronomical unit in metres (IAU 2012 definition). */
export const AU_IN_M = 1.495978707e11;

/** Metres per kilometre. */
export const KM_IN_M = 1000;

/** Mean Earth diameter used as the human-scale reference, in metres. */
export const EARTH_MEAN_DIAMETER_M = 12_742_000;

export type BodyId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "moon"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export interface BodyMeta {
  readonly id: BodyId;
  /** Display name. */
  readonly name: string;
  /** Mass in kilograms. */
  readonly massKg: number;
  /** Mean diameter in metres. */
  readonly diameterM: number;
  /** Mean equatorial radius in metres. */
  readonly radiusM: number;
  /** Approximate semi-major axis in AU (0 for the Sun, Moon uses geocentric orbit). */
  readonly semiMajorAxisAu: number;
  /** Restrained display colour (hex) used by the 3D scene. */
  readonly color: string;
  /** Short educational blurb. */
  readonly blurb: string;
}

function meta(
  id: BodyId,
  name: string,
  massKg: number,
  diameterM: number,
  semiMajorAxisAu: number,
  color: string,
  blurb: string,
): BodyMeta {
  return {
    id,
    name,
    massKg,
    diameterM,
    radiusM: diameterM / 2,
    semiMajorAxisAu,
    color,
    blurb,
  };
}

/** Canonical, typed body metadata. Masses and diameters from NASA/JPL fact sheets. */
export const BODIES: Readonly<Record<BodyId, BodyMeta>> = {
  sun: meta(
    "sun",
    "Sun",
    1.9885e30,
    1.3927e9,
    0,
    "#ffd9a0",
    "The Sun holds 99.86% of the Solar System's mass and dominates every orbit.",
  ),
  mercury: meta(
    "mercury",
    "Mercury",
    3.301e23,
    4_879_400,
    0.387,
    "#b8b3ab",
    "Smallest planet, fastest orbit — 88 days around the Sun.",
  ),
  venus: meta(
    "venus",
    "Venus",
    4.867e24,
    12_103_600,
    0.723,
    "#d9c08c",
    "Nearly Earth-sized, wrapped in a dense CO2 atmosphere.",
  ),
  earth: meta(
    "earth",
    "Earth",
    5.9722e24,
    EARTH_MEAN_DIAMETER_M,
    1,
    "#6fb3d9",
    "Our reference body: 1 g at the surface is 9.81 m/s².",
  ),
  moon: meta(
    "moon",
    "Moon",
    7.346e22,
    3_474_800,
    0.00257,
    "#c9c9c4",
    "Close enough that its tiny mass still raises Earth's tides.",
  ),
  mars: meta(
    "mars",
    "Mars",
    6.417e23,
    6_779_000,
    1.524,
    "#c1704a",
    "Half Earth's diameter, about one tenth its mass.",
  ),
  jupiter: meta(
    "jupiter",
    "Jupiter",
    1.8982e27,
    139_820_000,
    5.204,
    "#cda87f",
    "More massive than all other planets combined — yet still very far away.",
  ),
  saturn: meta(
    "saturn",
    "Saturn",
    5.6834e26,
    116_460_000,
    9.583,
    "#d8c68f",
    "Low density: it would float in a sufficiently large ocean.",
  ),
  uranus: meta(
    "uranus",
    "Uranus",
    8.681e25,
    50_724_000,
    19.191,
    "#8fc7cf",
    "An ice giant tipped on its side, orbiting in 84 years.",
  ),
  neptune: meta(
    "neptune",
    "Neptune",
    1.02409e26,
    49_244_000,
    30.07,
    "#6c8fd6",
    "The most distant planet, 30 times farther from the Sun than Earth.",
  ),
};

/** Ordered list used for lists, charts and the 3D scene. */
export const BODY_ORDER: readonly BodyId[] = [
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

/** Planets rendered as orbiting the Sun in the 3D scene. */
export const PLANET_ORDER: readonly BodyId[] = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];

/** Bodies whose gravitational pull on a person is compared (Earth excluded: surface gravity). */
export const GRAVITY_TARGETS: readonly BodyId[] = BODY_ORDER.filter((id) => id !== "earth");

export function getBody(id: BodyId): BodyMeta {
  return BODIES[id];
}
