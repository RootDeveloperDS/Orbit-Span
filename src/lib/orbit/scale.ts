/**
 * Human-scale engine: translate real astronomical dimensions into a model
 * where Earth's diameter equals a chosen reference size.
 * Pure module: no React, no DOM.
 */
import { BODIES, EARTH_MEAN_DIAMETER_M, type BodyId } from "./constants";

export type EarthReferencePreset = "1cm" | "5cm" | "10cm" | "25cm" | "50cm" | "1m" | "custom";

export interface ReferenceOption {
  readonly id: EarthReferencePreset;
  readonly label: string;
  /** Reference Earth diameter in metres (undefined for custom). */
  readonly metres?: number;
  readonly note?: string;
}

export const REFERENCE_OPTIONS: readonly ReferenceOption[] = [
  { id: "1cm", label: "1 cm", metres: 0.01, note: "Marble" },
  { id: "5cm", label: "5 cm", metres: 0.05, note: "Golf ball" },
  { id: "10cm", label: "10 cm", metres: 0.1, note: "Approximate fist reference" },
  { id: "25cm", label: "25 cm", metres: 0.25, note: "Football" },
  { id: "50cm", label: "50 cm", metres: 0.5, note: "Beach ball" },
  { id: "1m", label: "1 m", metres: 1, note: "Exhibit globe" },
  { id: "custom", label: "Custom", note: "Set any Earth diameter" },
];

/** Scale factor: model metres per real metre. */
export function scaleFactor(referenceEarthDiameterM: number): number {
  return referenceEarthDiameterM / EARTH_MEAN_DIAMETER_M;
}

/** Convert a real length (m) into model length (m) at the chosen reference. */
export function toModelMetres(realMetres: number, referenceEarthDiameterM: number): number {
  return realMetres * scaleFactor(referenceEarthDiameterM);
}

/** Format a model-scale length using mm / cm / m / km as appropriate. */
export function formatModelLength(modelMetres: number): string {
  const abs = Math.abs(modelMetres);
  if (abs < 0.001) return `${(modelMetres * 1e6).toFixed(1)} µm`;
  if (abs < 0.01) return `${(modelMetres * 1000).toFixed(2)} mm`;
  if (abs < 1) return `${(modelMetres * 100).toFixed(2)} cm`;
  if (abs < 1000) return `${modelMetres.toFixed(2)} m`;
  return `${(modelMetres / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })} km`;
}

export interface ScaledBody {
  readonly id: BodyId;
  readonly name: string;
  /** Model diameter in metres. */
  readonly modelDiameterM: number;
  /** Model distance from Earth in metres (dynamic, from the ephemeris). */
  readonly modelDistanceM: number;
  /** Real distance from Earth in metres. */
  readonly realDistanceM: number;
}

/** Build the scaled model for a set of bodies using live distances. */
export function buildScaledModel(
  referenceEarthDiameterM: number,
  realDistancesM: Readonly<Partial<Record<BodyId, number>>>,
  ids: readonly BodyId[],
): ScaledBody[] {
  const k = scaleFactor(referenceEarthDiameterM);
  return ids.map((id) => {
    const realDistanceM = realDistancesM[id] ?? 0;
    return {
      id,
      name: BODIES[id].name,
      modelDiameterM: BODIES[id].diameterM * k,
      modelDistanceM: realDistanceM * k,
      realDistanceM,
    };
  });
}

/** Walking time at a relaxed 1.4 m/s, for intuition about model distances. */
export function walkingMinutes(modelMetres: number): number {
  return modelMetres / 1.4 / 60;
}

/** Scaled speed of light in model metres per second (e.g. 2.35 m/s or 8.4 km/h for 10cm Earth). */
export function scaledSpeedOfLightMps(referenceEarthDiameterM: number): number {
  return 299792458 * scaleFactor(referenceEarthDiameterM);
}

