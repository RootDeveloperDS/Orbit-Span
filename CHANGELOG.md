# Changelog

All notable changes to the **OrbitSpan** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.2.0] - 2026-08-18

### 🚀 Added
- **100% Real Universe Scale Mode**: Added pure, mathematically unconstrained 1:1 physical planetary radii and astronomical distances (Earth is $3.667\times$ Moon diameter, Moon orbits at $60.33\times$ Earth radii) in `sceneLayout.ts` with dedicated UI toggle in `ModeSwitch.tsx` and HUD notice banner.
- **Universal Lunar Orbit Ring**: Added real 3D lunar orbit trajectories rendered around Earth across all scale modes (Scientific, Exploration, and Human Scale).
- **Live Ephemeris Orbit Trajectory Alignment**: Upgraded planetary orbital spline resolution to 256 segments and lunar geocentric orbit paths to 128 segments in `ephemeris.ts` with vertex 0 locked to the instantaneous celestial body coordinate.
- **Smart Distance-Adaptive 3D Labels**: Implemented camera-proximity auto-fading in `SolarSystemScene.tsx` so labels float above planets without obstructing planetary surfaces or cloud layers when zoomed in close.
- **Labels Toggle**: Added quick **Labels: ON/OFF** toggle controls in both the scale mode panel and the 3D viewport HUD notice.

### ⚡ Changed
- **Decoupled Camera Snap from Render Cycles**: Replaced array reference dependencies in `CameraRig` with stable mutable `useRef` vector tracking, eliminating repeated camera snaps during live simulation playback.
- **Buffer Geometry Optimization**: Replaced dynamic per-tick geometry recreation with `StableOrbitLine` and ref-based lunar orbit tracking, saving GPU buffer allocations and delivering steady 60/120 FPS.
- **Module-Level Ephemeris Caching**: Added singleton state cache `getCachedState(epochMs)` and adaptive sampling intervals (8 Hz / 4 Hz) in `useSolarSystemState.ts` to eliminate duplicate ephemeris computations across components.
- **Direct Store Subscription**: Refactored `BodyReadout.tsx` to read simulation state directly, removing unnecessary page shell re-renders from `routes/index.tsx`.

### 🐛 Fixed
- **Simulation Screen Flicker & Blanking**: Fixed the issue where running simulation playback at high speed caused the 3D scene to flicker black/bluish.
- **Mobile WebGL False Alarms**: Hardened WebGL detection in `SceneHost.tsx` with context loss verification and added a self-recovering `SceneErrorBoundary` with a "Try Again" action.
- **PWA Cache Invalidation**: Bumped service worker cache from `orbitspan-v1` to `orbitspan-v2` in `public/sw.js` to purge stale bundles on mobile devices.
- **Camera Zoom Clipping**: Configured dynamic near clipping plane adjustments (`Math.max(1e-7, radius * 0.01)`) enabling close-range planet inspection.

---

## [v1.0.0] - 2026-08-15

### 🚀 Added
- **Interactive Time Scrubbing**: UTC simulation clock with speeds from $1\text{ h/s}$ to $1\text{ yr/s}$.
- **Comprehensive Educational & Scientific Notice**: Clarifications on Newtonian acceleration vs. astrological assertions.
- **SSR-Ready Architecture**: Full integration with TanStack Router, TanStack Start, and Nitro server build target.
- Initial release of OrbitSpan.
- VSOP87 planetary analytical ephemeris calculations via Astronomy Engine.
- Three rendering modes: Scientific, Exploration, and Human Scale.
- Gravity Lab with real-time Newtonian force calculator and logarithmic chart visualizations.
- Science & Methodology library explaining inverse-square laws and coordinate transformations.
- Offline-first PWA architecture with Service Worker caching.
