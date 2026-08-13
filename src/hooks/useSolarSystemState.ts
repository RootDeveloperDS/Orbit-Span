import { useEffect, useMemo, useRef } from "react";

import { computeSolarSystemState, type SolarSystemState } from "@/lib/orbit/ephemeris";
import { useOrbitStore } from "@/store/useOrbitStore";

/** Samples the canonical simulation clock at a controlled rate (not per frame). */
const SAMPLE_INTERVAL_MS = 125;

/**
 * Advances the canonical UTC simulation timestamp while playback is active.
 * Astronomy is recomputed at ~8 Hz; the 3D scene interpolates between samples.
 */
export function usePlaybackClock(): void {
  const playbackRate = useOrbitStore((s) => s.playbackRate);
  const advance = useOrbitStore((s) => s.advance);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (playbackRate === 0) return;
    lastRef.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const deltaRealSeconds = (now - lastRef.current) / 1000;
      lastRef.current = now;
      advance(deltaRealSeconds * playbackRate);
    }, SAMPLE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [playbackRate, advance]);
}

/** Memoized astronomical snapshot for the current simulation instant. */
export function useSolarSystemState(): SolarSystemState {
  const epochMs = useOrbitStore((s) => s.epochMs);
  return useMemo(() => computeSolarSystemState(epochMs), [epochMs]);
}
