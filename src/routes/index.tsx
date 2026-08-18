import { createFileRoute } from "@tanstack/react-router";

import { BodyReadout } from "@/components/orbit/BodyReadout";
import { BodySelector } from "@/components/orbit/BodySelector";
import { ModeSwitch } from "@/components/orbit/ModeSwitch";
import { TimeControls } from "@/components/orbit/TimeControls";
import { SceneHost } from "@/components/orbit/scene/SceneHost";
import { useOrbitStore } from "@/store/useOrbitStore";
import {
  ROUTE_SEO,
  BASE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  getBreadcrumbSchema,
} from "@/lib/seo-config";

const { title, description, keywords, breadcrumbs } = ROUTE_SEO.explorer;
const CANONICAL_URL = `${BASE_URL}/`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: keywords.join(", ") },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:image:alt", content: DEFAULT_OG_IMAGE_ALT },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      { name: "twitter:image:alt", content: DEFAULT_OG_IMAGE_ALT },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(getBreadcrumbSchema(breadcrumbs)),
      },
    ],
  }),
  component: ExplorerPage,
});

function ModeNotice() {
  const viewMode = useOrbitStore((s) => s.viewMode);
  const trueScaleUniverse = useOrbitStore((s) => s.trueScaleUniverse);
  const setTrueScaleUniverse = useOrbitStore((s) => s.setTrueScaleUniverse);
  const showLabels = useOrbitStore((s) => s.showLabels);
  const setShowLabels = useOrbitStore((s) => s.setShowLabels);

  if (viewMode === "exploration") {
    return (
      <div className="glass-panel pointer-events-auto flex items-center justify-between gap-3 p-2.5 text-[11px] text-foreground backdrop-blur-md">
        <span>
          Exploration mode: planet sizes are visually exaggerated and distances compressed.
        </span>
        <button
          type="button"
          onClick={() => setShowLabels(!showLabels)}
          className="shrink-0 cursor-pointer rounded border border-border/80 bg-secondary/80 px-2 py-0.5 text-[10px] font-mono text-secondary-foreground hover:bg-secondary transition-colors"
        >
          Labels: {showLabels ? "ON" : "OFF"}
        </button>
      </div>
    );
  }
  if (viewMode === "scientific") {
    return (
      <div className="glass-panel pointer-events-auto space-y-1.5 p-2.5 text-[11px] text-foreground backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-primary">
            {trueScaleUniverse ? "100% Real Universe Scale" : "Scientific Mode (Overview)"}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowLabels(!showLabels)}
              className="cursor-pointer rounded border border-border/80 bg-secondary/80 px-2 py-0.5 text-[10px] font-mono text-secondary-foreground hover:bg-secondary transition-colors"
              title="Toggle labels"
            >
              Labels: {showLabels ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => setTrueScaleUniverse(!trueScaleUniverse)}
              className="cursor-pointer rounded border border-primary/50 bg-primary/20 px-2 py-0.5 text-[10px] font-mono text-primary-foreground hover:bg-primary/30 transition-colors"
            >
              {trueScaleUniverse ? "Overview" : "100% Real"}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {trueScaleUniverse
            ? "Exact 1:1 physical radii & orbital distances. Earth is 3.67× larger than Moon at 60 Earth radii. Labels auto-fade on close inspection."
            : "True orbital distances with visible planet minimum sizes. Toggle 100% Real for pure physical scale."}
        </p>
      </div>
    );
  }
  return (
    <div className="glass-panel pointer-events-auto flex items-center justify-between gap-3 p-2.5 text-[11px] text-foreground backdrop-blur-md">
      <span>
        Human-scale mode: 3D view keeps a readable layout. See{" "}
        <span className="text-primary font-medium">Human Scale</span> tab for measured model.
      </span>
      <button
        type="button"
        onClick={() => setShowLabels(!showLabels)}
        className="shrink-0 cursor-pointer rounded border border-border/80 bg-secondary/80 px-2 py-0.5 text-[10px] font-mono text-secondary-foreground hover:bg-secondary transition-colors"
      >
        Labels: {showLabels ? "ON" : "OFF"}
      </button>
    </div>
  );
}

function ExplorerPage() {
  return (
    <div className="relative flex flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row">
      <div className="relative h-[52vh] min-h-[320px] w-full border-b border-border/60 lg:h-full lg:flex-1 lg:border-b-0">
        <SceneHost />
        <div className="absolute top-3 left-3 max-w-xs sm:max-w-sm z-20">
          <ModeNotice />
        </div>
        <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
          Drag to orbit · scroll to zoom · tap any body/label to focus
        </p>
      </div>

      <aside className="w-full shrink-0 p-3 lg:w-[380px] lg:border-l lg:border-border/60 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-3">
          <h1 className="px-1 text-xl font-semibold">Solar System Explorer</h1>
          <ModeSwitch />
          <TimeControls />
          <BodySelector />
          <BodyReadout />
        </div>
        <div className="border-t border-border/40 pt-4 mt-6 text-[10px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground uppercase tracking-wider block mb-1">Education Note</span>
          OrbitSpan is an educational tool. Every planet attracts you gravitationally, but there is no scientific evidence that planetary alignments determine destiny, personality or future events.
        </div>
      </aside>
    </div>
  );
}
