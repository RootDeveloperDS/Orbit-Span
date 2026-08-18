import { BODIES } from "@/lib/orbit/constants";
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

/**
 * Reads its own astronomical state from the store via useSolarSystemState so the
 * parent ExplorerPage doesn't need to call computeSolarSystemState separately.
 * This avoids running the ephemeris computation twice per tick.
 */
export function BodyReadout() {
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const observerMassKg = useOrbitStore((s) => s.observerMassKg);
  const state = useSolarSystemState();

  const meta = BODIES[selectedBody];
  const bodyState = state.bodies[selectedBody];
  const isEarth = selectedBody === "earth";
  const distanceM = isEarth ? meta.radiusM : bodyState.distanceFromEarthM;
  const gravity = computeGravity(selectedBody, distanceM, observerMassKg);

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
