import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useOrbitStore, type ViewMode } from "@/store/useOrbitStore";

const MODES: readonly { id: ViewMode; label: string; hint: string }[] = [
  {
    id: "scientific",
    label: "Scientific",
    hint: "True astronomical orbital distances and relative sizes across the Solar System.",
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
  const trueScaleUniverse = useOrbitStore((s) => s.trueScaleUniverse);
  const setTrueScaleUniverse = useOrbitStore((s) => s.setTrueScaleUniverse);
  const showLabels = useOrbitStore((s) => s.showLabels);
  const setShowLabels = useOrbitStore((s) => s.setShowLabels);
  const active = MODES.find((m) => m.id === viewMode) ?? MODES[1]!;

  return (
    <div className="glass-panel space-y-3 p-3">
      <div className="flex items-center justify-between">
        <span className="instrument-label">Scale mode</span>
        <button
          type="button"
          onClick={() => setShowLabels(!showLabels)}
          className={`cursor-pointer rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
            showLabels
              ? "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30"
              : "bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted"
          }`}
          title="Toggle 3D object name tags"
        >
          Labels: {showLabels ? "ON" : "OFF"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {MODES.map((mode) => (
          <Button
            key={mode.id}
            size="sm"
            variant={viewMode === mode.id ? "default" : "outline"}
            className="h-8 text-xs font-medium"
            aria-pressed={viewMode === mode.id}
            onClick={() => setViewMode(mode.id)}
          >
            {mode.label}
          </Button>
        ))}
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">{active.hint}</p>

      {/* 100% Real Universe Scale Toggle within Scientific Mode */}
      {viewMode === "scientific" && (
        <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 p-2.5 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="true-scale-switch" className="text-xs font-semibold text-foreground cursor-pointer">
                  100% Real Universe Scale
                </Label>
                <Badge variant={trueScaleUniverse ? "default" : "secondary"} className="h-4 px-1 text-[9px]">
                  {trueScaleUniverse ? "1:1 Real" : "Overview"}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {trueScaleUniverse
                  ? "Exact physical radii (Earth 3.67× Moon at 60 Earth radii). Auto-fading non-obtrusive labels."
                  : "Visible size threshold enabled for easy planet spotting."}
              </p>
            </div>
            <Switch
              id="true-scale-switch"
              checked={trueScaleUniverse}
              onCheckedChange={setTrueScaleUniverse}
            />
          </div>
        </div>
      )}

      {/* Human Scale Controls within ModeSwitch */}
      {viewMode === "human" && (
        <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 p-2.5 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-semibold">
              Everyday Scale Model
            </span>
            <span className="font-mono text-[9px] text-muted-foreground">Walking Radar Active</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Distances mapped to human journeys. 3D metric radar rings and the slowed-down "Human Photon" are rendered live on the scene plane.
          </p>
        </div>
      )}

    </div>
  );
}
