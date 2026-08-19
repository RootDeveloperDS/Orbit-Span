/**
 * Historic Spacecraft & Deep Space Probes Trajectory Engine.
 * Covers Voyager 1, Voyager 2, New Horizons, and James Webb Space Telescope (JWST).
 * Generates true 3D flight paths, planetary gravity-assist milestones, and live coordinates.
 */
import type { Vec3 } from "./ephemeris";
import { SCIENTIFIC_UNITS_PER_AU, toSceneAxes, type LayoutMode } from "./sceneLayout";

export type SpacecraftId = "voyager1" | "voyager2" | "new_horizons" | "jwst";

export interface MissionMilestone {
  readonly name: string;
  readonly date: string;
  readonly description: string;
  readonly distanceAu: number;
}

export interface SpacecraftMeta {
  readonly id: SpacecraftId;
  readonly name: string;
  readonly launchDate: string;
  readonly status: "active_interstellar" | "active_deep_space" | "active_lagrange_l2";
  readonly speedKmS: number;
  readonly color: string;
  readonly description: string;
  readonly milestones: readonly MissionMilestone[];
  /** Historical trajectory waypoints in heliocentric Ecliptic J2000 (AU). */
  readonly waypointsAu: readonly Vec3[];
}

export const SPACECRAFT: Readonly<Record<SpacecraftId, SpacecraftMeta>> = {
  voyager1: {
    id: "voyager1",
    name: "Voyager 1",
    launchDate: "1977-09-05",
    status: "active_interstellar",
    speedKmS: 16.9,
    color: "#ffc83b",
    description: "Most distant human-made object. First spacecraft to cross the heliopause and enter interstellar space (2012).",
    milestones: [
      { name: "Launch", date: "1977-09-05", description: "Launched from Cape Canaveral", distanceAu: 1.0 },
      { name: "Jupiter Flyby", date: "1979-03-05", description: "Gravity assist & Io volcano discovery", distanceAu: 5.2 },
      { name: "Saturn Flyby", date: "1980-11-12", description: "Titan flyby & slingshot out of ecliptic plane", distanceAu: 9.6 },
      { name: "Interstellar Crossing", date: "2012-08-25", description: "Crossed heliopause into interstellar plasma", distanceAu: 121.6 },
    ],
    waypointsAu: [
      { x: 1.0, y: 0.0, z: 0.0 },
      { x: 2.8, y: 1.5, z: 0.08 },
      { x: 5.0, y: 3.2, z: 0.2 },
      { x: 8.2, y: 5.4, z: 1.8 },
      { x: 15.0, y: 12.0, z: 8.5 },
      { x: 35.0, y: 28.0, z: 24.0 },
      { x: 75.0, y: 58.0, z: 54.0 },
      { x: 121.6, y: 95.0, z: 90.0 },
      { x: 164.0, y: 128.0, z: 122.0 },
    ],
  },
  voyager2: {
    id: "voyager2",
    name: "Voyager 2",
    launchDate: "1977-08-20",
    status: "active_interstellar",
    speedKmS: 15.3,
    color: "#38bdf8",
    description: "The only probe to visit all 4 giant gas and ice planets: Jupiter, Saturn, Uranus, and Neptune.",
    milestones: [
      { name: "Launch", date: "1977-08-20", description: "Launched 16 days before Voyager 1", distanceAu: 1.0 },
      { name: "Jupiter Flyby", date: "1979-07-09", description: "First close study of Galilean moons", distanceAu: 5.2 },
      { name: "Saturn Flyby", date: "1981-08-26", description: "Saturn ring atmospheric occultation", distanceAu: 9.5 },
      { name: "Uranus Flyby", date: "1986-01-24", description: "Discovered 10 new moons and 2 rings", distanceAu: 19.2 },
      { name: "Neptune Flyby", date: "1989-08-25", description: "Discovered Great Dark Spot & Triton geysers", distanceAu: 30.1 },
      { name: "Interstellar Crossing", date: "2018-11-05", description: "Entered interstellar space in southern hemisphere", distanceAu: 119.0 },
    ],
    waypointsAu: [
      { x: 1.0, y: 0.0, z: 0.0 },
      { x: 4.8, y: 2.1, z: -0.1 },
      { x: 8.8, y: 4.2, z: -0.3 },
      { x: 18.2, y: 6.8, z: -1.2 },
      { x: 28.5, y: 10.2, z: -8.5 },
      { x: 55.0, y: 22.0, z: -32.0 },
      { x: 90.0, y: 38.0, z: -68.0 },
      { x: 119.0, y: 52.0, z: -92.0 },
      { x: 137.0, y: 60.0, z: -108.0 },
    ],
  },
  new_horizons: {
    id: "new_horizons",
    name: "New Horizons",
    launchDate: "2006-01-19",
    status: "active_deep_space",
    speedKmS: 13.8,
    color: "#f43f5e",
    description: "First mission to explore Pluto and the Kuiper Belt, capturing the iconic heart-shaped Tombaugh Regio.",
    milestones: [
      { name: "Launch", date: "2006-01-19", description: "Fastest man-made object at launch (58,536 km/h)", distanceAu: 1.0 },
      { name: "Jupiter Gravity Assist", date: "2007-02-28", description: "Boosted speed by 4 km/s", distanceAu: 5.3 },
      { name: "Pluto Historic Flyby", date: "2015-07-14", description: "Flew 12,500 km above Pluto's surface", distanceAu: 32.9 },
      { name: "Arrokoth Flyby", date: "2019-01-01", description: "Farthest planetary flyby in human history", distanceAu: 43.4 },
    ],
    waypointsAu: [
      { x: 1.0, y: 0.0, z: 0.0 },
      { x: 5.1, y: 1.8, z: 0.1 },
      { x: 14.5, y: 5.2, z: 0.4 },
      { x: 24.2, y: 8.6, z: 0.8 },
      { x: 32.9, y: 11.8, z: 1.2 },
      { x: 43.4, y: 15.6, z: 1.6 },
      { x: 59.0, y: 21.0, z: 2.2 },
    ],
  },
  jwst: {
    id: "jwst",
    name: "James Webb (JWST)",
    launchDate: "2021-12-25",
    status: "active_lagrange_l2",
    speedKmS: 0.2,
    color: "#a855f7",
    description: "Premier space observatory orbiting Sun-Earth L2 Lagrange point (1.5 million km anti-sunward), peering back 13.5 billion years into cosmic dawn.",
    milestones: [
      { name: "Launch", date: "2021-12-25", description: "Launched on Ariane 5 from Kourou", distanceAu: 1.0 },
      { name: "Sunshield Deployment", date: "2022-01-04", description: "5-layer tennis-court sized sunshield deployed", distanceAu: 1.005 },
      { name: "L2 Orbit Insertion", date: "2022-01-24", description: "Entered halo orbit around Sun-Earth L2 point", distanceAu: 1.010 },
      { name: "First Deep Field", date: "2022-07-11", description: "First high-resolution infrared deep field unveiled", distanceAu: 1.010 },
    ],
    waypointsAu: [
      { x: 1.0, y: 0.0, z: 0.0 },
      { x: 1.005, y: 0.002, z: 0.001 },
      { x: 1.01, y: 0.004, z: 0.002 },
    ],
  },
};

export const SPACECRAFT_ORDER: readonly SpacecraftId[] = [
  "voyager1",
  "voyager2",
  "new_horizons",
  "jwst",
];

/**
 * Calculate the Sun-Earth L2 Lagrange Point 3D position in scene space,
 * positioned exactly 1.5 million km directly anti-sunward behind Earth.
 */
export function computeJWSTL2ScenePosition(
  earthScenePos: Vec3,
  viewMode: LayoutMode,
  earthRadius: number,
): { l2Pos: Vec3; haloRadius: number } {
  // Vector from Sun [0,0,0] to Earth
  const r = Math.sqrt(earthScenePos.x * earthScenePos.x + earthScenePos.y * earthScenePos.y + earthScenePos.z * earthScenePos.z) || 1;
  const antiSunUnit: Vec3 = {
    x: earthScenePos.x / r,
    y: earthScenePos.y / r,
    z: earthScenePos.z / r,
  };

  let l2Distance: number;
  let haloRadius: number;

  if (viewMode === "scientific") {
    // 1.5 million km = 0.010027 AU
    l2Distance = 0.010027 * SCIENTIFIC_UNITS_PER_AU;
    haloRadius = 0.0053 * SCIENTIFIC_UNITS_PER_AU; // ~800,000 km halo orbit
  } else {
    // Exploration / Human mode: cleanly outside Earth and Moon orbits
    l2Distance = earthRadius * 4.8;
    haloRadius = Math.max(earthRadius * 0.45, 0.18);
  }

  return {
    l2Pos: {
      x: earthScenePos.x + antiSunUnit.x * l2Distance,
      y: earthScenePos.y + antiSunUnit.y * l2Distance,
      z: earthScenePos.z + antiSunUnit.z * l2Distance,
    },
    haloRadius,
  };
}

/**
 * Generate the halo orbit ring points around the L2 point in scene space.
 */
export function computeJWSTHaloOrbitPoints(
  l2Pos: Vec3,
  haloRadius: number,
  segments = 48,
): Vec3[] {
  const points: Vec3[] = [];
  // Orientation perpendicular to Sun-Earth line
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push({
      x: l2Pos.x,
      y: l2Pos.y + Math.sin(theta) * haloRadius,
      z: l2Pos.z + Math.cos(theta) * haloRadius,
    });
  }
  return points;
}

/**
 * Compute the 3D trajectory spline points for interstellar probes in scene space.
 */
export function computeSpacecraftTrajectory(
  id: SpacecraftId,
  mode: LayoutMode,
): Vec3[] {
  const meta = SPACECRAFT[id];
  const points: Vec3[] = [];

  for (const wp of meta.waypointsAu) {
    if (mode === "scientific") {
      points.push(toSceneAxes(wp, SCIENTIFIC_UNITS_PER_AU));
    } else {
      const dist = Math.sqrt(wp.x * wp.x + wp.y * wp.y + wp.z * wp.z);
      const compressed = Math.pow(dist, 0.5) * 7;
      const scale = dist > 0 ? compressed / dist : 0;
      points.push(toSceneAxes(wp, scale));
    }
  }
  return points;
}
