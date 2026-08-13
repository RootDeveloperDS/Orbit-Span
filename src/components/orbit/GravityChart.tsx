import { BODIES, GRAVITY_TARGETS, type BodyId } from "@/lib/orbit/constants";
import type { SolarSystemState } from "@/lib/orbit/ephemeris";
import { computeGravity, formatDistance, logNormalize } from "@/lib/orbit/physics";
import { useOrbitStore } from "@/store/useOrbitStore";

import { SciValue } from "./SciValue";

const MIN_A = 1e-13;
const MAX_A = 1e-1;

export function GravityChart({ state }: { state: SolarSystemState }) {
  const observerMassKg = useOrbitStore((s) => s.observerMassKg);
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);

  const rows = GRAVITY_TARGETS.map((id: BodyId) => {
    const distanceM = state.bodies[id].distanceFromEarthM;
    return { id, ...computeGravity(id, distanceM, observerMassKg) };
  }).sort((a, b) => b.accelerationMs2 - a.accelerationMs2);

  return (
    <div className="glass-panel space-y-3 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Gravitational pull on you — logarithmic</h2>
        <span className="instrument-label">10⁻¹³ → 10⁻¹ m/s²</span>
      </div>
      <ul className="space-y-2">
        {rows.map((row) => {
          const width = logNormalize(row.accelerationMs2, MIN_A, MAX_A) * 100;
          const active = row.id === selectedBody;
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => selectBody(row.id)}
                aria-pressed={active}
                className="w-full text-left"
              >
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {BODIES[row.id].name}
                  </span>
                  <span className="text-muted-foreground">
                    <SciValue value={row.accelerationMs2} unit="m/s²" digits={2} />
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary/70">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${Math.max(width, 1.5)}%`,
                      backgroundColor: BODIES[row.id].color,
                      opacity: active ? 1 : 0.72,
                    }}
                  />
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {formatDistance(row.distanceM)} · force <SciValue value={row.forceN} unit="N" digits={2} />
                </p>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Each bar step covers a factor of ten. The Sun and Moon dominate everything else, and the
        planets sit many orders of magnitude below them because acceleration falls with the square of
        distance.
      </p>
    </div>
  );
}
