import { useState, useEffect } from "react";
import { Eye, ChevronRight, Compass } from "lucide-react";

import { useOrbitStore } from "@/store/useOrbitStore";
import { TopControlsBar } from "./TopControlsBar";
import { MissionClockBar } from "./MissionClockBar";
import { CelestialNavigator } from "./CelestialNavigator";
import { TelemetryInspector } from "./TelemetryInspector";
import { MobileInspectorDrawer } from "./MobileInspectorDrawer";

export function ExplorerHUD() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const playbackRate = useOrbitStore((s) => s.playbackRate);
  const setPlaybackRate = useOrbitStore((s) => s.setPlaybackRate);

  // Auto-fade the interaction hint after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setPlaybackRate(playbackRate === 0 ? 86400 : 0);
      } else if (e.key === "z" || e.key === "Z") {
        setIsZenMode((prev) => !prev);
      } else if (e.key === "Escape" && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playbackRate, isZenMode, setPlaybackRate]);

  // If in Zen mode, show only a minimal restore pill
  if (isZenMode) {
    return (
      <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-end p-4">
        <button
          type="button"
          onClick={() => setIsZenMode(false)}
          className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-space-deep/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-2xl backdrop-blur-xl transition-all hover:bg-secondary/60 hover:scale-105"
          title="Exit Zen Mode (or press Esc)"
        >
          <Eye className="h-3.5 w-3.5 text-primary" />
          <span>Exit Zen Mode</span>
          <span className="rounded bg-secondary/80 px-1.5 py-0.2 font-mono text-[9px] text-muted-foreground">
            Esc
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-4 overflow-hidden">
      {/* Top Floating Controls Bar */}
      <div className="flex items-start justify-between gap-3">
        <TopControlsBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode((prev) => !prev)}
        />
      </div>

      {/* Center Right: Desktop Collapsible Telemetry Panel */}
      <div className="pointer-events-none absolute right-3 top-16 bottom-16 hidden lg:flex items-start">
        {isSidebarOpen ? (
          <aside className="pointer-events-auto flex h-full max-h-[calc(100vh-10rem)] w-[360px] flex-col rounded-2xl border border-border/70 bg-space-deep/90 p-4 shadow-2xl backdrop-blur-2xl transition-all animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                <h1 className="text-sm font-semibold tracking-tight text-foreground">
                  Celestial Telemetry
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 pt-3">
              {/* Target Selector */}
              <div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider font-semibold block mb-2">
                  Select Target
                </span>
                <CelestialNavigator />
              </div>

              {/* Live Telemetry Inspector */}
              <div className="border-t border-border/40 pt-3">
                <TelemetryInspector />
              </div>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-l-xl border border-r-0 border-border/60 bg-space-deep/85 px-3 py-2 text-xs font-medium text-foreground shadow-2xl backdrop-blur-xl transition-all hover:bg-secondary/60 hover:pl-4"
            title="Expand Telemetry HUD"
          >
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span>Telemetry</span>
          </button>
        )}
      </div>

      {/* Bottom Controls Bar (Responsive: Clock + Mobile Drawer) */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
        {/* Interaction Gesture Hints */}
        {showHint ? (
          <div className="pointer-events-auto hidden md:flex items-center gap-2 rounded-full border border-border/40 bg-space-deep/70 px-3 py-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase backdrop-blur-md transition-opacity animate-in fade-in duration-500">
            <span>Orbit: Drag · Zoom: Scroll · Inspect: Tap Planet</span>
            <button
              type="button"
              onClick={() => setShowHint(false)}
              className="text-muted-foreground/60 hover:text-foreground cursor-pointer ml-1"
            >
              ×
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* Bottom Mission Clock & Mobile Inspector Drawer */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Drawer trigger (Visible only on mobile / tablet < lg) */}
          <div className="lg:hidden">
            <MobileInspectorDrawer />
          </div>

          {/* Mission Time Controls */}
          <MissionClockBar />
        </div>
      </div>
    </div>
  );
}
