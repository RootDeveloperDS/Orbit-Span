import { useState } from "react";

import { BODIES, BODY_ORDER, type BodyId } from "@/lib/orbit/constants";
import { MOONS, ALL_MOON_IDS, type MoonId } from "@/lib/orbit/moons";
import { MINOR_BODIES, MINOR_BODY_ORDER, type MinorBodyId } from "@/lib/orbit/minorBodies";
import { SPACECRAFT, SPACECRAFT_ORDER, type SpacecraftId } from "@/lib/orbit/spacecraft";
import { useOrbitStore } from "@/store/useOrbitStore";

type SelectorCategory = "planets" | "moons" | "minor_bodies" | "spacecraft";

export function BodySelector() {
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);

  // Automatically select the active tab based on what body is selected
  const [activeTab, setActiveTab] = useState<SelectorCategory>(() => {
    if (selectedBody in MOONS) return "moons";
    if (selectedBody in MINOR_BODIES) return "minor_bodies";
    if (selectedBody in SPACECRAFT) return "spacecraft";
    return "planets";
  });

  return (
    <div className="glass-panel space-y-2.5 p-3">
      <div className="flex items-center justify-between">
        <span className="instrument-label">Target & Inspect</span>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-1 rounded-md bg-secondary/50 p-0.5 text-[10px] font-mono">
        <button
          type="button"
          onClick={() => setActiveTab("planets")}
          className={`cursor-pointer rounded px-1.5 py-1 text-center transition-all ${
            activeTab === "planets"
              ? "bg-background font-semibold text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Planets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("moons")}
          className={`cursor-pointer rounded px-1.5 py-1 text-center transition-all ${
            activeTab === "moons"
              ? "bg-background font-semibold text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Moons
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("minor_bodies")}
          className={`cursor-pointer rounded px-1.5 py-1 text-center transition-all ${
            activeTab === "minor_bodies"
              ? "bg-background font-semibold text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dwarfs/Comets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("spacecraft")}
          className={`cursor-pointer rounded px-1.5 py-1 text-center transition-all ${
            activeTab === "spacecraft"
              ? "bg-background font-semibold text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Probes
        </button>
      </div>

      {/* Bodies List for Active Tab */}
      <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto pr-1" role="group" aria-label="Select a body">
        {activeTab === "planets" &&
          BODY_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={selectedBody === id}
              onClick={() => selectBody(id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                selectedBody === id
                  ? "border-primary/60 bg-primary/20 text-foreground font-medium"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: BODIES[id].color }}
              />
              {BODIES[id].name}
            </button>
          ))}

        {activeTab === "moons" &&
          ALL_MOON_IDS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={selectedBody === id}
              onClick={() => selectBody(id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                selectedBody === id
                  ? "border-emerald-400/60 bg-emerald-950/40 text-emerald-200 font-medium"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: MOONS[id].color }}
              />
              {MOONS[id].name}
            </button>
          ))}

        {activeTab === "minor_bodies" &&
          MINOR_BODY_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={selectedBody === id}
              onClick={() => selectBody(id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                selectedBody === id
                  ? "border-amber-400/60 bg-amber-950/40 text-amber-200 font-medium"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: MINOR_BODIES[id].color }}
              />
              {MINOR_BODIES[id].name}
            </button>
          ))}

        {activeTab === "spacecraft" &&
          SPACECRAFT_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={selectedBody === id}
              onClick={() => selectBody(id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                selectedBody === id
                  ? "border-cyan-400/60 bg-cyan-950/40 text-cyan-200 font-medium"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: SPACECRAFT[id].color }}
              />
              {SPACECRAFT[id].name}
            </button>
          ))}
      </div>
    </div>
  );
}
