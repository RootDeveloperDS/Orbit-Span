import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BODIES, type BodyId } from "@/lib/orbit/constants";
import {
  REFERENCE_OPTIONS,
  formatModelLength,
  scaleFactor,
} from "@/lib/orbit/scale";
import {
  CITY_WALK_PROFILES,
  computeJourneyTimes,
  formatHumanDuration,
  type CityWalkProfile,
  type CityPlanetaryStop,
} from "@/lib/orbit/humanScaleData";
import { useOrbitStore } from "@/store/useOrbitStore";
import {
  Footprints,
  Car,
  Flame,
  Clock,
  Navigation,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Ruler,
} from "lucide-react";

interface CityJourneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenPedestal?: () => void;
}

export function CityJourneyModal({
  open,
  onOpenChange,
  onOpenPedestal,
}: CityJourneyModalProps) {
  const earthReference = useOrbitStore((s) => s.earthReference);
  const customEarthM = useOrbitStore((s) => s.customEarthDiameterM);
  const setSelectedBody = useOrbitStore((s) => s.setSelectedBody);

  // Selected city profile
  const [selectedCityId, setSelectedCityId] = useState<string>("nyc");
  const [activeStopIndex, setActiveStopIndex] = useState<number>(2); // Default to Earth (index 2)
  const [isAutoWalking, setIsAutoWalking] = useState<boolean>(false);

  const currentProfile: CityWalkProfile =
    CITY_WALK_PROFILES.find((p) => p.id === selectedCityId) ?? CITY_WALK_PROFILES[0];

  // Resolve scale
  const refM =
    earthReference === "custom"
      ? Math.max(customEarthM, 0.001)
      : REFERENCE_OPTIONS.find((o) => o.id === earthReference)?.metres ?? 0.1;
  const k = scaleFactor(refM);

  const activeStop: CityPlanetaryStop =
    currentProfile.stops[activeStopIndex] ?? currentProfile.stops[0];
  const bodyMeta = BODIES[activeStop.bodyId];

  // Scaled distance calculation for the active stop
  const nominalDistanceM = activeStop.typicalDistanceM * (refM / 0.1);
  const realDistanceM = nominalDistanceM / k;

  const journey = computeJourneyTimes(nominalDistanceM, realDistanceM, refM);

  // Auto-walk timer
  useEffect(() => {
    if (!isAutoWalking) return;

    const timer = setInterval(() => {
      setActiveStopIndex((prev) => {
        if (prev >= currentProfile.stops.length - 1) {
          setIsAutoWalking(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isAutoWalking, currentProfile.stops.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-border/70 bg-space-deep/95 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Footprints className="h-4 w-4" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  Walk the Solar System
                  <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                    City Journey
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Experience astronomical distances by walking through famous landmarks in a real city.
                </DialogDescription>
              </div>
            </div>

            {/* City Selector */}
            <div className="flex items-center gap-1 rounded-full bg-secondary/30 p-1 border border-border/50">
              {CITY_WALK_PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => {
                    setSelectedCityId(profile.id);
                    setActiveStopIndex(2); // Earth
                    setIsAutoWalking(false);
                  }}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-xs transition-all flex items-center gap-1 ${
                    selectedCityId === profile.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{profile.icon}</span>
                  <span className="hidden sm:inline">{profile.cityName}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* City Origin Hub Note */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-muted-foreground">
              Sun is stationed at:{" "}
              <strong className="text-foreground font-semibold">
                {currentProfile.sunHub}
              </strong>
            </span>
          </div>

          {onOpenPedestal && (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenPedestal();
              }}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20"
            >
              <Ruler className="h-3 w-3" />
              <span>Visual Pedestal</span>
            </button>
          )}
        </div>

        {/* Route Landmark Timeline Track */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Orbital Route Stops ({currentProfile.stops.length} Planets)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoWalking(!isAutoWalking)}
                className={`flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all ${
                  isAutoWalking
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                    : "border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAutoWalking ? (
                  <>
                    <Pause className="h-2.5 w-2.5" /> Pause Walk
                  </>
                ) : (
                  <>
                    <Play className="h-2.5 w-2.5" /> Simulate Walk
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAutoWalking(false);
                  setActiveStopIndex(0);
                }}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
                title="Restart from Sun"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
            {currentProfile.stops.map((stop, idx) => {
              const isCurrent = idx === activeStopIndex;
              const isPast = idx < activeStopIndex;
              const b = BODIES[stop.bodyId];

              return (
                <button
                  key={stop.bodyId}
                  type="button"
                  onClick={() => {
                    setActiveStopIndex(idx);
                    setIsAutoWalking(false);
                    setSelectedBody(stop.bodyId);
                  }}
                  className={`flex cursor-pointer flex-col items-center rounded-lg border p-1.5 transition-all ${
                    isCurrent
                      ? "border-emerald-400 bg-emerald-950/50 shadow-md ring-1 ring-emerald-400/50"
                      : isPast
                      ? "border-border/60 bg-secondary/30 text-foreground"
                      : "border-border/30 bg-secondary/10 text-muted-foreground hover:border-border"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full mb-1"
                    style={{ backgroundColor: b.color }}
                  />
                  <span className="text-[11px] font-medium truncate w-full text-center">
                    {stop.name}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {formatModelLength(stop.typicalDistanceM * (refM / 0.1))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Landmark Showcase Card */}
        <div className="rounded-xl border border-border/70 bg-space-deep/80 p-4 space-y-4 shadow-inner">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: bodyMeta.color }}
                />
                <h3 className="text-base font-bold text-foreground">
                  Stop #{activeStopIndex + 1}: {activeStop.name}
                </h3>
                <span className="rounded-full bg-secondary/50 px-2 py-0.5 font-mono text-[10px] text-primary">
                  {formatModelLength(nominalDistanceM)} from Sun
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span className="text-foreground font-semibold">{activeStop.landmark}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-[10px] uppercase text-muted-foreground block">
                Street Sensory Note
              </span>
              <p className="text-xs text-cyan-300 italic max-w-sm">
                "{activeStop.sensoryNote}"
              </p>
            </div>
          </div>

          {/* Real Human Journey Metrics Grid */}
          <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-4">
            {/* 1. Walking Time */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5 space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                <Footprints className="h-3 w-3" /> Walking Time
              </span>
              <span className="text-sm font-bold font-mono text-foreground block">
                {formatHumanDuration(journey.walkingSec)}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                at 5.0 km/h pace
              </span>
            </div>

            {/* 2. Steps Count */}
            <div className="rounded-lg border border-border/40 bg-secondary/20 p-2.5 space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <Navigation className="h-3 w-3 text-primary" /> Stride Count
              </span>
              <span className="text-sm font-bold font-mono text-foreground block">
                {journey.walkingSteps.toLocaleString()} steps
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                ~0.76m per stride
              </span>
            </div>

            {/* 3. Calories Burned */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5 space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
                <Flame className="h-3 w-3" /> Energy Burned
              </span>
              <span className="text-sm font-bold font-mono text-foreground block">
                {journey.caloriesKcal.toLocaleString()} kcal
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                active walk energy
              </span>
            </div>

            {/* 4. Car / Light Transit */}
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-2.5 space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1">
                <Car className="h-3 w-3" /> 100 km/h Highway
              </span>
              <span className="text-sm font-bold font-mono text-foreground block">
                {formatHumanDuration(journey.carSec)}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="h-2.5 w-2.5 text-yellow-400" /> Light: {formatHumanDuration(journey.lightTimeSec)}
              </span>
            </div>
          </div>

          {/* Perspective Quote */}
          <div className="rounded-lg border border-border/50 bg-secondary/15 p-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Cosmic Reality Check: </span>
            When you stand at <strong className="text-foreground">{activeStop.landmark}</strong>, the
            Sun (an 11-metre sphere at <strong className="text-foreground">{currentProfile.sunHub}</strong>)
            is located {formatModelLength(nominalDistanceM)} away. The rest of the intervening city space is virtually 99.999999% empty air.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
