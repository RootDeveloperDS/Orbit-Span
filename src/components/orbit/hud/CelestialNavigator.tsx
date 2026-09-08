import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import { BODIES, BODY_ORDER, type BodyId } from "@/lib/orbit/constants";
import { MOONS, ALL_MOON_IDS, type MoonId } from "@/lib/orbit/moons";
import { MINOR_BODIES, MINOR_BODY_ORDER, type MinorBodyId } from "@/lib/orbit/minorBodies";
import { SPACECRAFT, SPACECRAFT_ORDER, type SpacecraftId } from "@/lib/orbit/spacecraft";
import { useOrbitStore } from "@/store/useOrbitStore";

type NavCategory = "planets" | "moons" | "minor_bodies" | "spacecraft";

const CATEGORIES: { id: NavCategory; label: string }[] = [
  { id: "planets", label: "Planets" },
  { id: "moons", label: "Moons" },
  { id: "minor_bodies", label: "Dwarfs / Comets" },
  { id: "spacecraft", label: "Probes" },
];

export function CelestialNavigator() {
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);

  const [category, setCategory] = useState<NavCategory>(() => {
    if (selectedBody in MOONS) return "moons";
    if (selectedBody in MINOR_BODIES) return "minor_bodies";
    if (selectedBody in SPACECRAFT) return "spacecraft";
    return "planets";
  });

  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    switch (category) {
      case "planets":
        return BODY_ORDER.map((id) => ({
          id,
          name: BODIES[id].name,
          color: BODIES[id].color,
        }));
      case "moons":
        return ALL_MOON_IDS.map((id) => ({
          id,
          name: MOONS[id].name,
          color: MOONS[id].color,
        }));
      case "minor_bodies":
        return MINOR_BODY_ORDER.map((id) => ({
          id,
          name: MINOR_BODIES[id].name,
          color: MINOR_BODIES[id].color,
        }));
      case "spacecraft":
        return SPACECRAFT_ORDER.map((id) => ({
          id,
          name: SPACECRAFT[id].name,
          color: SPACECRAFT[id].color,
        }));
    }
  }, [category]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="space-y-2">
      {/* Category Tabs & Quick Search */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-secondary/30 p-0.5 text-[11px] font-mono flex-1">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  setSearch("");
                }}
                className={`cursor-pointer rounded px-1.5 py-1 text-center truncate transition-all ${
                  isActive
                    ? "bg-background font-semibold text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Chips Container */}
      <div
        className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1 select-none"
        role="group"
        aria-label="Celestial targets"
      >
        {filteredItems.map((item) => {
          const isSelected = selectedBody === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectBody(item.id)}
              aria-pressed={isSelected}
              className={`group flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all ${
                isSelected
                  ? "border-primary/80 bg-primary/20 text-foreground font-semibold shadow-[0_0_8px_rgba(56,189,248,0.3)] scale-102"
                  : "border-border/60 bg-secondary/20 text-muted-foreground hover:border-border hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                style={{
                  backgroundColor: item.color,
                  boxShadow: isSelected ? `0 0 6px ${item.color}` : "none",
                }}
              />
              <span className="truncate">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
