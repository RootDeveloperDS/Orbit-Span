import { createFileRoute } from "@tanstack/react-router";

import { AU_IN_M, EARTH_MEAN_DIAMETER_M, G } from "@/lib/orbit/constants";
import { EARTH_SURFACE_G } from "@/lib/orbit/physics";

const TITLE = "Sources & Methodology | OrbitScale";
const DESCRIPTION =
  "The astronomy model, Newtonian calculation method, SI constants, data sources and visualization limitations behind OrbitScale.";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: SourcesPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-panel space-y-2 p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function SourcesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Sources & Methodology</h1>
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted-foreground">
        Every number in OrbitScale is computed in your browser from published constants and an
        open-source ephemeris. There is no server-side physics, no database and no live astronomy API.
      </p>

      <div className="space-y-3">
        <Section title="Astronomy model">
          <p>
            Positions come from{" "}
            <a
              className="text-primary underline underline-offset-2"
              href="https://github.com/cosinekitty/astronomy"
              target="_blank"
              rel="noreferrer noopener"
            >
              Astronomy Engine
            </a>{" "}
            by Don Cross (MIT licence), which implements VSOP87-derived planetary series and the
            Meeus/ELP lunar theory. OrbitScale calls <code>HelioVector</code> for heliocentric planet
            vectors, <code>GeoVector</code> for the Sun, and <code>GeoMoon</code> for the Moon, all in
            astronomical units on the equatorial J2000 frame.
          </p>
          <p>
            Earth-relative vectors are obtained by subtracting Earth's heliocentric vector, and
            distances are the Euclidean norms of those vectors converted to metres. A single canonical
            UTC timestamp drives the whole app; timezone conversion never enters the astronomy.
          </p>
          <p>
            Astronomy Engine documentation:{" "}
            <a
              className="text-primary underline underline-offset-2"
              href="https://github.com/cosinekitty/astronomy/tree/master/source/js"
              target="_blank"
              rel="noreferrer noopener"
            >
              JavaScript API reference
            </a>
            .
          </p>
        </Section>

        <Section title="Calculation method">
          <p>
            Gravity uses Newton's law of universal gravitation, not general relativity: acceleration
            a = G·M / r² with r measured centre-to-centre from Earth's centre, and force F = m·a for
            your chosen mass. The observer is treated as being at Earth's centre; the few thousand
            kilometres of Earth's radius are negligible at planetary distances.
          </p>
          <p>
            Human-scale figures multiply real lengths by the ratio (chosen Earth diameter ÷ real Earth
            mean diameter). Nothing is hardcoded: distances update whenever the simulation timestamp
            changes.
          </p>
        </Section>

        <Section title="Constants and body data">
          <ul className="list-disc space-y-1 pl-5 font-mono text-xs">
            <li>G = {G.toExponential(5)} m³ kg⁻¹ s⁻² (CODATA)</li>
            <li>1 AU = {AU_IN_M.toExponential(6)} m (IAU 2012)</li>
            <li>Earth mean diameter = {(EARTH_MEAN_DIAMETER_M / 1000).toLocaleString()} km</li>
            <li>Earth standard surface gravity = {EARTH_SURFACE_G} m/s²</li>
          </ul>
          <p>
            Masses, radii and orbital semi-major axes come from the NASA/JPL planetary fact sheets and
            are stored once, as typed metadata, in <code>src/lib/orbit/constants.ts</code>.
          </p>
        </Section>

        <Section title="Visualization limitations">
          <ul className="list-disc space-y-1 pl-5 text-xs">
            <li>
              Scientific mode uses true relative sizes and distances; bodies are clamped to a minimum
              of a few pixels so they remain clickable.
            </li>
            <li>
              Exploration mode compresses heliocentric distance by a square-root mapping and enlarges
              bodies by a sub-linear function of radius. Sizes there are not to scale, and the app says
              so persistently.
            </li>
            <li>
              Orbit rings are drawn as circles at each body's semi-major axis; real orbits are
              elliptical and slightly inclined, so the rendered ring is an approximation while the
              body's own position is genuine.
            </li>
            <li>
              The Moon is drawn at an exaggerated separation from Earth in the compressed layouts so it
              stays visible; its true distance is always shown numerically.
            </li>
            <li>
              Human-scale distances of tens of kilometres are presented as a measurement scale space and
              distance cards rather than a literal 3D world.
            </li>
            <li>
              Positions are sampled about eight times a second and interpolated between frames, so fast
              playback is smooth rather than frame-exact.
            </li>
          </ul>
        </Section>

        <Section title="Offline support">
          <p>
            A service worker caches the app shell and static assets so the core simulation keeps
            working without a connection once it has been loaded. This depends on browser support and
            available storage — if service workers are unavailable or registration fails, the header
            says so instead of promising offline availability.
          </p>
        </Section>

        <Section title="Scientific stance">
          <p>
            OrbitScale reports gravitational effects that are real but extremely small at planetary
            distances. It makes no claim that this smallness by itself refutes astrology; the
            scientific issue is the absence of established evidence for the claimed causal or
            predictive effects on personality, luck, relationships, destiny or future events.
          </p>
        </Section>
      </div>
    </div>
  );
}
