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

/**
 * Compute the astronomical state of the Solar System for a UTC instant.
 * This is the only place real ephemeris work happens; it is deliberately
 * called at a controlled rate (not per animation frame).
 */
export function computeSolarSystemState(epochMs: number): SolarSystemState {
  const date = new Date(epochMs);
  const earthHelio = vec(HelioVector(Body.Earth, date));

  const bodies: Partial<Record<BodyId, BodyState>> = {};

  const makeState = (id: BodyId, helioAu: Vec3, geoAu: Vec3): BodyState => ({
    id,
    helioAu,
    geoAu,
    distanceFromEarthM: lengthAu(geoAu) * AU_IN_M,
    distanceFromSunM: lengthAu(helioAu) * AU_IN_M,
  });

  // Sun: heliocentric origin; geocentric vector from Astronomy Engine.
  bodies.sun = makeState("sun", { x: 0, y: 0, z: 0 }, vec(GeoVector(Body.Sun, date, true)));

  // Earth itself: distance from Earth is 0 (observer is Earth-centred).
  bodies.earth = makeState("earth", earthHelio, { x: 0, y: 0, z: 0 });

  for (const id of PLANET_ORDER) {
    if (id === "earth") continue;
    const helio = vec(HelioVector(ENGINE_BODY[id as Exclude<BodyId, "sun" | "moon" | "earth">], date));
    bodies[id] = makeState(id, helio, sub(helio, earthHelio));
  }

  // Moon: geocentric vector, heliocentric derived by adding Earth's position.
  const moonGeo = vec(GeoMoon(date));
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
