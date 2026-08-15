import { createFileRoute } from "@tanstack/react-router";

import { BodyReadout } from "@/components/orbit/BodyReadout";
import { BodySelector } from "@/components/orbit/BodySelector";
import { ModeSwitch } from "@/components/orbit/ModeSwitch";
import { TimeControls } from "@/components/orbit/TimeControls";
import { SceneHost } from "@/components/orbit/scene/SceneHost";
import { useSolarSystemState } from "@/hooks/useSolarSystemState";
import { useOrbitStore } from "@/store/useOrbitStore";

const TITLE = "OrbitSpan — Solar System scale & real planetary positions";
const DESCRIPTION =
  "Explore an interactive 3D Solar System with real calculated planetary positions, true-scale distances and the gravitational pull each planet has on you.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ExplorerPage,
});

function ModeNotice() {
  const viewMode = useOrbitStore((s) => s.viewMode);
  if (viewMode === "exploration") {
    return (
      <p className="glass-panel px-3 py-2 text-[11px] text-foreground">
        Exploration mode: planet sizes are visually exaggerated and distances compressed for
        readability.
      </p>
    );
  }
  if (viewMode === "scientific") {
    return (
      <p className="glass-panel px-3 py-2 text-[11px] text-foreground">
        Scientific mode: true relative sizes and distances. At this scale the planets are almost
        invisible specks — that is the honest picture of the Solar System.
      </p>
    );
  }
  return (
    <p className="glass-panel px-3 py-2 text-[11px] text-foreground">
      Human-scale mode: the 3D view keeps a readable layout. Open{" "}
      <span className="text-primary">Human Scale</span> for the measured model distances.
    </p>
  );
}

function ExplorerPage() {
  const state = useSolarSystemState();

  return (
    <div className="relative flex flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row">
      <div className="relative h-[52vh] min-h-[320px] w-full border-b border-border/60 lg:h-full lg:flex-1 lg:border-b-0">
        <SceneHost />
        <div className="pointer-events-none absolute top-3 left-3 max-w-xs">
          <ModeNotice />
        </div>
        <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
          Drag to orbit · scroll to zoom · tap a body to focus
        </p>
      </div>

      <aside className="w-full shrink-0 p-3 lg:w-[380px] lg:border-l lg:border-border/60 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-3">
          <h1 className="px-1 text-xl font-semibold">Solar System Explorer</h1>
          <ModeSwitch />
          <TimeControls />
          <BodySelector />
          <BodyReadout state={state} />
        </div>
        <div className="border-t border-border/40 pt-4 mt-6 text-[10px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground uppercase tracking-wider block mb-1">Education Note</span>
          OrbitSpan is an educational tool. Every planet attracts you gravitationally, but there is no scientific evidence that planetary alignments determine destiny, personality or future events.
        </div>
      </aside>
    </div>
  );
}
