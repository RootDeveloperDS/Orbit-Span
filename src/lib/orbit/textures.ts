/**
 * Procedural texture generators for photorealistic planet surfaces and rings.
 * Generates crisp, high-resolution 2D Canvas textures offline without external image dependencies.
 */
import * as THREE from "three";

import type { BodyId } from "./constants";

const textureCache = new Map<string, THREE.CanvasTexture>();

function createCanvas(width = 1024, height = 512): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  return [canvas, ctx];
}

/** Simple 2D Perlin-like pseudo noise generator for surface details. */
function noise2D(x: number, y: number): number {
  const sin1 = Math.sin(x * 12.9898 + y * 78.233);
  const sin2 = Math.cos(x * 37.719 + y * 53.113);
  const fract = (sin1 * 43758.5453) % 1;
  const fract2 = (sin2 * 23421.1231) % 1;
  return Math.abs(fract + fract2) / 2;
}

function fbm(x: number, y: number, octaves = 4): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += noise2D(x * freq, y * freq) * amp;
    freq *= 2.1;
    amp *= 0.5;
  }
  return val;
}

export function generateSunTexture(): THREE.CanvasTexture {
  if (textureCache.has("sun")) return textureCache.get("sun")!;
  const [canvas, ctx] = createCanvas(1024, 512);

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#fff5cc");
  grad.addColorStop(0.3, "#ffcc33");
  grad.addColorStop(0.7, "#ff8800");
  grad.addColorStop(1, "#cc3300");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Solar granules and turbulence
  const imgData = ctx.getImageData(0, 0, 1024, 512);
  const data = imgData.data;
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const idx = (y * 1024 + x) * 4;
      const n = fbm(x / 60, y / 60, 4);
      const intensity = 0.8 + n * 0.4;
      data[idx] = Math.min(255, data[idx]! * intensity);
      data[idx + 1] = Math.min(255, data[idx + 1]! * intensity);
      data[idx + 2] = Math.min(255, data[idx + 2]! * intensity);
    }
  }

  // Sunspots
  ctx.putImageData(imgData, 0, 0);
  ctx.fillStyle = "rgba(40, 10, 0, 0.75)";
  const spotPositions = [
    [300, 200, 18],
    [320, 210, 10],
    [700, 320, 22],
    [730, 310, 12],
    [450, 150, 15],
  ];
  for (const [sx, sy, sr] of spotPositions) {
    ctx.beginPath();
    ctx.arc(sx!, sy!, sr!, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("sun", tex);
  return tex;
}

export function generateMercuryTexture(): THREE.CanvasTexture {
  if (textureCache.has("mercury")) return textureCache.get("mercury")!;
  const [canvas, ctx] = createCanvas(1024, 512);

  ctx.fillStyle = "#8c857b";
  ctx.fillRect(0, 0, 1024, 512);

  const imgData = ctx.getImageData(0, 0, 1024, 512);
  const data = imgData.data;
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const idx = (y * 1024 + x) * 4;
      const n = fbm(x / 45, y / 45, 5);
      const val = Math.floor(110 + n * 90);
      data[idx] = val;
      data[idx + 1] = val - 5;
      data[idx + 2] = val - 10;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Impact craters
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 90; i++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 512;
    const cr = 3 + Math.random() * 18;
    ctx.strokeStyle = "rgba(220, 220, 210, 0.4)";
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(40, 38, 35, 0.35)";
    ctx.beginPath();
    ctx.arc(cx + 1, cy + 1, cr * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("mercury", tex);
  return tex;
}

export function generateVenusTexture(): THREE.CanvasTexture {
  if (textureCache.has("venus")) return textureCache.get("venus")!;
  const [canvas, ctx] = createCanvas(1024, 512);

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#e6c280");
  grad.addColorStop(0.3, "#d9aa66");
  grad.addColorStop(0.7, "#bf8c40");
  grad.addColorStop(1, "#a6732e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Swirling cloud bands
  const imgData = ctx.getImageData(0, 0, 1024, 512);
  const data = imgData.data;
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const idx = (y * 1024 + x) * 4;
      const swirl = Math.sin(x / 40 + y / 20);
      const n = fbm(x / 80 + swirl, y / 30, 4);
      const blend = (n + (swirl + 1) / 2) / 2;
      data[idx] = Math.min(255, data[idx]! * (0.8 + blend * 0.35));
      data[idx + 1] = Math.min(255, data[idx + 1]! * (0.8 + blend * 0.3));
      data[idx + 2] = Math.min(255, data[idx + 2]! * (0.75 + blend * 0.25));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("venus", tex);
  return tex;
}

export function generateEarthTexture(): THREE.CanvasTexture {
  if (textureCache.has("earth")) return textureCache.get("earth")!;
  const [canvas, ctx] = createCanvas(2048, 1024);

  // Deep Blue Oceans
  ctx.fillStyle = "#0d2b45";
  ctx.fillRect(0, 0, 2048, 1024);

  const imgData = ctx.getImageData(0, 0, 2048, 1024);
  const data = imgData.data;

  for (let y = 0; y < 1024; y++) {
    const lat = (y / 1024) * Math.PI - Math.PI / 2; // latitude -pi/2 to pi/2
    for (let x = 0; x < 2048; x++) {
      const lon = (x / 2048) * Math.PI * 2;
      const idx = (y * 2048 + x) * 4;

      const landVal = fbm(x / 180, y / 120, 6);
      const isPolar = Math.abs(lat) > 1.25;

      if (isPolar) {
        // Polar Ice Caps
        data[idx] = 240;
        data[idx + 1] = 248;
        data[idx + 2] = 255;
      } else if (landVal > 0.48) {
        // Landmasses: Desert vs Vegetation vs Mountain
        const elev = (landVal - 0.48) * 2;
        if (elev > 0.6) {
          // Mountains
          data[idx] = 140;
          data[idx + 1] = 120;
          data[idx + 2] = 100;
        } else if (Math.abs(lat) < 0.45 && landVal < 0.54) {
          // Deserts / Savannas near equator
          data[idx] = 194;
          data[idx + 1] = 160;
          data[idx + 2] = 100;
        } else {
          // Forests / Grasslands
          data[idx] = 34 + Math.floor(elev * 40);
          data[idx + 1] = 112 + Math.floor(elev * 60);
          data[idx + 2] = 48;
        }
      } else {
        // Ocean variations
        const depth = landVal / 0.48;
        data[idx] = Math.floor(10 + depth * 15);
        data[idx + 1] = Math.floor(40 + depth * 35);
        data[idx + 2] = Math.floor(80 + depth * 70);
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("earth", tex);
  return tex;
}

export function generateEarthCloudsTexture(): THREE.CanvasTexture {
  if (textureCache.has("earthClouds")) return textureCache.get("earthClouds")!;
  const [canvas, ctx] = createCanvas(2048, 1024);

  const imgData = ctx.createImageData(2048, 1024);
  const data = imgData.data;

  for (let y = 0; y < 1024; y++) {
    for (let x = 0; x < 2048; x++) {
      const idx = (y * 2048 + x) * 4;
      const n = fbm(x / 140, y / 80, 5);
      const alpha = n > 0.52 ? Math.min(255, Math.floor((n - 0.52) * 4.5 * 255)) : 0;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("earthClouds", tex);
  return tex;
}

export function generateMoonTexture(): THREE.CanvasTexture {
  if (textureCache.has("moon")) return textureCache.get("moon")!;
  const [canvas, ctx] = createCanvas(1024, 512);

  ctx.fillStyle = "#b5b2aa";
  ctx.fillRect(0, 0, 1024, 512);

  const imgData = ctx.getImageData(0, 0, 1024, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const idx = (y * 1024 + x) * 4;
      const n = fbm(x / 50, y / 50, 5);
      const isMaria = fbm(x / 180, y / 120, 3) < 0.44; // Dark lunar maria plains
      const base = isMaria ? 75 + n * 40 : 160 + n * 60;
      data[idx] = base;
      data[idx + 1] = base - 2;
      data[idx + 2] = base - 4;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Impact Craters
  for (let i = 0; i < 120; i++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 512;
    const cr = 2 + Math.random() * 16;
    ctx.strokeStyle = "rgba(240, 240, 235, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(50, 50, 48, 0.3)";
    ctx.beginPath();
    ctx.arc(cx + 0.8, cy + 0.8, cr * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("moon", tex);
  return tex;
}

export function generateMarsTexture(): THREE.CanvasTexture {
  if (textureCache.has("mars")) return textureCache.get("mars")!;
  const [canvas, ctx] = createCanvas(1024, 512);

  ctx.fillStyle = "#c25e38";
  ctx.fillRect(0, 0, 1024, 512);

  const imgData = ctx.getImageData(0, 0, 1024, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    const lat = (y / 512) * Math.PI - Math.PI / 2;
    for (let x = 0; x < 1024; x++) {
      const idx = (y * 1024 + x) * 4;
      const n = fbm(x / 60, y / 50, 5);

      if (Math.abs(lat) > 1.35) {
        // Polar Ice Caps
        data[idx] = 245;
        data[idx + 1] = 245;
        data[idx + 2] = 250;
      } else {
        const darkRegion = fbm(x / 200, y / 140, 3) < 0.42;
        if (darkRegion) {
          data[idx] = Math.floor(130 + n * 30);
          data[idx + 1] = Math.floor(65 + n * 20);
          data[idx + 2] = Math.floor(40 + n * 15);
        } else {
          data[idx] = Math.floor(205 + n * 45);
          data[idx + 1] = Math.floor(100 + n * 25);
          data[idx + 2] = Math.floor(55 + n * 20);
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("mars", tex);
  return tex;
}

export function generateJupiterTexture(): THREE.CanvasTexture {
  if (textureCache.has("jupiter")) return textureCache.get("jupiter")!;
  const [canvas, ctx] = createCanvas(1024, 512);

  const imgData = ctx.createImageData(1024, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    const bandPattern = Math.sin((y / 512) * Math.PI * 18);
    const bandColor = (bandPattern + 1) / 2;

    for (let x = 0; x < 1024; x++) {
      const idx = (y * 1024 + x) * 4;
      const swirl = fbm(x / 70, y / 25, 4);

      // Great Red Spot check around x=650, y=340
      const dx = (x - 650) / 70;
      const dy = (y - 340) / 35;
      const isRedSpot = dx * dx + dy * dy < 1;

      if (isRedSpot) {
        data[idx] = 220;
        data[idx + 1] = 85;
        data[idx + 2] = 55;
      } else {
        const r = Math.floor(180 + bandColor * 55 + swirl * 20);
        const g = Math.floor(140 + bandColor * 45 + swirl * 15);
        const b = Math.floor(100 + bandColor * 30 + swirl * 10);
        data[idx] = Math.min(255, r);
        data[idx + 1] = Math.min(255, g);
        data[idx + 2] = Math.min(255, b);
      }
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("jupiter", tex);
  return tex;
}

export function generateSaturnTexture(): THREE.CanvasTexture {
  if (textureCache.has("saturn")) return textureCache.get("saturn")!;
  const [canvas, ctx] = createCanvas(1024, 512);

  const imgData = ctx.createImageData(1024, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    const band = Math.sin((y / 512) * Math.PI * 14);
    for (let x = 0; x < 1024; x++) {
      const idx = (y * 1024 + x) * 4;
      const n = fbm(x / 90, y / 30, 3);
      data[idx] = Math.floor(215 + band * 20 + n * 15);
      data[idx + 1] = Math.floor(190 + band * 18 + n * 12);
      data[idx + 2] = Math.floor(135 + band * 15 + n * 10);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("saturn", tex);
  return tex;
}

export function generateSaturnRingTexture(): THREE.CanvasTexture {
  if (textureCache.has("saturnRing")) return textureCache.get("saturnRing")!;
  const [canvas, ctx] = createCanvas(1024, 64);

  const imgData = ctx.createImageData(1024, 64);
  const data = imgData.data;

  for (let x = 0; x < 1024; x++) {
    const norm = x / 1024; // 0 (inner ring) to 1 (outer ring)
    let alpha = 0.85;
    let r = 210,
      g = 185,
      b = 140;

    if (norm < 0.12) {
      alpha = 0; // Inner gap
    } else if (norm > 0.58 && norm < 0.64) {
      alpha = 0.05; // Cassini Division gap!
    } else if (norm > 0.95) {
      alpha = 0; // Outer edge
    } else {
      const ringVariation = Math.sin(norm * Math.PI * 60);
      alpha = 0.5 + ringVariation * 0.35;
      r = Math.floor(190 + ringVariation * 30);
      g = Math.floor(165 + ringVariation * 25);
      b = Math.floor(125 + ringVariation * 20);
    }

    for (let y = 0; y < 64; y++) {
      const idx = (y * 1024 + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = Math.floor(alpha * 255);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("saturnRing", tex);
  return tex;
}

export function generateUranusTexture(): THREE.CanvasTexture {
  if (textureCache.has("uranus")) return textureCache.get("uranus")!;
  const [canvas, ctx] = createCanvas(1024, 512);

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#a6e3e9");
  grad.addColorStop(0.5, "#71c9ce");
  grad.addColorStop(1, "#52b2b8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("uranus", tex);
  return tex;
}

export function generateNeptuneTexture(): THREE.CanvasTexture {
  if (textureCache.has("neptune")) return textureCache.get("neptune")!;
  const [canvas, ctx] = createCanvas(1024, 512);

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#4b7bec");
  grad.addColorStop(0.5, "#3867d6");
  grad.addColorStop(1, "#26488c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Storm dark spot
  ctx.fillStyle = "rgba(15, 30, 90, 0.45)";
  ctx.beginPath();
  ctx.ellipse(600, 300, 70, 35, 0, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set("neptune", tex);
  return tex;
}

export function getPlanetTexture(id: BodyId): THREE.CanvasTexture {
  switch (id) {
    case "sun":
      return generateSunTexture();
    case "mercury":
      return generateMercuryTexture();
    case "venus":
      return generateVenusTexture();
    case "earth":
      return generateEarthTexture();
    case "moon":
      return generateMoonTexture();
    case "mars":
      return generateMarsTexture();
    case "jupiter":
      return generateJupiterTexture();
    case "saturn":
      return generateSaturnTexture();
    case "uranus":
      return generateUranusTexture();
    case "neptune":
      return generateNeptuneTexture();
  }
}
