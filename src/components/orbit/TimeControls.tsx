import { Clock, Pause } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PLAYBACK_RATES, useOrbitStore } from "@/store/useOrbitStore";

function toUtcInputValue(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 16);
}

function fromUtcInputValue(value: string): number | null {
  const parsed = Date.parse(`${value}:00Z`);
  return Number.isNaN(parsed) ? null : parsed;
}

export function TimeControls() {
  const epochMs = useOrbitStore((s) => s.epochMs);
  const setEpochMs = useOrbitStore((s) => s.setEpochMs);
  const now = useOrbitStore((s) => s.now);
  const playbackRate = useOrbitStore((s) => s.playbackRate);
  const setPlaybackRate = useOrbitStore((s) => s.setPlaybackRate);

  return (
    <div className="glass-panel space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="instrument-label">Simulation time (UTC)</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {new Date(epochMs).toUTCString().replace("GMT", "UTC")}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="sim-time">
          Simulation date and time in UTC
        </label>
        <input
          id="sim-time"
          type="datetime-local"
          className="flex-1 rounded-md border border-input bg-secondary/50 px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={toUtcInputValue(epochMs)}
          onChange={(e) => {
            const next = fromUtcInputValue(e.target.value);
            if (next !== null) setEpochMs(next);
          }}
        />
        <Button size="sm" variant="secondary" onClick={now}>
          <Clock className="mr-1 h-3.5 w-3.5" /> Now
        </Button>
      </div>

      <div className="grid grid-cols-6 gap-1" role="group" aria-label="Playback speed">
        {PLAYBACK_RATES.map((rate) => (
          <Button
            key={rate.label}
            size="sm"
            variant={playbackRate === rate.value ? "default" : "outline"}
            className="h-7 px-1 font-mono text-[10px]"
            aria-pressed={playbackRate === rate.value}
            onClick={() => setPlaybackRate(rate.value)}
            title={`Speed: ${rate.label}`}
          >
            {rate.value === 0 ? <Pause className="h-3 w-3" /> : rate.label.replace("/s", "")}
          </Button>
        ))}
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Positions are computed from a single canonical UTC timestamp. Your local timezone is never
        used for the astronomy.
      </p>
    </div>
  );
}
