import {
  Layers,
  CircleDot,
  Orbit,
  Sparkles,
  Send,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

import { useOrbitStore } from "@/store/useOrbitStore";

export function SceneLayerControls() {
  const [expanded, setExpanded] = useState(false);

  const showMoons = useOrbitStore((s) => s.showMoons);
  const setShowMoons = useOrbitStore((s) => s.setShowMoons);

  const showMoonOrbits = useOrbitStore((s) => s.showMoonOrbits);
  const setShowMoonOrbits = useOrbitStore((s) => s.setShowMoonOrbits);

  const showAsteroidBelt = useOrbitStore((s) => s.showAsteroidBelt);
  const setShowAsteroidBelt = useOrbitStore((s) => s.setShowAsteroidBelt);

  const showKuiperBelt = useOrbitStore((s) => s.showKuiperBelt);
  const setShowKuiperBelt = useOrbitStore((s) => s.setShowKuiperBelt);

  const showSpacecraft = useOrbitStore((s) => s.showSpacecraft);
  const setShowSpacecraft = useOrbitStore((s) => s.setShowSpacecraft);

  const showLabels = useOrbitStore((s) => s.showLabels);
  const setShowLabels = useOrbitStore((s) => s.setShowLabels);

  return (
    <div className="glass-panel pointer-events-auto rounded-lg border border-border/80 bg-background/85 p-1.5 text-[10px] font-mono backdrop-blur-md shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between gap-2 px-1 py-0.5">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex cursor-pointer items-center gap-1.5 font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
          title="Toggle 3D Scene Celestial Layers"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Layers</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {/* Quick Compact Row when Collapsed */}
        {!expanded && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowMoons(!showMoons)}
              className={`cursor-pointer rounded px-1.5 py-0.5 transition-colors ${
                showMoons
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle Planetary Moons"
            >
              Moons
            </button>
            <button
              type="button"
              onClick={() => setShowAsteroidBelt(!showAsteroidBelt)}
              className={`cursor-pointer rounded px-1.5 py-0.5 transition-colors ${
                showAsteroidBelt
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle Asteroid Belt & Minor Bodies"
            >
              Belts
            </button>
            <button
              type="button"
              onClick={() => setShowSpacecraft(!showSpacecraft)}
              className={`cursor-pointer rounded px-1.5 py-0.5 transition-colors ${
                showSpacecraft
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle Historic Probes"
            >
              Probes
            </button>
          </div>
        )}
      </div>

      {/* Expanded Detailed Toggles */}
      {expanded && (
        <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-border/50 pt-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setShowMoons(!showMoons)}
            className={`flex cursor-pointer items-center justify-between gap-1.5 rounded px-2 py-1 transition-colors ${
              showMoons
                ? "bg-primary/25 text-primary border border-primary/50"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            <span className="flex items-center gap-1">
              <CircleDot className="h-3 w-3" /> Moons
            </span>
            <span className="text-[9px] opacity-80">{showMoons ? "ON" : "OFF"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMoonOrbits(!showMoonOrbits)}
            className={`flex cursor-pointer items-center justify-between gap-1.5 rounded px-2 py-1 transition-colors ${
              showMoonOrbits
                ? "bg-primary/25 text-primary border border-primary/50"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            <span className="flex items-center gap-1">
              <Orbit className="h-3 w-3" /> Moon Orbits
            </span>
            <span className="text-[9px] opacity-80">{showMoonOrbits ? "ON" : "OFF"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAsteroidBelt(!showAsteroidBelt)}
            className={`flex cursor-pointer items-center justify-between gap-1.5 rounded px-2 py-1 transition-colors ${
              showAsteroidBelt
                ? "bg-primary/25 text-primary border border-primary/50"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Asteroids
            </span>
            <span className="text-[9px] opacity-80">{showAsteroidBelt ? "ON" : "OFF"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowKuiperBelt(!showKuiperBelt)}
            className={`flex cursor-pointer items-center justify-between gap-1.5 rounded px-2 py-1 transition-colors ${
              showKuiperBelt
                ? "bg-primary/25 text-primary border border-primary/50"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Kuiper Belt
            </span>
            <span className="text-[9px] opacity-80">{showKuiperBelt ? "ON" : "OFF"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSpacecraft(!showSpacecraft)}
            className={`flex cursor-pointer items-center justify-between gap-1.5 rounded px-2 py-1 transition-colors ${
              showSpacecraft
                ? "bg-primary/25 text-primary border border-primary/50"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            <span className="flex items-center gap-1">
              <Send className="h-3 w-3" /> Probes
            </span>
            <span className="text-[9px] opacity-80">{showSpacecraft ? "ON" : "OFF"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`flex cursor-pointer items-center justify-between gap-1.5 rounded px-2 py-1 transition-colors ${
              showLabels
                ? "bg-primary/25 text-primary border border-primary/50"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" /> Labels
            </span>
            <span className="text-[9px] opacity-80">{showLabels ? "ON" : "OFF"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
