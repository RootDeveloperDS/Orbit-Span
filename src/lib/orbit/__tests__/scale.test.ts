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
});
