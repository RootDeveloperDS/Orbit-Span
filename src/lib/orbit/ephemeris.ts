/**
 * Planetary positions from Astronomy Engine (VSOP87 / heliocentric series).
 * Pure module: no React, no DOM, no network. All timestamps are UTC.
 */
import { Body, GeoMoon, GeoVector, HelioVector, type Vector } from "astronomy-engine";

import { AU_IN_M, PLANET_ORDER, type BodyId } from "./constants";

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface BodyState {
  readonly id: BodyId;
  /** Heliocentric ecliptic-ish position in AU (equatorial J2000 from Astronomy Engine). */
  readonly helioAu: Vec3;
  /** Geocentric position in AU. */
  readonly geoAu: Vec3;
  /** Distance from Earth's centre in metres. */
  readonly distanceFromEarthM: number;
  /** Distance from the Sun in metres. */
  readonly distanceFromSunM: number;
}

/** A fully-resolved astronomical snapshot for one instant. */
export interface SolarSystemState {
  /** Canonical UTC instant, milliseconds since epoch. */
  readonly epochMs: number;
  readonly bodies: Readonly<Record<BodyId, BodyState>>;
}

const ENGINE_BODY: Record<Exclude<BodyId, "sun" | "moon">, Body> = {
  mercury: Body.Mercury,
  venus: Body.Venus,
  earth: Body.Earth,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
};

function vec(v: Vector): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function lengthAu(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/** Earth obliquity of J2000 in radians (23.4392911 degrees). */
const OBLIQUITY_J2000_RAD = (23.4392911 * Math.PI) / 180;
const COS_EPS = Math.cos(OBLIQUITY_J2000_RAD);
const SIN_EPS = Math.sin(OBLIQUITY_J2000_RAD);

/**
 * Convert Equatorial J2000 coordinates (from Astronomy Engine)
 * into Ecliptic J2000 coordinates where planetary orbits lie near z = 0.
 */
export function eqToEcl(v: Vec3): Vec3 {
  return {
    x: v.x,
    y: v.y * COS_EPS + v.z * SIN_EPS,
    z: -v.y * SIN_EPS + v.z * COS_EPS,
  };
}

export const ORBITAL_PERIOD_DAYS: Record<Exclude<BodyId, "sun" | "moon">, number> = {
  mercury: 87.969,
  venus: 224.701,
  earth: 365.256,
  mars: 686.98,
  jupiter: 4332.59,
  saturn: 10759.22,
  uranus: 30685.4,
  neptune: 60189.0,
};

/**
 * Sample a planet's actual 3D ecliptic trajectory over 1 orbital period.
 * Vertex 0 is precisely at the planet's instantaneous position at epochMs.
 */
export function computePlanetOrbitPathEcl(
  id: Exclude<BodyId, "sun" | "moon">,
  epochMs: number,
  segments = 256,
): Vec3[] {
  const periodDays = ORBITAL_PERIOD_DAYS[id];
  const periodMs = periodDays * 86400 * 1000;
  const points: Vec3[] = [];
  const engineBody = ENGINE_BODY[id];

  for (let i = 0; i <= segments; i++) {
    const t = epochMs + (i / segments) * periodMs;
    const date = new Date(t);
    const helioEq = vec(HelioVector(engineBody, date));
    points.push(eqToEcl(helioEq));
  }

  return points;
}

/**
 * Sample the Moon's geocentric 3D ecliptic trajectory around Earth over 1 lunar sidereal period (~27.32 days).
 * Vertex 0 is precisely at the Moon's instantaneous offset from Earth at epochMs.
 * Returns offset vectors relative to Earth's centre in AU.
 */
export function computeMoonOrbitPathEcl(
  epochMs: number,
  segments = 128,
): Vec3[] {
  const periodDays = 27.32166;
  const periodMs = periodDays * 86400 * 1000;
  const points: Vec3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = epochMs + (i / segments) * periodMs;
    const date = new Date(t);
    const moonGeoEq = vec(GeoMoon(date));
    points.push(eqToEcl(moonGeoEq));
  }

  return points;
}

/**
 * Compute the astronomical state of the Solar System for a UTC instant.
 * Deliberately called at a controlled rate (not per animation frame).
 */
export function computeSolarSystemState(epochMs: number): SolarSystemState {
  const date = new Date(epochMs);
  const earthHelioEq = vec(HelioVector(Body.Earth, date));
  const earthHelio = eqToEcl(earthHelioEq);

  const bodies: Partial<Record<BodyId, BodyState>> = {};

  const makeState = (id: BodyId, helioAu: Vec3, geoAu: Vec3): BodyState => ({
    id,
    helioAu,
    geoAu,
    distanceFromEarthM: lengthAu(geoAu) * AU_IN_M,
    distanceFromSunM: lengthAu(helioAu) * AU_IN_M,
  });

  // Sun: heliocentric origin; geocentric vector from Astronomy Engine.
  const sunGeoEq = vec(GeoVector(Body.Sun, date, true));
  bodies.sun = makeState("sun", { x: 0, y: 0, z: 0 }, eqToEcl(sunGeoEq));

  // Earth itself: distance from Earth is 0 (observer is Earth-centred).
  bodies.earth = makeState("earth", earthHelio, { x: 0, y: 0, z: 0 });

  for (const id of PLANET_ORDER) {
    if (id === "earth") continue;
    const helioEq = vec(HelioVector(ENGINE_BODY[id as Exclude<BodyId, "sun" | "moon" | "earth">], date));
    const helio = eqToEcl(helioEq);
    bodies[id] = makeState(id, helio, sub(helio, earthHelio));
  }

  // Moon: geocentric vector, heliocentric derived by adding Earth's position.
  const moonGeoEq = vec(GeoMoon(date));
  const moonGeo = eqToEcl(moonGeoEq);
  bodies.moon = makeState(
    "moon",
    { x: earthHelio.x + moonGeo.x, y: earthHelio.y + moonGeo.y, z: earthHelio.z + moonGeo.z },
    moonGeo,
  );

  return { epochMs, bodies: bodies as Record<BodyId, BodyState> };
}

/** Linear interpolation between two snapshots, for smooth rendering between samples. */
export function lerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/** Distance in metres between Earth and a body at an instant. */
export function earthDistanceM(state: SolarSystemState, id: BodyId): number {
  return state.bodies[id].distanceFromEarthM;
}
