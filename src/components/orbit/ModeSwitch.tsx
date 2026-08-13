import { Button } from "@/components/ui/button";
import { useOrbitStore, type ViewMode } from "@/store/useOrbitStore";

const MODES: readonly { id: ViewMode; label: string; hint: string }[] = [
  {
    id: "scientific",
    label: "Scientific",
    hint: "True relative sizes and distances — planets become almost invisible dots.",
  },
  {
    id: "exploration",
    label: "Exploration",
    hint: "Sizes are visually exaggerated so bodies stay visible; distances are compressed for layout.",
  },
  {
    id: "human",
    label: "Human scale",
    hint: "Everything translated to a model where Earth is the size you choose.",
  },
];

export function ModeSwitch() {
  const viewMode = useOrbitStore((s) => s.viewMode);
  const setViewMode = useOrbitStore((s) => s.setViewMode);
  const active = MODES.find((m) => m.id === viewMode) ?? MODES[1]!;

  return (
    <div className="glass-panel space-y-2 p-3">
      <span className="instrument-label">Scale mode</span>
      <div className="grid grid-cols-3 gap-1.5">
        {MODES.map((mode) => (
          <Button
            key={mode.id}
            size="sm"
            variant={viewMode === mode.id ? "default" : "outline"}
            className="h-8 text-xs"
            aria-pressed={viewMode === mode.id}
            onClick={() => setViewMode(mode.id)}
          >
            {mode.label}
          </Button>
        ))}
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">{active.hint}</p>
    </div>
  );
}
