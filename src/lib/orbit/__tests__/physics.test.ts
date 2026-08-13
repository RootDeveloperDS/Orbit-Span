import { describe, expect, it } from "vitest";

import { AU_IN_M, BODIES, G } from "../constants";
import {
  EARTH_SURFACE_G,
  computeGravity,
  formatDistance,
  formatNumber,
  gravitationalAcceleration,
  gravitationalForce,
  logNormalize,
  surfaceGravity,
  toScientificParts,
} from "../physics";

describe("constants", () => {
  it("uses the CODATA gravitational constant", () => {
    expect(G).toBe(6.6743e-11);
  });
});

describe("gravitational acceleration", () => {
  it("reproduces Earth surface gravity within 0.5%", () => {
    const a = gravitationalAcceleration(BODIES.earth.massKg, BODIES.earth.radiusM);
    expect(a).toBeGreaterThan(9.75);
    expect(a).toBeLessThan(9.87);
  });

  it("follows the inverse-square law", () => {
    const near = gravitationalAcceleration(1e24, 1e7);
    const far = gravitationalAcceleration(1e24, 2e7);
    expect(near / far).toBeCloseTo(4, 6);
  });

  it("gives Jupiter a tiny pull at ~4.2 AU (order 1e-7 m/s^2)", () => {
    const a = gravitationalAcceleration(BODIES.jupiter.massKg, 4.2 * AU_IN_M);
    expect(a).toBeGreaterThan(1e-8);
    expect(a).toBeLessThan(1e-6);
  });

  it("gives the Moon a larger pull than Jupiter", () => {
    const moon = gravitationalAcceleration(BODIES.moon.massKg, 3.84e8);
    const jupiter = gravitationalAcceleration(BODIES.jupiter.massKg, 6.3e11);
    expect(moon).toBeGreaterThan(jupiter);
  });
});

describe("force vs acceleration", () => {
  it("scales force linearly with observer mass", () => {
    const a = gravitationalAcceleration(BODIES.sun.massKg, AU_IN_M);
    expect(gravitationalForce(140, a)).toBeCloseTo(2 * gravitationalForce(70, a), 10);
  });

  it("computeGravity reports an Earth-gravity ratio", () => {
    const r = computeGravity("sun", AU_IN_M, 70);
    expect(r.earthGravityRatio).toBeCloseTo(r.accelerationMs2 / EARTH_SURFACE_G, 12);
    expect(r.accelerationMs2).toBeGreaterThan(0.005);
    expect(r.accelerationMs2).toBeLessThan(0.007);
  });

  it("computes plausible surface gravities", () => {
    expect(surfaceGravity("mars")).toBeGreaterThan(3.5);
    expect(surfaceGravity("mars")).toBeLessThan(3.9);
    expect(surfaceGravity("jupiter")).toBeGreaterThan(23);
  });
});

describe("formatting", () => {
  it("produces accessible scientific notation parts", () => {
    const parts = toScientificParts(3.71e-7);
    expect(parts.exponent).toBe(-7);
    expect(parts.mantissa).toBe("3.710");
    expect(parts.spoken).toContain("times ten to the power of -7");
    expect(parts.plain).toBe("3.710e-7");
  });

  it("handles zero and non-finite input", () => {
    expect(toScientificParts(0).spoken).toBe("zero");
    expect(formatNumber(Number.NaN)).toBe("—");
  });

  it("switches to scientific notation only at the extremes", () => {
    expect(formatNumber(12.345)).toBe("12.345");
    expect(formatNumber(1.2e-9)).toContain("× 10^-9");
  });

  it("formats distances by magnitude", () => {
    expect(formatDistance(500)).toContain("m");
    expect(formatDistance(3.84e8)).toContain("km");
    expect(formatDistance(5 * AU_IN_M)).toContain("AU");
  });

  it("log-normalizes into 0..1", () => {
    expect(logNormalize(1e-6, 1e-9, 1e-3)).toBeCloseTo(0.5, 6);
    expect(logNormalize(1e-12, 1e-9, 1e-3)).toBe(0);
    expect(logNormalize(1, 1e-9, 1e-3)).toBe(1);
  });
});
