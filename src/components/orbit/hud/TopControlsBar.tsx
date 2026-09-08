import {
  Layers,
  Eye,
  EyeOff,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  CircleDot,
  Orbit,
  Send,
  Tag,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useOrbitStore, type ViewMode } from "@/store/useOrbitStore";

interface TopControlsBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

const MODES: readonly { id: ViewMode; label: string; short: string; hint: string }[] = [
  {
    id: "exploration",
    label: "Exploration",
    short: "Explore",
    hint: "Planets visually exaggerated & distances compressed for easy navigation.",
  },
  {
    id: "scientific",
    label: "Scientific",
    short: "Scientific",
    hint: "True astronomical orbital distances and proportional planetary scales.",
  },
  {
    id: "human",
    label: "Human Scale",
    short: "Human",
    hint: "Solar system scaled relative to a human reference (e.g. Earth = 10cm).",
  },
];

export function TopControlsBar({
  isSidebarOpen,
  onToggleSidebar,
  isZenMode,
  onToggleZenMode,
}: TopControlsBarProps) {
  const viewMode = useOrbitStore((s) => s.viewMode);
  const setViewMode = useOrbitStore((s) => s.setViewMode);
  const trueScaleUniverse = useOrbitStore((s) => s.trueScaleUniverse);
  const setTrueScaleUniverse = useOrbitStore((s) => s.setTrueScaleUniverse);

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

  const activeLayerCount = [
    showMoons,
    showMoonOrbits,
    showAsteroidBelt,
    showKuiperBelt,
    showSpacecraft,
    showLabels,
  ].filter(Boolean).length;

  return (
    <header className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-full border border-border/60 bg-space-deep/80 px-2 py-1.5 shadow-xl backdrop-blur-xl transition-all">
      {/* View Mode Segmented Pill */}
      <nav aria-label="Simulation scale mode" className="flex items-center rounded-full bg-secondary/40 p-0.5">
        {MODES.map((mode) => {
          const isActive = viewMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setViewMode(mode.id)}
              aria-pressed={isActive}
              title={mode.hint}
              className={`relative cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="hidden sm:inline">{mode.label}</span>
              <span className="sm:hidden">{mode.short}</span>
            </button>
          );
        })}
      </nav>

      {/* 100% Real Scale Pill (Only visible in Scientific mode) */}
      {viewMode === "scientific" && (
        <button
          type="button"
          onClick={() => setTrueScaleUniverse(!trueScaleUniverse)}
          className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
            trueScaleUniverse
              ? "border-primary/80 bg-primary/20 text-primary shadow-[0_0_10px_rgba(56,189,248,0.25)]"
              : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
          title={
            trueScaleUniverse
              ? "Exact 1:1 physical radii & cosmic distances"
              : "Switch to 100% true physical planetary radii"
          }
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              trueScaleUniverse ? "bg-primary animate-pulse" : "bg-muted-foreground/60"
            }`}
          />
          <span className="font-mono text-[11px]">1:1 Real</span>
        </button>
      )}

      {/* Layers Popover Menu */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/60 bg-secondary/30 px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-secondary/60 hover:border-border"
            title="Toggle Celestial Layers & Orbits"
          >
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Layers</span>
            <span className="rounded-full bg-primary/20 px-1.5 py-0.2 font-mono text-[10px] text-primary">
              {activeLayerCount}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-64 border-border/70 bg-space-deep/95 p-3 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Celestial Layers
            </span>
            <span className="text-[10px] text-primary font-mono">{activeLayerCount}/6 Active</span>
          </div>

          <div className="mt-2.5 space-y-2 text-xs">
            <label className="flex cursor-pointer items-center justify-between py-1 text-foreground hover:text-primary transition-colors">
              <span className="flex items-center gap-2">
                <CircleDot className="h-3.5 w-3.5 text-emerald-400" /> Moons
              </span>
              <Switch checked={showMoons} onCheckedChange={setShowMoons} />
            </label>

            <label className="flex cursor-pointer items-center justify-between py-1 text-foreground hover:text-primary transition-colors">
              <span className="flex items-center gap-2">
                <Orbit className="h-3.5 w-3.5 text-emerald-400/80" /> Moon Orbits
              </span>
              <Switch checked={showMoonOrbits} onCheckedChange={setShowMoonOrbits} />
            </label>

            <label className="flex cursor-pointer items-center justify-between py-1 text-foreground hover:text-primary transition-colors">
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Asteroid Belt
              </span>
              <Switch checked={showAsteroidBelt} onCheckedChange={setShowAsteroidBelt} />
            </label>

            <label className="flex cursor-pointer items-center justify-between py-1 text-foreground hover:text-primary transition-colors">
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Kuiper Belt
              </span>
              <Switch checked={showKuiperBelt} onCheckedChange={setShowKuiperBelt} />
            </label>

            <label className="flex cursor-pointer items-center justify-between py-1 text-foreground hover:text-primary transition-colors">
              <span className="flex items-center gap-2">
                <Send className="h-3.5 w-3.5 text-cyan-400" /> Deep Space Probes
              </span>
              <Switch checked={showSpacecraft} onCheckedChange={setShowSpacecraft} />
            </label>

            <div className="border-t border-border/40 pt-2">
              <label className="flex cursor-pointer items-center justify-between py-1 text-foreground hover:text-primary transition-colors">
                <span className="flex items-center gap-2 font-medium">
                  <Tag className="h-3.5 w-3.5 text-primary" /> Body Labels
                </span>
                <Switch checked={showLabels} onCheckedChange={setShowLabels} />
              </label>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Zen / Cinematic Mode Toggle */}
      <button
        type="button"
        onClick={onToggleZenMode}
        className="flex cursor-pointer items-center justify-center rounded-full border border-border/60 bg-secondary/30 p-1.5 text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground hover:border-border"
        title={isZenMode ? "Exit Zen Mode" : "Zen Mode (Hide all HUD overlays)"}
        aria-label="Toggle Zen mode"
      >
        {isZenMode ? <EyeOff className="h-3.5 w-3.5 text-primary" /> : <Eye className="h-3.5 w-3.5" />}
      </button>

      {/* Desktop HUD Sidebar Toggle */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="hidden lg:flex cursor-pointer items-center justify-center rounded-full border border-border/60 bg-secondary/30 p-1.5 text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground hover:border-border"
        title={isSidebarOpen ? "Collapse Telemetry HUD" : "Expand Telemetry HUD"}
        aria-label="Toggle Telemetry Sidebar"
      >
        {isSidebarOpen ? (
          <PanelRightClose className="h-3.5 w-3.5" />
        ) : (
          <PanelRightOpen className="h-3.5 w-3.5 text-primary" />
        )}
      </button>
    </header>
  );
}
