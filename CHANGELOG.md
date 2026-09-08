# Changelog

All notable changes to the **OrbitSpan** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.5.0] - 2026-09-08

### 🚀 Added
- **Visual Scale Pedestal Modal (`VisualPedestalModal.tsx`)**: Engineered a mathematically rigorous physical comparison staging suite featuring dual-perspective visualization:
  - **Direct Planet vs. Earth (1:1 Ratio)**: Renders side-by-side comparison under a strict unified pixels-per-metre scale factor ($S = 160 / \max(D_E, D_P)$).
  - **With 1.8m Human**: Positions standing human silhouette alongside inspected planet and benchmark Earth ($S = 170 / (\max(1.8, D_E, D_P) \times 1.15)$), ensuring benchmark Earth and inspected Earth render with 100% identical pixel geometry.
  - **Everyday Object Analogies**: Maps celestial radii to tactile real-world artifacts (Grapefruit, Apple, Golf Ball, Pebble, Yoga Ball, Two-Story House) with physical feedback descriptions.
  - **Optical Distortion Sanitization**: Purged all stroke boundaries, outer rings, and dashed lines (`stroke="none"`) from celestial SVGs to eliminate optical radius inflation on miniature planetary bodies like the Moon and Mercury.
- **City Walk Journey Explorer (`CityJourneyModal.tsx`)**: Engineered an interactive "Walk the Solar System" expedition modal translating astronomical distances into real-world city walking routes:
  - **4 Global Metropolitan Centers**: New York City (Battery Park to Central Park/Columbia), London (Trafalgar Square to Greenwich/Hampstead), Paris (Eiffel Tower to Arc de Triomphe/La Défense), and Tokyo (Imperial Palace to Shinjuku/Roppongi).
  - **Live Biometric Telemetry**: Computes walking duration at 5.0 km/h, cumulative stride count (~0.762 m/step), active calorie expenditure (~0.04 kcal/step), vehicular transit at 100 km/h, and true scaled photon latency in `humanScaleData.ts`.
  - **Interactive Auto-Walk Simulation**: Interval-driven route progression with real-time waypoint milestones and street-level perspective logs.
- **3D Human Scale Grid (`HumanScaleGrid.tsx`)**: Rendered a high-contrast metric ground plane grid in `SolarSystemScene.tsx` when operating in Human Scale mode, providing spatial depth reference.

### ⚡ Changed & Unified
- **`useOrbitStore.ts`**: Added `isPedestalModalOpen` and `isCityWalkModalOpen` state flags with corresponding setters, plus `setSelectedBody` alias method for parity with `selectBody`.
- **`TopControlsBar.tsx`**: Integrated direct **[Pedestal]** and **[City Walk]** action triggers when viewing in Human Scale mode; mounted modal dialog portals at the HUD level.
- **`TelemetryInspector.tsx` & `BodyReadout.tsx`**: Integrated companion quick-action dispatch buttons for instant modal launching from any inspection card.
- **`HumanScalePanel.tsx`**: Added journey benchmark triggers and converted planetary badges into interactive modal inspection launchers.

### 🐛 Fixed
- **SSR Hydration Crash in `TopControlsBar.tsx`**: Resolved `ReferenceError: showMoons is not defined` during SSR by restoring the decoupled store selector.
- **`VisualPedestalModal.tsx` Dispatch Error**: Fixed selection dispatch failure where `setSelectedBody` was previously undefined on mount.
- **Scale Discrepancy on Benchmark Earth**: Resolved rendering bug where benchmark Earth and inspected Earth were computed using independent bounding boxes, resulting in unequal pixel radii for the same celestial body.

## [v1.4.0] - 2026-09-08

### 🚀 Added & Overhauled
- **Edge-to-Edge 3D Cosmos Canvas**: Replaced rigid 380px fixed desktop sidebar and cramped 52vh mobile view with an edge-to-edge full-viewport cosmos canvas (`100dvh`) in `src/routes/index.tsx`.
- **Unified Glass Top Controls Bar (`TopControlsBar.tsx`)**: Consolidated scattered mode notices and layer buttons into a single floating capsule with segmented scale mode pill, 1:1 real universe toggle switch, and celestial layers popover menu.
- **Floating Mission Clock & Epoch Controller (`MissionClockBar.tsx`)**: Engineered single-row compact playback speed selectors (`1h`, `1d`, `1w`, `1m`, `1y`), live UTC clock display, one-touch "Now" synchronization, and milestone date jumper popover.
- **Collapsible Telemetry HUD & Mobile Bottom Sheet**:
  - Desktop: Slide-out translucent telemetry sidebar with one-click toggle (`ExplorerHUD.tsx`).
  - Mobile: Native swipable bottom sheet drawer (`MobileInspectorDrawer.tsx` via `vaul`) providing instant celestial target switching and telemetry inspector without blocking 3D touch gestures.
- **Cinematic Zen Mode**: Implemented distraction-free viewing toggle (hotkeys: `Z` / `Esc`) and gesture hints with auto-fade timer.
- **Header-Integrated Feedback Portal**: Relocated floating feedback widget from bottom canvas into header navigation bar.

## [v1.3.0] - 2026-08-19

### 🚀 Added
- **Major Planetary Moons System**: Added full astronomical catalog and 3D simulation for 18+ major moons across Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto in `moons.ts`:
  - Mars: Phobos and Deimos.
  - Jupiter: Io, Europa, Ganymede, and Callisto synchronized to exact $4:2:1$ Laplace orbital resonance.
  - Saturn: Mimas, Enceladus, Tethys, Dione, Rhea, Titan (dense nitrogen atmosphere), and Iapetus.
  - Uranus: Miranda, Ariel, Umbriel, Titania, and Oberon.
  - Neptune: Triton (retrograde orbit) and Proteus.
  - Pluto: Charon tidally locked binary system.
- **Smart Camera Proximity Moon Orbit Rings**: Implemented dynamic distance-adaptive orbit line visibility in `PlanetaryMoons.tsx` where moon orbit rings and labels smoothly fade in when zooming into a planet or selecting a moon.
- **5,000+ Instanced Main Asteroid Belt**: High-performance GPU `THREE.InstancedMesh` with authentic Kirkwood gap distribution (depletions at 3:1, 5:2, 7:3, 2:1 resonances), Keplerian angular velocity ($\omega = \sqrt{\mu / a^3}$), and varied carbonaceous/silicate/metallic albedos in `AsteroidBelt.tsx`.
- **Outer Kuiper Belt**: Added 3,000+ icy planetesimals between 30 AU and 50 AU with cold/hot classical inclination dispersion in `KuiperBelt.tsx`.
- **Minor Bodies & Comets**: Added Keplerian analytical orbit solver in `minorBodies.ts` for Ceres, Vesta, Pallas, Pluto, and Comet 1P/Halley with dynamic solar-radiation pressure ion and dust tails pointing anti-sunward.
- **Comet 1P/Halley Geometric Orbit Spline Smoothing**: Rewrote Keplerian orbit spline calculation to sample 360 points uniformly across Eccentric Anomaly $E \in [0, 2\pi]$, eliminating angular chords/corners and rendering a mathematically smooth ellipse for extreme eccentricity comets ($e = 0.9671$).
- **Historic Deep Space Probes & JWST at L2**: 3D trajectory ribbons and position beacons for Voyager 1, Voyager 2, and New Horizons, plus James Webb Space Telescope (JWST) dynamically anchored at the Sun-Earth L2 Lagrange point ($1.5\text{ million km}$ anti-sunward behind Earth) with its authentic Lissajous halo orbit ring in `spacecraft.ts` & `SpacecraftScene.tsx`.
- **Universal Feedback & Star Rating Telemetry Widget**: Added zero-dependency `FeedbackWidget.tsx` integrating directly with our centralized telemetry backend gateway (`POST https://visar-backend.onrender.com/api/v1/feedback`) using native `window.fetch()`:
  - Interactive 1–5 star rating row with amber glow hover feedback.
  - Progressive disclosure: smoothly expands a 500-character comment field, optional Name & Email inputs, and submission trigger.
  - `localStorage` persistence anti-spam guard preventing duplicate prompts.
  - Dual placement: embedded in the shared site footer across all routes and as a floating dock in the full-screen desktop 3D Explorer.
- **3D Viewport Scene Layer Controls**: Added a sleek HUD layer control toolbar (`SceneLayerControls.tsx`) for 1-click toggling of Moons, Moon Orbits, Asteroids, Kuiper Belt, Probes, and Labels.
- **Categorized Target Selector**: Upgraded `BodySelector.tsx` with dedicated category tabs for **Planets**, **Moons**, **Dwarfs/Comets**, and **Probes**.
- **Universal Target CameraRig**: Upgraded camera tracking in `SolarSystemScene.tsx` to automatically frame and lock focus onto any planet, moon, minor body, or probe with adaptive near clipping.

### ⚡ Changed & Optimized
- **Instanced Buffer Lifecycle**: Replaced buffer memory reallocations with Three.js `mesh.count` active instance limiter in `AsteroidBelt.tsx` and `KuiperBelt.tsx` for zero-allocation performance mode switches.
- **Comet Tail Memory Management**: Memoized comet tail line geometries and coma meshes in `MinorBodiesScene.tsx`, eliminating dynamic buffer attribute leaks during simulation playback.
- **Persistent DOM Labels**: Converted Drei `<Html>` labels in `PlanetaryMoons.tsx`, `MinorBodiesScene.tsx`, and `SpacecraftScene.tsx` from conditional unmounting to persistent CSS opacity transitions, eliminating portal race conditions and reconciler crashes during camera zoom.

### 🐛 Fixed
- **Comet 1P/Halley Angular Orbit Kinks**: Fixed non-uniform time-based orbit sampling that generated straight-line chords near perihelion by switching to uniform Eccentric Anomaly $E$ sampling.
- **JWST Clipping Inside Earth**: Fixed coordinate compression issue where Sun-Earth L2 was calculated inside Earth's visual radius in exploration mode; repositioned JWST cleanly outside Earth and Lunar orbits at true L2.
- **3D Scene Crashing ("Try Again" Error)**: Replaced blocking error boundary with a silent auto-recovering boundary in `SceneHost.tsx` that logs to console and automatically remounts the 3D scene after 1.5s.

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
