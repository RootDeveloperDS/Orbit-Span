import { BODIES, type BodyId } from "@/lib/orbit/constants";
import { MOONS, type MoonId } from "@/lib/orbit/moons";
import { MINOR_BODIES, type MinorBodyId } from "@/lib/orbit/minorBodies";
import { SPACECRAFT, type SpacecraftId } from "@/lib/orbit/spacecraft";
import { EARTH_SURFACE_G, computeGravity, formatDistance, formatNumber } from "@/lib/orbit/physics";
import { useOrbitStore } from "@/store/useOrbitStore";
import { useSolarSystemState } from "@/hooks/useSolarSystemState";

import { SciValue } from "./SciValue";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1.5 last:border-0">
      <span className="instrument-label">{label}</span>
      <span className="text-right text-sm text-foreground">{children}</span>
    </div>
  );
}

export function BodyReadout() {
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const observerMassKg = useOrbitStore((s) => s.observerMassKg);
  const state = useSolarSystemState();

  // Check if selected body is a standard planet / sun
  if (selectedBody in BODIES) {
    const meta = BODIES[selectedBody as BodyId];
    const bodyState = state.bodies[selectedBody as BodyId];
    const isEarth = selectedBody === "earth";
    const distanceM = isEarth ? meta.radiusM : bodyState?.distanceFromEarthM ?? 0;
    const gravity = computeGravity(selectedBody as BodyId, distanceM, observerMassKg);

    return (
      <div className="glass-panel space-y-1 p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{meta.name}</h2>
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: meta.color }}
          />
        </div>
        <p className="pb-2 text-xs leading-relaxed text-muted-foreground">{meta.blurb}</p>

        <Row label={isEarth ? "Surface distance" : "Distance from Earth"}>
          {formatDistance(distanceM)}
        </Row>
        <Row label="Mass">
          <SciValue value={meta.massKg} unit="kg" />
        </Row>
        <Row label="Acceleration on you">
          {gravity.accelerationMs2 >= 0.001 ? (
            `${formatNumber(gravity.accelerationMs2, 3)} m/s²`
          ) : (
            <SciValue value={gravity.accelerationMs2} unit="m/s²" />
          )}
        </Row>
        <Row label={`Force on ${formatNumber(observerMassKg, 1)} kg`}>
          {gravity.forceN >= 0.001 ? (
            `${formatNumber(gravity.forceN, 3)} N`
          ) : (
            <SciValue value={gravity.forceN} unit="N" />
          )}
        </Row>
        <Row label="Vs Earth surface gravity">
          <SciValue value={gravity.earthGravityRatio} />
        </Row>
        <p className="pt-2 text-[11px] leading-relaxed text-muted-foreground">
          Earth's surface gravity is {EARTH_SURFACE_G} m/s². Acceleration does not depend on your mass;
          the force you feel does.
        </p>
      </div>
    );
  }

  // Check if selected body is a Moon
  if (selectedBody in MOONS) {
    const moon = MOONS[selectedBody as MoonId];
    const parentMeta = BODIES[moon.parentId as BodyId] || { name: moon.parentId };

    return (
      <div className="glass-panel space-y-1 p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase text-primary tracking-wider">
              Moon of {parentMeta.name}
            </span>
            <h2 className="text-lg font-semibold">{moon.name}</h2>
          </div>
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: moon.color }}
          />
        </div>
        <p className="pb-2 text-xs leading-relaxed text-muted-foreground">{moon.description}</p>

        <Row label="Semi-major axis">
          {formatNumber(moon.semiMajorAxisKm, 0)} km
        </Row>
        <Row label="Orbital period">
          {Math.abs(moon.orbitalPeriodDays).toFixed(2)} Earth days
          {moon.orbitalPeriodDays < 0 ? " (Retrograde)" : ""}
        </Row>
        <Row label="Mean radius">
          {formatNumber(moon.radiusM / 1000, 1)} km
        </Row>
        <Row label="Inclination">
          {moon.inclinationDeg.toFixed(2)}°
        </Row>
      </div>
    );
  }

  // Check if selected body is a Minor Body / Asteroid / Comet
  if (selectedBody in MINOR_BODIES) {
    const mb = MINOR_BODIES[selectedBody as MinorBodyId];

    return (
      <div className="glass-panel space-y-1 p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase text-amber-400 tracking-wider">
              {mb.category.replace("_", " ")}
            </span>
            <h2 className="text-lg font-semibold">{mb.name}</h2>
          </div>
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: mb.color }}
          />
        </div>
        <p className="pb-2 text-xs leading-relaxed text-muted-foreground">{mb.blurb}</p>

        <Row label="Semi-major axis">
          {mb.elements.semiMajorAxisAu.toFixed(3)} AU
        </Row>
        <Row label="Orbital period">
          {mb.elements.periodYears.toFixed(2)} years
        </Row>
        <Row label="Eccentricity">
          {mb.elements.eccentricity.toFixed(4)}
        </Row>
        <Row label="Inclination">
          {mb.elements.inclinationDeg.toFixed(2)}°
        </Row>
        <Row label="Mean radius">
          {formatNumber(mb.radiusM / 1000, 1)} km
        </Row>
      </div>
    );
  }

  // Check if selected body is a Spacecraft
  if (selectedBody in SPACECRAFT) {
    const sc = SPACECRAFT[selectedBody as SpacecraftId];

    return (
      <div className="glass-panel space-y-1 p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase text-cyan-400 tracking-wider">
              Deep Space Probe
            </span>
            <h2 className="text-lg font-semibold">{sc.name}</h2>
          </div>
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: sc.color }}
          />
        </div>
        <p className="pb-2 text-xs leading-relaxed text-muted-foreground">{sc.description}</p>

        <Row label="Launch Date">{sc.launchDate}</Row>
        <Row label="Speed">{sc.speedKmS} km/s</Row>
        <Row label="Status">{sc.status.replace(/_/g, " ").toUpperCase()}</Row>
        <div className="pt-2 border-t border-border/60">
          <span className="instrument-label text-[10px]">Mission Milestones</span>
          <div className="mt-1 space-y-1">
            {sc.milestones.map((m) => (
              <div key={m.name} className="flex justify-between text-[11px] text-muted-foreground">
                <span>{m.name} ({m.date})</span>
                <span className="font-mono">{m.distanceAu} AU</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
