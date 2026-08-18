import { useEffect, useMemo, useRef } from "react";

import { computeSolarSystemState, type SolarSystemState } from "@/lib/orbit/ephemeris";
import { useOrbitStore } from "@/store/useOrbitStore";

/**
 * Base sampling interval in ms.
 * At ≤1 d/s we sample at 8 Hz (smooth).
 * At faster rates we throttle to 4 Hz to reduce CPU usage while
 * Three.js lerp still produces a visually seamless result.
 */
const SAMPLE_INTERVAL_SLOW_MS = 125; // 8 Hz — for ≤1 day/s
const SAMPLE_INTERVAL_FAST_MS = 250; // 4 Hz — for faster rates

/** Simulated seconds per real second threshold to switch intervals. */
const FAST_RATE_THRESHOLD_S = 86_400; // 1 day/s

/**
 * Module-level cache: if two components call useSolarSystemState() in the same
 * render pass (same epochMs), they share one computeSolarSystemState result
 * without storing derived state inside Zustand.
 */
let _cachedEpochMs: number | null = null;
let _cachedState: SolarSystemState | null = null;

function getCachedState(epochMs: number): SolarSystemState {
  if (_cachedEpochMs === epochMs && _cachedState !== null) {
    return _cachedState;
  }
  _cachedEpochMs = epochMs;
  _cachedState = computeSolarSystemState(epochMs);
  return _cachedState;
}

/**
 * Advances the canonical UTC simulation timestamp while playback is active.
 * Astronomy is recomputed at 8 Hz (slow) or 4 Hz (fast); the 3D scene
 * interpolates between samples via the lerp in BodyMesh.useFrame.
 */
export function usePlaybackClock(): void {
  const playbackRate = useOrbitStore((s) => s.playbackRate);
  const advance = useOrbitStore((s) => s.advance);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (playbackRate === 0) return;

    const interval =
      Math.abs(playbackRate) > FAST_RATE_THRESHOLD_S
        ? SAMPLE_INTERVAL_FAST_MS
        : SAMPLE_INTERVAL_SLOW_MS;

    lastRef.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const deltaRealSeconds = (now - lastRef.current) / 1000;
      lastRef.current = now;
      advance(deltaRealSeconds * playbackRate);
    }, interval);

    return () => window.clearInterval(id);
  }, [playbackRate, advance]);
}

/**
 * Memoized astronomical snapshot for the current simulation instant.
 * Module-level caching ensures multiple callers in the same render get the
 * same object without redundant computeSolarSystemState() calls.
 */
export function useSolarSystemState(): SolarSystemState {
  const epochMs = useOrbitStore((s) => s.epochMs);
  // useMemo guards against re-computing on unrelated re-renders of the
  // calling component; the module cache guards against same-tick duplicates
  // across different components.
  return useMemo(() => getCachedState(epochMs), [epochMs]);
}
