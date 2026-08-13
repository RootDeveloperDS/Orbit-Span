/**
 * Newtonian gravity helpers and accessible number formatting.
 * Pure module: no React, no DOM.
 */
import { G, BODIES, type BodyId } from "./constants";

/** Earth's standard surface gravitational acceleration, m/s². */
export const EARTH_SURFACE_G = 9.80665;

/**
 * Gravitational acceleration produced by a mass at a distance.
 * a = G * M / r²
 */
export function gravitationalAcceleration(massKg: number, distanceM: number): number {
  if (distanceM <= 0) return Number.POSITIVE_INFINITY;
  return (G * massKg) / (distanceM * distanceM);
}

/**
 * Gravitational force on a test mass.
 * F = m * a
 */
export function gravitationalForce(testMassKg: number, accelerationMs2: number): number {
  return testMassKg * accelerationMs2;
}

export interface GravityResult {
  readonly bodyId: BodyId;
  readonly distanceM: number;
  /** Acceleration at the observer, m/s². */
  readonly accelerationMs2: number;
  /** Force on the observer's mass, newtons. */
  readonly forceN: number;
  /** Ratio of this acceleration to Earth surface gravity (dimensionless). */
  readonly earthGravityRatio: number;
}

export function computeGravity(
  bodyId: BodyId,
  distanceM: number,
  observerMassKg: number,
): GravityResult {
  const accelerationMs2 = gravitationalAcceleration(BODIES[bodyId].massKg, distanceM);
  return {
    bodyId,
    distanceM,
    accelerationMs2,
    forceN: gravitationalForce(observerMassKg, accelerationMs2),
    earthGravityRatio: accelerationMs2 / EARTH_SURFACE_G,
  };
}

/** Surface gravity of a body (for reference/education). */
export function surfaceGravity(bodyId: BodyId): number {
  const body = BODIES[bodyId];
  return gravitationalAcceleration(body.massKg, body.radiusM);
}

export interface SciParts {
  readonly mantissa: string;
  readonly exponent: number;
  /** Screen-reader friendly phrasing. */
  readonly spoken: string;
  /** Plain-text fallback, e.g. "3.71e-7". */
  readonly plain: string;
}

/**
 * Split a value into scientific-notation parts, including an accessible
 * spoken form (screen readers mispronounce "1.2×10⁻⁷").
 */
export function toScientificParts(value: number, digits = 3): SciParts {
  if (!Number.isFinite(value) || value === 0) {
    return { mantissa: "0", exponent: 0, spoken: "zero", plain: "0" };
  }
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissaNum = value / 10 ** exponent;
  const mantissa = mantissaNum.toFixed(digits);
  return {
    mantissa,
    exponent,
    spoken: `${mantissa} times ten to the power of ${exponent}`,
    plain: `${mantissa}e${exponent}`,
  };
}

/** Format numbers for display, switching to scientific notation at the extremes. */
export function formatNumber(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e6)) {
    const parts = toScientificParts(value, digits);
    return `${parts.mantissa} × 10^${parts.exponent}`;
  }
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

/** Human-readable distance: metres, kilometres or AU depending on magnitude. */
export function formatDistance(metres: number): string {
  const AU = 1.495978707e11;
  if (metres >= 0.01 * AU) {
    return `${formatNumber(metres / AU, 4)} AU`;
  }
  if (metres >= 1000) {
    return `${formatNumber(metres / 1000, 0)} km`;
  }
  return `${formatNumber(metres, 2)} m`;
}

/**
 * Normalised logarithmic position of a value inside [min, max], for
 * log-scale bar visualisations. Returns 0..1.
 */
export function logNormalize(value: number, min: number, max: number): number {
  if (value <= 0 || min <= 0 || max <= min) return 0;
  const t = (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
  return Math.min(1, Math.max(0, t));
}
