import { create } from "zustand";

import type { BodyId } from "@/lib/orbit/constants";
import type { EarthReferencePreset } from "@/lib/orbit/scale";

export type ViewMode = "scientific" | "exploration" | "human";

export type AnySelectableId = string;

export interface OrbitState {
  /** Canonical simulation instant, UTC milliseconds. */
  epochMs: number;
  /** Simulated seconds per real second. 0 = paused. */
  playbackRate: number;
  viewMode: ViewMode;
  /** When true in Scientific mode, uses 100% mathematically exact physical radii and real cosmic ratios. */
  trueScaleUniverse: boolean;
  /** Toggle visibility of floating 3D planet names and beacons. */
  showLabels: boolean;
  /** Layer toggles for Asteroid Belt, Kuiper Belt, Moons, and Spacecraft. */
  showAsteroidBelt: boolean;
  showKuiperBelt: boolean;
  showMoons: boolean;
  showMoonOrbits: boolean;
  showSpacecraft: boolean;
  selectedBody: BodyId | AnySelectableId;
  observerMassKg: number;
  earthReference: EarthReferencePreset;
  /** Custom Earth reference diameter in metres (used when earthReference === "custom"). */
  customEarthDiameterM: number;
  /** Reduced-effects / low-power rendering. */
  performanceMode: boolean;
  /** In Human Scale: 'realtime' (true 500s / 8.3min transit) vs 'preview' (~15s loop for demonstration). */
  photonSpeedMode: "realtime" | "preview";
  /** Visual scale pedestal comparison modal state. */
  isPedestalModalOpen: boolean;
  setIsPedestalModalOpen: (open: boolean) => void;
  /** City walk / Walk the Solar System modal state. */
  isCityWalkModalOpen: boolean;
  setIsCityWalkModalOpen: (open: boolean) => void;

  setEpochMs: (ms: number) => void;
  advance: (deltaSimSeconds: number) => void;
  now: () => void;
  setPlaybackRate: (rate: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setTrueScaleUniverse: (enabled: boolean) => void;
  setShowLabels: (show: boolean) => void;
  setShowAsteroidBelt: (show: boolean) => void;
  setShowKuiperBelt: (show: boolean) => void;
  setShowMoons: (show: boolean) => void;
  setShowMoonOrbits: (show: boolean) => void;
  setShowSpacecraft: (show: boolean) => void;
  selectBody: (id: BodyId | AnySelectableId) => void;
  setSelectedBody: (id: BodyId | AnySelectableId) => void;
  setObserverMassKg: (kg: number) => void;
  setEarthReference: (ref: EarthReferencePreset) => void;
  setCustomEarthDiameterM: (m: number) => void;
  setPerformanceMode: (on: boolean) => void;
  setPhotonSpeedMode: (mode: "realtime" | "preview") => void;
}

export const PLAYBACK_RATES: readonly { label: string; value: number }[] = [
  { label: "Paused", value: 0 },
  { label: "1 h/s", value: 3600 },
  { label: "1 d/s", value: 86400 },
  { label: "1 wk/s", value: 604800 },
  { label: "1 mo/s", value: 2592000 },
  { label: "1 yr/s", value: 31557600 },
];

export const useOrbitStore = create<OrbitState>((set) => ({
  epochMs: Date.now(),
  playbackRate: 0,
  viewMode: "exploration",
  trueScaleUniverse: false,
  showLabels: true,
  showAsteroidBelt: true,
  showKuiperBelt: true,
  showMoons: true,
  showMoonOrbits: true,
  showSpacecraft: true,
  selectedBody: "sun",
  observerMassKg: 70,
  earthReference: "10cm",
  customEarthDiameterM: 0.15,
  performanceMode: false,
  photonSpeedMode: "realtime",
  isPedestalModalOpen: false,
  setIsPedestalModalOpen: (open) => set({ isPedestalModalOpen: open }),
  isCityWalkModalOpen: false,
  setIsCityWalkModalOpen: (open) => set({ isCityWalkModalOpen: open }),
  setEpochMs: (ms) => set({ epochMs: ms }),
  advance: (deltaSimSeconds) => set((s) => ({ epochMs: s.epochMs + deltaSimSeconds * 1000 })),
  now: () => set({ epochMs: Date.now() }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setTrueScaleUniverse: (enabled) => set({ trueScaleUniverse: enabled }),
  setShowLabels: (show) => set({ showLabels: show }),
  setShowAsteroidBelt: (show) => set({ showAsteroidBelt: show }),
  setShowKuiperBelt: (show) => set({ showKuiperBelt: show }),
  setShowMoons: (show) => set({ showMoons: show }),
  setShowMoonOrbits: (show) => set({ showMoonOrbits: show }),
  setShowSpacecraft: (show) => set({ showSpacecraft: show }),
  selectBody: (id) => set({ selectedBody: id }),
  setSelectedBody: (id) => set({ selectedBody: id }),
  setObserverMassKg: (kg) => set({ observerMassKg: Number.isFinite(kg) ? kg : 70 }),
  setEarthReference: (ref) => set({ earthReference: ref }),
  setCustomEarthDiameterM: (m) => set({ customEarthDiameterM: m }),
  setPerformanceMode: (on) => set({ performanceMode: on }),
  setPhotonSpeedMode: (mode) => set({ photonSpeedMode: mode }),
}));

