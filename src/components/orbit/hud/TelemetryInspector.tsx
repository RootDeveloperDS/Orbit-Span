import { X, Footprints, Car, Sparkles, Clock, Ruler } from "lucide-react";
import { BODIES, type BodyId } from "@/lib/orbit/constants";
import { MOONS, type MoonId } from "@/lib/orbit/moons";
import { MINOR_BODIES, type MinorBodyId } from "@/lib/orbit/minorBodies";
import { SPACECRAFT, type SpacecraftId } from "@/lib/orbit/spacecraft";
import { computeGravity, formatDistance, formatNumber } from "@/lib/orbit/physics";
import { useOrbitStore } from "@/store/useOrbitStore";
import { useSolarSystemState } from "@/hooks/useSolarSystemState";
import { scaleFactor, formatModelLength, REFERENCE_OPTIONS } from "@/lib/orbit/scale";
import {
  getClosestEverydayObject,
  computeJourneyTimes,
  formatHumanDuration,
} from "@/lib/orbit/humanScaleData";
import { SciValue } from "../SciValue";


interface TelemetryInspectorProps {
  onClose?: () => void;
}

function MetricItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border/40 py-1.5 last:border-0">
      <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="font-mono text-xs text-foreground font-medium text-right">{children}</span>
    </div>
  );
}

export function TelemetryInspector({ onClose }: TelemetryInspectorProps) {
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const observerMassKg = useOrbitStore((s) => s.observerMassKg);
  const viewMode = useOrbitStore((s) => s.viewMode);
  const earthReference = useOrbitStore((s) => s.earthReference);
  const customEarthM = useOrbitStore((s) => s.customEarthDiameterM);
  const setIsPedestalModalOpen = useOrbitStore((s) => s.setIsPedestalModalOpen);
  const setIsCityWalkModalOpen = useOrbitStore((s) => s.setIsCityWalkModalOpen);
  const state = useSolarSystemState();

  const refM = earthReference === "custom" ? Math.max(customEarthM, 0.001) : (REFERENCE_OPTIONS.find((o) => o.id === earthReference)?.metres ?? 0.1);
  const k = scaleFactor(refM);


  // Standard Planets & Sun
  if (selectedBody in BODIES) {
    const meta = BODIES[selectedBody as BodyId];
    const bodyState = state.bodies[selectedBody as BodyId];
    const isEarth = selectedBody === "earth";
    const distanceM = isEarth ? meta.radiusM : bodyState?.distanceFromEarthM ?? 0;
    const gravity = computeGravity(selectedBody as BodyId, distanceM, observerMassKg);

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: meta.color, color: meta.color }}
              />
              <h2 className="text-lg font-bold text-foreground tracking-tight">{meta.name}</h2>
              <span className="rounded-full bg-secondary/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {selectedBody === "sun" ? "Star" : "Major Planet"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {meta.blurb}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              title="Close inspector"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="rounded-lg border border-border/40 bg-secondary/15 p-2.5">
          <MetricItem label={isEarth ? "Surface radius" : "Distance from Earth"}>
            {formatDistance(distanceM)}
          </MetricItem>
          <MetricItem label="Mass">
            <SciValue value={meta.massKg} unit="kg" />
          </MetricItem>
          <MetricItem label="Pull on you">
            {gravity.accelerationMs2 >= 0.001 ? (
              `${formatNumber(gravity.accelerationMs2, 3)} m/s²`
            ) : (
              <SciValue value={gravity.accelerationMs2} unit="m/s²" />
            )}
          </MetricItem>
          <MetricItem label={`Force (${formatNumber(observerMassKg, 0)}kg)`}>
            {gravity.forceN >= 0.001 ? (
              `${formatNumber(gravity.forceN, 3)} N`
            ) : (
              <SciValue value={gravity.forceN} unit="N" />
            )}
          </MetricItem>
          <MetricItem label="Vs Earth gravity">
            <SciValue value={gravity.earthGravityRatio} />
          </MetricItem>
        </div>

        {/* Human Scale Intuition Companion Card */}
        {(() => {
          const modelDiameterM = meta.diameterM * k;
          const modelDistanceM = distanceM * k;
          const obj = getClosestEverydayObject(modelDiameterM);
          const journey = computeJourneyTimes(modelDistanceM, distanceM, refM);

          return (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Human Scale Intuition
                </span>
                <span className="font-mono text-[9px] text-muted-foreground">Earth = {formatModelLength(refM)}</span>
              </div>

              <div className="flex items-center gap-2.5 rounded-md bg-secondary/30 p-2">
                <span className="text-2xl" role="img" aria-label={obj.name}>{obj.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{obj.name}</span>
                    <span className="font-mono text-[10px] text-primary">{formatModelLength(modelDiameterM)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{obj.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <div className="rounded bg-secondary/20 p-1.5">
                  <span className="font-mono text-[9px] text-muted-foreground flex items-center gap-1">
                    <Footprints className="h-2.5 w-2.5 text-emerald-400" /> Walk to body
                  </span>
                  <span className="font-mono text-[11px] font-medium text-foreground block mt-0.5">
                    {formatHumanDuration(journey.walkingSec)}
                  </span>
                </div>
                <div className="rounded bg-secondary/20 p-1.5">
                  <span className="font-mono text-[9px] text-muted-foreground flex items-center gap-1">
                    <Car className="h-2.5 w-2.5 text-cyan-400" /> 100 km/h car
                  </span>
                  <span className="font-mono text-[11px] font-medium text-foreground block mt-0.5">
                    {formatHumanDuration(journey.carSec)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono border-t border-border/40 pt-1 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 text-yellow-400" /> Light transit:
                </span>
                <span className="text-foreground">{formatHumanDuration(journey.lightTimeSec)}</span>
              </div>

              {/* Quick Action Pedestal & City Walk Modals */}
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsPedestalModalOpen(true)}
                  className="flex-1 cursor-pointer flex items-center justify-center gap-1 rounded bg-primary/20 py-1 text-[10px] font-medium text-primary hover:bg-primary/30 transition-colors"
                  title="Compare this body on the Visual Pedestal"
                >
                  <Ruler className="h-2.5 w-2.5" /> Pedestal
                </button>
                <button
                  type="button"
                  onClick={() => setIsCityWalkModalOpen(true)}
                  className="flex-1 cursor-pointer flex items-center justify-center gap-1 rounded bg-emerald-950/40 border border-emerald-500/30 py-1 text-[10px] font-medium text-emerald-400 hover:bg-emerald-900/40 transition-colors"
                  title="Walk to this body in a real city"
                >
                  <Footprints className="h-2.5 w-2.5" /> City Walk
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }


  // Moons
  if (selectedBody in MOONS) {
    const moon = MOONS[selectedBody as MoonId];
    const parentMeta = BODIES[moon.parentId as BodyId] || { name: moon.parentId };

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: moon.color, color: moon.color }}
              />
              <h2 className="text-lg font-bold text-foreground tracking-tight">{moon.name}</h2>
              <span className="rounded-full bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                Moon of {parentMeta.name}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {moon.description}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              title="Close inspector"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="rounded-lg border border-border/40 bg-secondary/15 p-2.5">
          <MetricItem label="Semi-major axis">
            {formatNumber(moon.semiMajorAxisKm, 0)} km
          </MetricItem>
          <MetricItem label="Orbital period">
            {Math.abs(moon.orbitalPeriodDays).toFixed(2)} Earth days
            {moon.orbitalPeriodDays < 0 ? " (Retrograde)" : ""}
          </MetricItem>
          <MetricItem label="Mean radius">
            {formatNumber(moon.radiusM / 1000, 1)} km
          </MetricItem>
          <MetricItem label="Inclination">
            {moon.inclinationDeg.toFixed(2)}°
          </MetricItem>
        </div>
      </div>
    );
  }

  // Minor Bodies / Asteroids / Comets
  if (selectedBody in MINOR_BODIES) {
    const mb = MINOR_BODIES[selectedBody as MinorBodyId];

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: mb.color, color: mb.color }}
              />
              <h2 className="text-lg font-bold text-foreground tracking-tight">{mb.name}</h2>
              <span className="rounded-full bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 font-mono text-[10px] text-amber-400">
                {mb.category.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {mb.blurb}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              title="Close inspector"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="rounded-lg border border-border/40 bg-secondary/15 p-2.5">
          <MetricItem label="Semi-major axis">
            {mb.elements.semiMajorAxisAu.toFixed(3)} AU
          </MetricItem>
          <MetricItem label="Orbital period">
            {mb.elements.periodYears.toFixed(2)} yrs
          </MetricItem>
          <MetricItem label="Eccentricity">
            {mb.elements.eccentricity.toFixed(4)}
          </MetricItem>
          <MetricItem label="Mean radius">
            {formatNumber(mb.radiusM / 1000, 1)} km
          </MetricItem>
        </div>
      </div>
    );
  }

  // Historic Spacecraft
  if (selectedBody in SPACECRAFT) {
    const sc = SPACECRAFT[selectedBody as SpacecraftId];

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: sc.color, color: sc.color }}
              />
              <h2 className="text-lg font-bold text-foreground tracking-tight">{sc.name}</h2>
              <span className="rounded-full bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 font-mono text-[10px] text-cyan-400">
                Deep Space Probe
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {sc.description}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              title="Close inspector"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="rounded-lg border border-border/40 bg-secondary/15 p-2.5">
          <MetricItem label="Launch date">{sc.launchDate}</MetricItem>
          <MetricItem label="Speed">{sc.speedKmS} km/s</MetricItem>
          <MetricItem label="Status">{sc.status.replace(/_/g, " ").toUpperCase()}</MetricItem>
        </div>

        <div className="rounded-lg border border-border/40 bg-secondary/10 p-2.5">
          <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider font-semibold block mb-1">
            Mission Milestones
          </span>
          <div className="space-y-1">
            {sc.milestones.map((m) => (
              <div key={m.name} className="flex justify-between text-xs text-muted-foreground">
                <span className="text-foreground">{m.name}</span>
                <span className="font-mono text-[11px] text-primary">{m.distanceAu} AU</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
