import { describe, expect, it } from "vitest";

import { AU_IN_M } from "../constants";
import { computeSolarSystemState, lengthAu, lerpVec } from "../ephemeris";

const J2020 = Date.UTC(2020, 0, 1, 0, 0, 0);
const J2026 = Date.UTC(2026, 5, 15, 12, 0, 0);

describe("ephemeris", () => {
  it("places Earth about 1 AU from the Sun", () => {
    const s = computeSolarSystemState(J2026);
    expect(lengthAu(s.bodies.earth.helioAu)).toBeGreaterThan(0.98);
    expect(lengthAu(s.bodies.earth.helioAu)).toBeLessThan(1.02);
  });

  it("places the Sun about 1 AU from Earth", () => {
    const s = computeSolarSystemState(J2026);
    const au = s.bodies.sun.distanceFromEarthM / AU_IN_M;
    expect(au).toBeGreaterThan(0.98);
    expect(au).toBeLessThan(1.02);
  });

  it("keeps the Moon within its real geocentric range", () => {
    const s = computeSolarSystemState(J2026);
    expect(s.bodies.moon.distanceFromEarthM).toBeGreaterThan(3.5e8);
    expect(s.bodies.moon.distanceFromEarthM).toBeLessThan(4.1e8);
  });

  it("keeps Earth-Jupiter distance in the 4.0-6.5 AU band and varying with time", () => {
    const a = computeSolarSystemState(J2020).bodies.jupiter.distanceFromEarthM / AU_IN_M;
    const b = computeSolarSystemState(J2026).bodies.jupiter.distanceFromEarthM / AU_IN_M;
    for (const d of [a, b]) {
      expect(d).toBeGreaterThan(3.9);
      expect(d).toBeLessThan(6.6);
    }
    expect(Math.abs(a - b)).toBeGreaterThan(0.01);
  });

  it("respects the ordering of heliocentric distances", () => {
    const s = computeSolarSystemState(J2026);
    expect(s.bodies.mercury.distanceFromSunM).toBeLessThan(s.bodies.venus.distanceFromSunM);
    expect(s.bodies.saturn.distanceFromSunM).toBeLessThan(s.bodies.uranus.distanceFromSunM);
    expect(s.bodies.uranus.distanceFromSunM).toBeLessThan(s.bodies.neptune.distanceFromSunM);
  });

  it("interpolates vectors linearly", () => {
    const v = lerpVec({ x: 0, y: 0, z: 0 }, { x: 2, y: 4, z: -2 }, 0.5);
    expect(v).toEqual({ x: 1, y: 2, z: -1 });
  });
});
