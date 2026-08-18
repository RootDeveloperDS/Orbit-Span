import { describe, expect, it } from "vitest";

import { BODIES } from "../constants";
import { computeSolarSystemState } from "../ephemeris";
import {
  auRadius,
  focusDistance,
  layoutSolarSystem,
  SCIENTIFIC_UNITS_PER_AU,
} from "../sceneLayout";

const TEST_EPOCH = Date.UTC(2026, 5, 15, 12, 0, 0);

describe("sceneLayout", () => {
  it("calculates exact astronomical AU radii for bodies", () => {
    const rEarth = auRadius("earth");
    const rMoon = auRadius("moon");
    const rSun = auRadius("sun");
    const rJupiter = auRadius("jupiter");

    // Earth vs Moon diameter/radius ratio is ~3.667
    expect(rEarth / rMoon).toBeCloseTo(BODIES.earth.radiusM / BODIES.moon.radiusM, 5);
    expect(rEarth / rMoon).toBeGreaterThan(3.6);
    expect(rEarth / rMoon).toBeLessThan(3.7);

    // Sun vs Earth radius ratio is ~109.3
    expect(rSun / rEarth).toBeCloseTo(BODIES.sun.radiusM / BODIES.earth.radiusM, 4);
    expect(rSun / rEarth).toBeGreaterThan(108);

    // Jupiter vs Earth radius ratio is ~10.97
    expect(rJupiter / rEarth).toBeCloseTo(BODIES.jupiter.radiusM / BODIES.earth.radiusM, 4);
    expect(rJupiter / rEarth).toBeGreaterThan(10.5);
  });

  it("yields 100% exact real proportions when trueScaleUniverse is enabled", () => {
    const state = computeSolarSystemState(TEST_EPOCH);
    const placed = layoutSolarSystem(state, "scientific", true);

    const earth = placed.find((b) => b.id === "earth")!;
    const moon = placed.find((b) => b.id === "moon")!;
    const sun = placed.find((b) => b.id === "sun")!;
    const jupiter = placed.find((b) => b.id === "jupiter")!;

    // Exactly match AU radius * SCIENTIFIC_UNITS_PER_AU
    expect(earth.radius).toBeCloseTo(auRadius("earth") * SCIENTIFIC_UNITS_PER_AU, 8);
    expect(moon.radius).toBeCloseTo(auRadius("moon") * SCIENTIFIC_UNITS_PER_AU, 8);

    // Earth must be 3.67x larger than the Moon
    expect(earth.radius / moon.radius).toBeCloseTo(3.667, 2);

    // Sun must be ~109x larger than Earth
    expect(sun.radius / earth.radius).toBeCloseTo(109.3, 1);

    // Jupiter must be ~10.97x larger than Earth
    expect(jupiter.radius / earth.radius).toBeCloseTo(10.97, 1);
  });

  it("generates Moon's true 3D orbit trajectory around Earth in scientific mode", () => {
    const state = computeSolarSystemState(TEST_EPOCH);
    const placed = layoutSolarSystem(state, "scientific", true);
    const moon = placed.find((b) => b.id === "moon")!;

    expect(moon.orbitPathPoints.length).toBeGreaterThan(0);
  });

  it("calculates appropriate adaptive focus distances", () => {
    const state = computeSolarSystemState(TEST_EPOCH);
    const placed = layoutSolarSystem(state, "scientific", true);
    const earth = placed.find((b) => b.id === "earth")!;
    const moon = placed.find((b) => b.id === "moon")!;
    const sun = placed.find((b) => b.id === "sun")!;

    const distEarth = focusDistance(earth, "scientific", true);
    const distMoon = focusDistance(moon, "scientific", true);
    const distSun = focusDistance(sun, "scientific", true);

    expect(distEarth).toBeCloseTo(earth.radius * 3.5, 6);
    expect(distMoon).toBeCloseTo(moon.radius * 3.5, 6);
    expect(distSun).toBeCloseTo(sun.radius * 2.8, 6);

    // Earth focus distance is larger than Moon focus distance because Earth is 3.67x larger
    expect(distEarth).toBeGreaterThan(distMoon);
  });
});
