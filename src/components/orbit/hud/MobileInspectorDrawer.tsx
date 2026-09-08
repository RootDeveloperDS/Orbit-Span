import { useState } from "react";
import { ChevronUp, Compass } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { BODIES, type BodyId } from "@/lib/orbit/constants";
import { MOONS, type MoonId } from "@/lib/orbit/moons";
import { MINOR_BODIES, type MinorBodyId } from "@/lib/orbit/minorBodies";
import { SPACECRAFT, type SpacecraftId } from "@/lib/orbit/spacecraft";
import { useOrbitStore } from "@/store/useOrbitStore";

import { CelestialNavigator } from "./CelestialNavigator";
import { TelemetryInspector } from "./TelemetryInspector";

export function MobileInspectorDrawer() {
  const [open, setOpen] = useState(false);
  const selectedBody = useOrbitStore((s) => s.selectedBody);

  // Derive body name & color
  let bodyName = selectedBody;
  let bodyColor = "#38bdf8";

  if (selectedBody in BODIES) {
    bodyName = BODIES[selectedBody as BodyId].name;
    bodyColor = BODIES[selectedBody as BodyId].color;
  } else if (selectedBody in MOONS) {
    bodyName = MOONS[selectedBody as MoonId].name;
    bodyColor = MOONS[selectedBody as MoonId].color;
  } else if (selectedBody in MINOR_BODIES) {
    bodyName = MINOR_BODIES[selectedBody as MinorBodyId].name;
    bodyColor = MINOR_BODIES[selectedBody as MinorBodyId].color;
  } else if (selectedBody in SPACECRAFT) {
    bodyName = SPACECRAFT[selectedBody as SpacecraftId].name;
    bodyColor = SPACECRAFT[selectedBody as SpacecraftId].color;
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/60 bg-space-deep/90 px-3.5 py-2 text-xs font-medium text-foreground shadow-2xl backdrop-blur-xl transition-all hover:bg-secondary/60 hover:scale-102"
        >
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
            style={{ backgroundColor: bodyColor, color: bodyColor }}
          />
          <span className="font-semibold">{bodyName}</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Telemetry
          </span>
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh] border-border/70 bg-space-deep/98 px-4 pb-6 backdrop-blur-2xl">
        <DrawerHeader className="pb-2 pt-3 text-left">
          <DrawerTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <Compass className="h-4 w-4 text-primary" /> Target & Telemetry Inspector
          </DrawerTitle>
        </DrawerHeader>

        <div className="mt-2 space-y-4 overflow-y-auto pr-1">
          {/* Celestial Selector */}
          <div className="rounded-xl border border-border/50 bg-secondary/15 p-3">
            <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider font-semibold block mb-2">
              Select Celestial Body
            </span>
            <CelestialNavigator />
          </div>

          {/* Telemetry Readout */}
          <div className="rounded-xl border border-border/50 bg-secondary/15 p-3.5">
            <TelemetryInspector onClose={() => setOpen(false)} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
