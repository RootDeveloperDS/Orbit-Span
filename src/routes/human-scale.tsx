import { createFileRoute } from "@tanstack/react-router";

import { BodySelector } from "@/components/orbit/BodySelector";
import { HumanScalePanel } from "@/components/orbit/HumanScalePanel";
import { TimeControls } from "@/components/orbit/TimeControls";
import { useSolarSystemState } from "@/hooks/useSolarSystemState";

const TITLE = "Human Scale — the Solar System with a fist-sized Earth | OrbitSpan";
const DESCRIPTION =
  "Shrink Earth to 1 cm, a fist, or a metre and see where the Moon, Sun and planets would actually sit — computed live from real orbital positions.";

export const Route = createFileRoute("/human-scale")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: HumanScalePage,
});

function HumanScalePage() {
  const state = useSolarSystemState();

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      <header className="mb-5 max-w-2xl">
        <h1 className="text-2xl font-semibold">Human Scale</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Pick a size for Earth. Every diameter and distance below is the real value multiplied by the
          same ratio (your Earth ÷ 12,742 km), recomputed from the current planetary positions — so
          the numbers shift as the planets move.
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-3">
          <TimeControls />
          <BodySelector />
        </div>
        <HumanScalePanel state={state} />
      </div>
    </div>
  );
}
