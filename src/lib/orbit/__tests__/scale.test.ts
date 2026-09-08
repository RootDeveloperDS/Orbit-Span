import { describe, expect, it } from "vitest";

import { AU_IN_M, EARTH_MEAN_DIAMETER_M } from "../constants";
import { buildScaledModel, formatModelLength, scaleFactor, toModelMetres } from "../scale";

describe("human scale engine", () => {
  it("maps Earth's diameter onto the reference size", () => {
    expect(toModelMetres(EARTH_MEAN_DIAMETER_M, 0.1)).toBeCloseTo(0.1, 12);
  });

  it("puts the Moon around 3 m for a 10 cm Earth", () => {
    const model = toModelMetres(3.84e8, 0.1);
    expect(model).toBeGreaterThan(2.5);
    expect(model).toBeLessThan(3.5);
  });

  it("puts the Sun around 1.17 km for a 10 cm Earth", () => {
    const model = toModelMetres(AU_IN_M, 0.1);
    expect(model).toBeGreaterThan(1100);
    expect(model).toBeLessThan(1250);
  });

  it("puts Neptune tens of km away for a 10 cm Earth", () => {
    const model = toModelMetres(29 * AU_IN_M, 0.1) / 1000;
    expect(model).toBeGreaterThan(20);
    expect(model).toBeLessThan(60);
  });

  it("scales linearly with the reference size", () => {
    expect(scaleFactor(0.5) / scaleFactor(0.1)).toBeCloseTo(5, 10);
  });

  it("builds a model from dynamic distances", () => {
    const model = buildScaledModel(0.1, { moon: 3.84e8, jupiter: 6.2e11 }, ["moon", "jupiter"]);
    expect(model[0]!.modelDiameterM).toBeCloseTo(0.1 * (3474800 / EARTH_MEAN_DIAMETER_M), 9);
    expect(model[1]!.modelDistanceM).toBeGreaterThan(model[0]!.modelDistanceM);
  });

  it("formats model lengths with sensible units", () => {
    expect(formatModelLength(0.003)).toContain("mm");
    expect(formatModelLength(0.35)).toContain("cm");
    expect(formatModelLength(3.2)).toContain("m");
    expect(formatModelLength(48000)).toContain("km");
  });

  it("calculates realistic journey times and everyday object matches", async () => {
    const { getClosestEverydayObject, computeJourneyTimes, formatHumanDuration } = await import("../humanScaleData");
    const { scaledSpeedOfLightMps } = await import("../scale");

    // Earth at 10cm matches Grapefruit/fist
    const earthObj = getClosestEverydayObject(0.1);
    expect(earthObj.name).toContain("Grapefruit");

    // Sun at ~10.9m matches house
    const sunObj = getClosestEverydayObject(10.9);
    expect(sunObj.name).toContain("house");

    // Scaled speed of light at 10cm Earth is ~2.35 m/s (~8.4 km/h)
    const cScaled = scaledSpeedOfLightMps(0.1);
    expect(cScaled).toBeGreaterThan(2.0);
    expect(cScaled).toBeLessThan(2.5);

    // Journey times for Sun to Earth (1170 m model distance)
    const journey = computeJourneyTimes(1170, 149597870700, 0.1);
    expect(journey.walkingSec).toBeGreaterThan(700);
    expect(journey.walkingSec).toBeLessThan(1000);
    expect(Math.round(journey.lightTimeSec)).toBe(499);

    expect(formatHumanDuration(500)).toBe("8m 20s");
    expect(formatHumanDuration(7200)).toBe("2 hrs");
  });
});

