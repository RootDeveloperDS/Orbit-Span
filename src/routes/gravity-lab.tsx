import { createFileRoute } from "@tanstack/react-router";

import { BodyReadout } from "@/components/orbit/BodyReadout";
import { BodySelector } from "@/components/orbit/BodySelector";
import { GravityChart } from "@/components/orbit/GravityChart";
import { MassInput } from "@/components/orbit/MassInput";
import { TimeControls } from "@/components/orbit/TimeControls";
import { useSolarSystemState } from "@/hooks/useSolarSystemState";

const TITLE = "Gravity Lab — how strongly each planet pulls on you | OrbitSpan";
const DESCRIPTION =
  "Enter your mass and see the real gravitational acceleration and force from the Sun, Moon and every planet at their current calculated distances.";

export const Route = createFileRoute("/gravity-lab")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: GravityLabPage,
});

function GravityLabPage() {
  const state = useSolarSystemState();

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      <header className="mb-5 max-w-2xl">
        <h1 className="text-2xl font-semibold">Gravity Lab</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Newton's law of universal gravitation, applied to you: a = G·M / r² gives the acceleration a
          body produces at your position, and F = m·a gives the force on your mass. Distances come
          from the same calculated planetary positions used in the 3D view.
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-3">
          <MassInput />
          <TimeControls />
          <BodySelector />
          <BodyReadout state={state} />
        </div>
        <div className="space-y-3">
          <GravityChart state={state} />
          <section className="glass-panel space-y-2 p-4">
            <h2 className="text-sm font-semibold">Reading these numbers</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">Acceleration (m/s²)</strong> is what the body does
                to any object at your location, regardless of how heavy that object is.
              </li>
              <li>
                <strong className="text-foreground">Force (N)</strong> is acceleration multiplied by
                your mass — double your mass and the force doubles.
              </li>
              <li>
                Because r is squared, moving twice as far away cuts the pull to a quarter. Earth–Mars
                distance changes by roughly a factor of seven over a synodic cycle, so Mars' pull on
                you varies by a factor of about fifty.
              </li>
              <li>
                A person standing a metre away from you produces an acceleration comparable to some
                planets, which is why physicists treat planetary tugs on a human body as negligible.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
