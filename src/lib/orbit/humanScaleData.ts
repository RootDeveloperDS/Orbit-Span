import { BODIES, SPEED_OF_LIGHT_M_S, type BodyId } from "./constants";
import { scaleFactor } from "./scale";

export interface EverydayObject {
  readonly name: string;
  readonly typicalDiameterM: number;
  readonly icon: string;
  readonly description: string;
}

/**
 * Curated catalog of real-world everyday objects sorted by size.
 */
export const EVERYDAY_OBJECTS: readonly EverydayObject[] = [
  { name: "Dust speck", typicalDiameterM: 0.0001, icon: "✨", description: "Barely visible to the naked eye" },
  { name: "Fine sand grain", typicalDiameterM: 0.0005, icon: "⏳", description: "A single grain of beach sand" },
  { name: "Mustard seed", typicalDiameterM: 0.0015, icon: "🌱", description: "Tiny round seed" },
  { name: "Peppercorn", typicalDiameterM: 0.0035, icon: "⚫", description: "Whole black peppercorn" },
  { name: "BB pellet", typicalDiameterM: 0.0045, icon: "⚪", description: "Small metal BB pellet" },
  { name: "Green pea", typicalDiameterM: 0.007, icon: "🟢", description: "Fresh garden pea" },
  { name: "Blueberry", typicalDiameterM: 0.012, icon: "🫐", description: "Sweet plump berry" },
  { name: "Glass marble", typicalDiameterM: 0.015, icon: "🔮", description: "Classic playing marble" },
  { name: "Cherry", typicalDiameterM: 0.022, icon: "🍒", description: "Fresh ripe cherry" },
  { name: "Pebble / Coin", typicalDiameterM: 0.027, icon: "🪙", description: "Standard coin or smooth river pebble" },
  { name: "Golf ball", typicalDiameterM: 0.043, icon: "⚪", description: "Standard regulation golf ball" },
  { name: "Lime", typicalDiameterM: 0.055, icon: "🍈", description: "Whole citrus lime" },
  { name: "Tennis ball", typicalDiameterM: 0.067, icon: "🎾", description: "Felt tennis ball" },
  { name: "Baseball", typicalDiameterM: 0.074, icon: "⚾", description: "Regulation baseball" },
  { name: "Apple", typicalDiameterM: 0.085, icon: "🍎", description: "Crisp medium apple" },
  { name: "Grapefruit / Fist", typicalDiameterM: 0.1, icon: "🍊", description: "Average adult clenched fist" },
  { name: "Cantaloupe melon", typicalDiameterM: 0.16, icon: "🍈", description: "Small melon" },
  { name: "Bowling ball", typicalDiameterM: 0.22, icon: "🎳", description: "Heavy bowling ball" },
  { name: "Soccer ball / Basketball", typicalDiameterM: 0.24, icon: "⚽", description: "Regulation size 5 ball" },
  { name: "Beach ball", typicalDiameterM: 0.5, icon: "🏖️", description: "Standard inflatable beach ball" },
  { name: "Giant yoga ball", typicalDiameterM: 1.1, icon: "🔵", description: "Large fitness exercise ball" },
  { name: "Compact car", typicalDiameterM: 3.8, icon: "🚗", description: "Small city hatchback" },
  { name: "Two-story house", typicalDiameterM: 10.9, icon: "🏠", description: "Suburban family home" },
  { name: "Commercial airliner", typicalDiameterM: 35.0, icon: "✈️", description: "Wingspan of a Boeing 737" },
  { name: "Football pitch", typicalDiameterM: 105.0, icon: "🏟️", description: "Standard FIFA soccer pitch length" },
];

/**
 * Finds the closest everyday object matching a given diameter in metres.
 */
export function getClosestEverydayObject(diameterM: number): EverydayObject {
  let closest = EVERYDAY_OBJECTS[0];
  let minDiff = Math.abs(Math.log10(Math.max(diameterM, 1e-6)) - Math.log10(closest.typicalDiameterM));

  for (let i = 1; i < EVERYDAY_OBJECTS.length; i++) {
    const obj = EVERYDAY_OBJECTS[i];
    const diff = Math.abs(Math.log10(Math.max(diameterM, 1e-6)) - Math.log10(obj.typicalDiameterM));
    if (diff < minDiff) {
      minDiff = diff;
      closest = obj;
    }
  }

  return closest;
}

/**
 * Real-world human journey speed benchmarks (in m/s).
 */
export const HUMAN_SPEEDS = {
  walking: 1.39, // ~5.0 km/h
  running: 3.33, // ~12.0 km/h
  cycling: 5.56, // ~20.0 km/h
  highwayCar: 27.78, // ~100.0 km/h
  commercialJet: 250.0, // ~900.0 km/h
} as const;

export interface HumanJourneyTimes {
  /** Time in seconds */
  walkingSec: number;
  runningSec: number;
  cyclingSec: number;
  carSec: number;
  jetSec: number;
  /** True light travel time across real distance (seconds) */
  lightTimeSec: number;
  /** Scaled speed of light in model metres per second */
  scaledLightSpeedMps: number;
  /** Walking steps (based on average stride length ~0.76m) */
  walkingSteps: number;
  /** Estimated calories burned walking (~0.04 kcal / step) */
  caloriesKcal: number;
}

/**
 * Computes human travel times, steps, and energy for a given model distance and real distance.
 */
export function computeJourneyTimes(
  modelDistanceM: number,
  realDistanceM: number,
  referenceEarthDiameterM: number,
): HumanJourneyTimes {
  const k = scaleFactor(referenceEarthDiameterM);
  const scaledLightSpeedMps = SPEED_OF_LIGHT_M_S * k;
  const walkingSteps = Math.round(modelDistanceM / 0.762);
  const caloriesKcal = Math.round(walkingSteps * 0.04);

  return {
    walkingSec: modelDistanceM / HUMAN_SPEEDS.walking,
    runningSec: modelDistanceM / HUMAN_SPEEDS.running,
    cyclingSec: modelDistanceM / HUMAN_SPEEDS.cycling,
    carSec: modelDistanceM / HUMAN_SPEEDS.highwayCar,
    jetSec: modelDistanceM / HUMAN_SPEEDS.commercialJet,
    lightTimeSec: realDistanceM / SPEED_OF_LIGHT_M_S,
    scaledLightSpeedMps,
    walkingSteps,
    caloriesKcal,
  };
}

/**
 * Format a duration in seconds into intuitive human text.
 */
export function formatHumanDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "Instant";
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  }
  if (seconds < 86400) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hrs`;
  }
  const days = Math.floor(seconds / 86400);
  if (days < 365) {
    const remainingHrs = Math.round((seconds % 86400) / 3600);
    return remainingHrs > 0 ? `${days}d ${remainingHrs}h` : `${days} days`;
  }
  const years = (seconds / (86400 * 365.25)).toFixed(1);
  return `${years} years`;
}

/**
 * City Walk Planetary Stops
 */
export interface CityPlanetaryStop {
  readonly bodyId: BodyId;
  readonly name: string;
  readonly landmark: string;
  readonly typicalDistanceM: number; // nominal scaled distance when Earth = 10cm
  readonly sensoryNote: string;
}

export interface CityWalkProfile {
  readonly id: string;
  readonly cityName: string;
  readonly country: string;
  readonly icon: string;
  readonly sunHub: string;
  readonly description: string;
  readonly stops: readonly CityPlanetaryStop[];
}

export const CITY_WALK_PROFILES: readonly CityWalkProfile[] = [
  {
    id: "nyc",
    cityName: "New York City",
    country: "USA",
    icon: "🗽",
    sunHub: "Times Square (Center Stage)",
    description: "From midtown Manhattan skyscrapers outward across Central Park and the Hudson River.",
    stops: [
      {
        bodyId: "mercury",
        name: "Mercury",
        landmark: "Bryant Park / NY Public Library",
        typicalDistanceM: 454,
        sensoryNote: "A tiny 0.4mm speck of sand resting near the library lions.",
      },
      {
        bodyId: "venus",
        name: "Venus",
        landmark: "Grand Central Terminal entrance",
        typicalDistanceM: 850,
        sensoryNote: "A 9.5mm glass marble tucked among the busy commuters.",
      },
      {
        bodyId: "earth",
        name: "Earth",
        landmark: "Central Park South / Plaza Hotel",
        typicalDistanceM: 1175,
        sensoryNote: "A 10cm grapefruit held in your palm at the edge of the park.",
      },
      {
        bodyId: "mars",
        name: "Mars",
        landmark: "The Wollman Skating Rink",
        typicalDistanceM: 1790,
        sensoryNote: "A 5.3cm plum hidden in the Central Park foliage.",
      },
      {
        bodyId: "jupiter",
        name: "Jupiter",
        landmark: "Metropolitan Museum of Art (Met)",
        typicalDistanceM: 6112,
        sensoryNote: "A massive 1.1m exercise ball standing in the Great Hall.",
      },
      {
        bodyId: "saturn",
        name: "Saturn",
        landmark: "Apollo Theater, Harlem",
        typicalDistanceM: 11210,
        sensoryNote: "A 91cm gym sphere with rings spanning almost 2.2 metres across.",
      },
      {
        bodyId: "uranus",
        name: "Uranus",
        landmark: "LaGuardia Airport Terminal B",
        typicalDistanceM: 22530,
        sensoryNote: "A 40cm beach ball beside an airport departure gate.",
      },
      {
        bodyId: "neptune",
        name: "Neptune",
        landmark: "Newark Liberty Airport / JFK Airport",
        typicalDistanceM: 35270,
        sensoryNote: "A 39cm blue basketball perched over 35 kilometres away in New Jersey.",
      },
    ],
  },
  {
    id: "london",
    cityName: "London",
    country: "UK",
    icon: "🎡",
    sunHub: "Trafalgar Square (Nelson's Column)",
    description: "Radiating from central Westminster along the River Thames and Royal Parks.",
    stops: [
      {
        bodyId: "mercury",
        name: "Mercury",
        landmark: "Leicester Square / National Gallery",
        typicalDistanceM: 454,
        sensoryNote: "A grain of sand right under the cinema marquees.",
      },
      {
        bodyId: "venus",
        name: "Venus",
        landmark: "Covent Garden Market piazza",
        typicalDistanceM: 850,
        sensoryNote: "A shiny blueberry sitting on a street performer's table.",
      },
      {
        bodyId: "earth",
        name: "Earth",
        landmark: "Buckingham Palace gates",
        typicalDistanceM: 1175,
        sensoryNote: "A 10cm grapefruit held up toward the Queen Victoria Memorial.",
      },
      {
        bodyId: "mars",
        name: "Mars",
        landmark: "Westminster Abbey / Big Ben",
        typicalDistanceM: 1790,
        sensoryNote: "A small plum resting on Parliament Square lawn.",
      },
      {
        bodyId: "jupiter",
        name: "Jupiter",
        landmark: "Tower of London / Tower Bridge",
        typicalDistanceM: 6112,
        sensoryNote: "A 1.1m exercise ball near the historic battlements.",
      },
      {
        bodyId: "saturn",
        name: "Saturn",
        landmark: "Royal Observatory Greenwich (Prime Meridian)",
        typicalDistanceM: 11210,
        sensoryNote: "A 91cm sphere resting right on the historic Longitude Zero line.",
      },
      {
        bodyId: "uranus",
        name: "Uranus",
        landmark: "Richmond Park Deer Gates",
        typicalDistanceM: 22530,
        sensoryNote: "A 40cm beach ball among the ancient Royal oak trees.",
      },
      {
        bodyId: "neptune",
        name: "Neptune",
        landmark: "London Heathrow Airport (LHR)",
        typicalDistanceM: 35270,
        sensoryNote: "A 39cm azure ball 35 km away near Runway 27L.",
      },
    ],
  },
  {
    id: "paris",
    cityName: "Paris",
    country: "France",
    icon: "🗼",
    sunHub: "Eiffel Tower (Base Pillar)",
    description: "Tracing across the Seine, historical grand boulevards, and beyond the peripherique.",
    stops: [
      {
        bodyId: "mercury",
        name: "Mercury",
        landmark: "Champ de Mars grand lawn",
        typicalDistanceM: 454,
        sensoryNote: "A pinhead speck resting on a picnic blanket.",
      },
      {
        bodyId: "venus",
        name: "Venus",
        landmark: "Trocadéro Fountains",
        typicalDistanceM: 850,
        sensoryNote: "A glass marble right across the Pont d'Iéna bridge.",
      },
      {
        bodyId: "earth",
        name: "Earth",
        landmark: "Arc de Triomphe / Place Charles de Gaulle",
        typicalDistanceM: 1175,
        sensoryNote: "A 10cm grapefruit under the grand triumphal arch.",
      },
      {
        bodyId: "mars",
        name: "Mars",
        landmark: "Grand Palais glass dome",
        typicalDistanceM: 1790,
        sensoryNote: "A red plum by the Avenue des Champs-Élysées.",
      },
      {
        bodyId: "jupiter",
        name: "Jupiter",
        landmark: "Montmartre / Basilique du Sacré-Cœur",
        typicalDistanceM: 6112,
        sensoryNote: "A 1.1m giant ball perched overlooking the panoramic city skyline.",
      },
      {
        bodyId: "saturn",
        name: "Saturn",
        landmark: "Stade de France, Saint-Denis",
        typicalDistanceM: 11210,
        sensoryNote: "A 91cm sphere positioned in the national sports arena.",
      },
      {
        bodyId: "uranus",
        name: "Uranus",
        landmark: "Château de Versailles Gardens",
        typicalDistanceM: 22530,
        sensoryNote: "A 40cm ball beside the Grand Canal of the Sun King.",
      },
      {
        bodyId: "neptune",
        name: "Neptune",
        landmark: "Disneyland Paris / Marne-la-Vallée",
        typicalDistanceM: 35270,
        sensoryNote: "A 39cm blue ball 35 km away by the enchanted castle.",
      },
    ],
  },
  {
    id: "tokyo",
    cityName: "Tokyo",
    country: "Japan",
    icon: "⛩️",
    sunHub: "Tokyo Station (Marunouchi Square)",
    description: "Spanning across Chiyoda, Ginza, Shibuya, Shinjuku, and the greater Kanto plain.",
    stops: [
      {
        bodyId: "mercury",
        name: "Mercury",
        landmark: "Imperial Palace East Garden Moat",
        typicalDistanceM: 454,
        sensoryNote: "A speck of sand beside the historic palace stonework.",
      },
      {
        bodyId: "venus",
        name: "Venus",
        landmark: "Ginza 4-Chome Crossing (Wako Clock)",
        typicalDistanceM: 850,
        sensoryNote: "A glass marble among the luxury boutique lights.",
      },
      {
        bodyId: "earth",
        name: "Earth",
        landmark: "Hibiya Park Fountain",
        typicalDistanceM: 1175,
        sensoryNote: "A 10cm grapefruit held in your hands beside the pond.",
      },
      {
        bodyId: "mars",
        name: "Mars",
        landmark: "Akihabara Electric Town Gate",
        typicalDistanceM: 1790,
        sensoryNote: "A small red plum under the neon signs.",
      },
      {
        bodyId: "jupiter",
        name: "Jupiter",
        landmark: "Tokyo Tower main deck",
        typicalDistanceM: 6112,
        sensoryNote: "A 1.1m exercise ball at the base of the iconic red tower.",
      },
      {
        bodyId: "saturn",
        name: "Saturn",
        landmark: "Shibuya Scramble Crossing",
        typicalDistanceM: 11210,
        sensoryNote: "A 91cm sphere ringed with light in the world's busiest crosswalk.",
      },
      {
        bodyId: "uranus",
        name: "Uranus",
        landmark: "Haneda Airport International Terminal",
        typicalDistanceM: 22530,
        sensoryNote: "A 40cm ball by Tokyo Bay runways.",
      },
      {
        bodyId: "neptune",
        name: "Neptune",
        landmark: "Yokohama Minato Mirai Landmark Tower",
        typicalDistanceM: 35270,
        sensoryNote: "A 39cm azure ball 35 km away in the port city of Yokohama.",
      },
    ],
  },
];

/** Backward compatibility */
export const CITY_ANALOGIES = CITY_WALK_PROFILES.map((p) => ({
  referenceName: p.cityName,
  sunLocation: p.sunHub,
  earthLocation: p.stops.find((s) => s.bodyId === "earth")?.landmark ?? "",
  jupiterLocation: p.stops.find((s) => s.bodyId === "jupiter")?.landmark ?? "",
  neptuneLocation: p.stops.find((s) => s.bodyId === "neptune")?.landmark ?? "",
}));

