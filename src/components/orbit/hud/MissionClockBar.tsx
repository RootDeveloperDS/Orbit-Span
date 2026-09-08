import { useState, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Clock,
  ChevronUp,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PLAYBACK_RATES, useOrbitStore } from "@/store/useOrbitStore";

const QUICK_PRESETS = [
  { label: "Today (Live Now)", getMs: () => Date.now() },
  { label: "Voyager 1 Launch", ms: Date.parse("1977-09-05T12:56:00Z") },
  { label: "New Horizons Pluto Flyby", ms: Date.parse("2015-07-14T11:49:57Z") },
  { label: "JWST Launch", ms: Date.parse("2021-12-25T12:20:00Z") },
  { label: "Halley Perihelion (Next)", ms: Date.parse("2061-07-28T00:00:00Z") },
];

function formatSimTime(epochMs: number): { date: string; time: string } {
  const d = new Date(epochMs);
  const date = d.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const time = d.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return { date, time: `${time} UTC` };
}

function toIsoDateInput(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10);
}

export function MissionClockBar() {
  const epochMs = useOrbitStore((s) => s.epochMs);
  const setEpochMs = useOrbitStore((s) => s.setEpochMs);
  const now = useOrbitStore((s) => s.now);
  const playbackRate = useOrbitStore((s) => s.playbackRate);
  const setPlaybackRate = useOrbitStore((s) => s.setPlaybackRate);

  const [dateInput, setDateInput] = useState(() => toIsoDateInput(epochMs));

  const isPaused = playbackRate === 0;
  const isNearNow = Math.abs(epochMs - Date.now()) < 60000;

  const { date, time } = useMemo(() => formatSimTime(epochMs), [epochMs]);

  const handleTogglePlay = () => {
    if (isPaused) {
      // Default to 1 day/s if resuming
      setPlaybackRate(86400);
    } else {
      setPlaybackRate(0);
    }
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Date.parse(`${dateInput}T00:00:00Z`);
    if (!Number.isNaN(parsed)) {
      setEpochMs(parsed);
    }
  };

  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/60 bg-space-deep/85 px-2.5 py-1.5 shadow-2xl backdrop-blur-xl transition-all">
      {/* Play / Pause Toggle Button */}
      <button
        type="button"
        onClick={handleTogglePlay}
        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-all ${
          isPaused
            ? "bg-secondary/70 text-foreground hover:bg-secondary hover:scale-105"
            : "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(56,189,248,0.4)]"
        }`}
        title={isPaused ? "Play simulation" : "Pause simulation"}
        aria-label={isPaused ? "Play simulation" : "Pause simulation"}
      >
        {isPaused ? <Play className="h-3.5 w-3.5 fill-current ml-0.5" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
      </button>

      {/* Date & Time Capsule with Calendar Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-full bg-secondary/30 px-2.5 py-1 text-xs font-mono transition-all hover:bg-secondary/60 hover:text-primary"
            title="Click to jump to historic dates or change epoch"
          >
            <Clock className="h-3 w-3 text-primary shrink-0" />
            <span className="font-semibold text-foreground">{date}</span>
            <span className="text-muted-foreground hidden sm:inline">{time}</span>
            <ChevronUp className="h-3 w-3 text-muted-foreground opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side="top"
          sideOffset={10}
          className="w-72 border-border/70 bg-space-deep/95 p-3 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Epoch Navigation
            </span>
            <span className="text-[10px] text-primary font-mono">UTC Based</span>
          </div>

          <form onSubmit={handleCustomDateSubmit} className="mt-3 space-y-2">
            <label htmlFor="epoch-date-picker" className="text-[11px] text-muted-foreground block">
              Enter Date (YYYY-MM-DD):
            </label>
            <div className="flex items-center gap-2">
              <input
                id="epoch-date-picker"
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="flex-1 rounded-md border border-border/60 bg-secondary/30 px-2.5 py-1 font-mono text-xs text-foreground focus:border-primary/60 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Go
              </button>
            </div>
          </form>

          <div className="mt-3 pt-2 border-t border-border/40">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1.5">
              Historical Milestones
            </span>
            <div className="space-y-1">
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const targetMs = "getMs" in preset && preset.getMs ? preset.getMs() : preset.ms!;
                    setEpochMs(targetMs);
                    setDateInput(toIsoDateInput(targetMs));
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 text-[11px] text-foreground hover:bg-primary/15 hover:text-primary transition-colors text-left"
                >
                  <span>{preset.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {new Date("getMs" in preset && preset.getMs ? preset.getMs() : preset.ms!).getUTCFullYear()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Speed Selector Pills */}
      <div className="flex items-center gap-0.5 rounded-full bg-secondary/40 p-0.5" role="group" aria-label="Playback speeds">
        {PLAYBACK_RATES.filter((r) => r.value !== 0).map((rate) => {
          const isActive = playbackRate === rate.value;
          // Short label formatting
          const shortLabel = rate.label.replace("/s", "").trim();
          return (
            <button
              key={rate.label}
              type="button"
              onClick={() => setPlaybackRate(rate.value)}
              aria-pressed={isActive}
              className={`cursor-pointer rounded-full px-2 py-0.5 font-mono text-[10px] transition-all ${
                isActive
                  ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={`Simulation speed: ${rate.label}`}
            >
              {shortLabel}
            </button>
          );
        })}
      </div>

      {/* Reset to "Now" button */}
      <button
        type="button"
        onClick={() => {
          now();
          setDateInput(toIsoDateInput(Date.now()));
        }}
        className={`flex cursor-pointer items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-mono transition-all ${
          isNearNow
            ? "border-primary/40 bg-primary/10 text-primary font-medium"
            : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border"
        }`}
        title="Sync clock to real-world live time"
      >
        <RotateCcw className="h-3 w-3" />
        <span className="hidden sm:inline">Now</span>
      </button>
    </div>
  );
}
