# OrbitSpan — Future Vision & Phased Product Roadmap

> **Project Vision**: Transform OrbitSpan into the world's most scientifically rigorous, visually stunning, and intuitively engaging 3D Solar System exploration platform — combining live ephemeris math, photorealistic rendering, interactive gravity physics, and human-scale intuition.

---

## 🌟 Executive Summary & Milestone Progress

OrbitSpan has established its core scientific and rendering foundation:
* **VSOP87 Analytical Ephemeris Engine** aligned to Ecliptic J2000 coordinates.
* **100% Real Universe Scale Mode** with pure physical scale (Earth is $3.67\times$ Moon diameter at $60.33\times$ Earth radii distance).
* **Multi-Scale Viewing Modes** (Exploration, Scientific, Human Scale).
* **True 3D Lunar Geocentric Orbit Trajectories**.
* **Zero-Clipping Adaptive Camera** with WebGL Logarithmic Depth Buffer.
* **Smart Proximity 3D Labels** with camera distance auto-fading.
* **Gravity Lab** with real-time Newtonian acceleration ($a = GM/r^2$) and force ($F = ma$) calculations.

The updated roadmap below details what has been **delivered** and organizes upcoming features into unified, high-impact **execution phases**.

---

## 🚀 Phased Implementation Roadmap

### 📦 Phase 1: Foundation, True Scale & Visual Engine (v1.0 – v1.2)
*Status: ✅ **COMPLETED***

- [x] **High-Precision Analytical Ephemeris**: VSOP87 series planetary positions and velocities via `astronomy-engine` ([ephemeris.ts](file:///src/lib/orbit/ephemeris.ts)).
- [x] **100% Real Universe Scale Mode**: Pure, unconstrained physical planetary radii and astronomical distances without visual distortion ([sceneLayout.ts](file:///src/lib/orbit/sceneLayout.ts)).
- [x] **Universal Lunar Orbit Ring**: Real 3D lunar orbital spline rendered around Earth across all scale modes.
- [x] **Camera Near-Plane & Logarithmic Depth Buffer**: `logarithmicDepthBuffer: true` in R3F Canvas and dynamic near-plane adjustment (`camera.near = Math.max(1e-7, radius * 0.01)`) preventing visual clipping at extreme zoom ([SolarSystemScene.tsx](file:///src/components/orbit/scene/SolarSystemScene.tsx)).
- [x] **Smart Proximity 3D Labels**: Distance-adaptive auto-fading labels that prevent surface obstruction during close planet inspection.
- [x] **Procedural Textures & Atmospheric Shaders**: Offline procedural 2D canvas textures for all celestial bodies, rotating Earth cloud layer, translucent Saturn rings, and Sun corona glow ([textures.ts](file:///src/lib/orbit/textures.ts)).
- [x] **Time Engine & Scrubbing**: UTC simulation clock, step controls, real-time sync, and simulation speed multipliers from $1\text{ h/s}$ to $1\text{ yr/s}$ ([TimeControls.tsx](file:///src/components/orbit/TimeControls.tsx)).
- [x] **Newtonian Gravity Lab**: Real-time force & acceleration calculator with logarithmic Recharts visualization ([gravity-lab.tsx](file:///src/routes/gravity-lab.tsx)).
- [x] **Human Scale Model**: Real-time recalculation of solar system scale against everyday objects (grapefruit, basketball, pinhead) ([human-scale.tsx](file:///src/routes/human-scale.tsx)).
- [x] **PWA 2.0 & Offline Support**: Service Worker caching with offline status indicator and reduced-effects performance toggle.

---

### 🪐 Phase 2: Minor Bodies, Planetary Moons & Spacecraft (P0)
*Status: ✅ **COMPLETED (v1.3)***

#### 2.1 Main Asteroid Belt & Kuiper Belt Instancing
- [x] **5,000+ Instanced Asteroids**: High-performance GPU `THREE.InstancedMesh` with semi-major axes, eccentricities, and realistic Kirkwood gaps ([AsteroidBelt.tsx](file:///src/components/orbit/scene/AsteroidBelt.tsx)).
- [x] **Major Dwarf Planets & Minor Bodies**: Ceres, Vesta, Pallas, and Pluto-Charon with analytical Keplerian ephemeris solver ([minorBodies.ts](file:///src/lib/orbit/minorBodies.ts)).
- [x] **Comets & Dynamic Tails**: Periodic comet 1P/Halley with dynamic solar-radiation pressure dust and ion tails pointing anti-sunward ([MinorBodiesScene.tsx](file:///src/components/orbit/scene/MinorBodiesScene.tsx)).
- [x] **Outer Kuiper Belt**: 3,000+ icy planetesimals between 30 AU and 50 AU with Keplerian orbital motion ([KuiperBelt.tsx](file:///src/components/orbit/scene/KuiperBelt.tsx)).

#### 2.2 Planetary Moon Systems
- [x] **Major Planetary Moons Catalog**: 18+ major moons across Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto with 100% exact physical radii and orbital periods ([moons.ts](file:///src/lib/orbit/moons.ts)).
- [x] **Jupiter's Galilean Moons**: Io, Europa, Ganymede, and Callisto synchronized to exact $4:2:1$ Laplace orbital resonance.
- [x] **Smart Proximity Moon Orbit Rings**: Distance-adaptive orbit line visibility that smoothly fades in on zooming into a planet or selecting a moon ([PlanetaryMoons.tsx](file:///src/components/orbit/scene/PlanetaryMoons.tsx)).
- [x] **Universal Target Camera & Inspector**: Target selection and seamless camera zoom for all moons, minor bodies, and probes ([BodySelector.tsx](file:///src/components/orbit/BodySelector.tsx)).

#### 2.3 Historic Spacecraft & Probe Trajectories
- [x] **Interstellar & Deep Space Missions**: Voyager 1, Voyager 2, and New Horizons 3D escape trajectory ribbons with historic milestone markers ([spacecraft.ts](file:///src/lib/orbit/spacecraft.ts)).
- [x] **Modern Observatories**: James Webb Space Telescope (JWST) at Sun-Earth Lagrange Point L2.
- [x] **HUD Scene Layer Controls**: 1-click toggles for Moons, Moon Orbits, Asteroids, Kuiper Belt, Probes, and Labels ([SceneLayerControls.tsx](file:///src/components/orbit/scene/SceneLayerControls.tsx)).

---

### 📅 Phase 3: Live Astronomical Event Engine & Time Warp (P0)
*Status: ⏳ **PLANNED***

#### 3.1 Automated Celestial Event Scanner
- **Planetary Conjunctions**: Real-time scan for close angular separations between planets (e.g. Great Conjunction of Jupiter and Saturn).
- **Solar & Lunar Eclipses**: Compute eclipse dates, umbra/penumbra geometry, and totality paths.
- **Transits & Oppositions**: Mercury and Venus solar transits; outer planet oppositions and perihelion/aphelion alignments.

#### 3.2 "Jump to Event" Interactive Timeline Bar
- **One-Click Time Warp**: Curated historical and upcoming astronomical event list (e.g. 2020 Great Conjunction, 2024 Total Solar Eclipse, 2029 Apophis Flyby).
- **Interactive Event Playback**: Clicking an event smoothly warps the simulation clock and aligns the 3D camera to the optimal observation angle.

#### 3.3 Historical Satellite & Spacecraft Launch Replay Engine
- **Time-Synchronized Mission Launch Animation**: Interactive mission playback allowing users to select iconic spacecraft (Voyager 1, Voyager 2, New Horizons, Cassini, Parker Solar Probe) and watch their dynamic launch sequence from Earth, translunar/interplanetary injection, and outward flight across the Solar System.
- **Planetary Gravity Assist & Slingshot Dynamics**: Step-by-step visual animation demonstrating how planetary gravity assists (e.g. Voyager 1 & 2 flybys of Jupiter, Saturn, Uranus, Neptune) boosted orbital velocity and redirected trajectories into interstellar space.
- **Interactive Mission Time Scrubber & Milestone Timeline**: Set and scrub the simulation clock to any exact epoch along the probe's journey (e.g. Voyager 1 launch on Sept 5, 1977; Jupiter encounter on March 5, 1979; Saturn flyby on Nov 12, 1980; Heliopause crossing on Aug 25, 2012) to see where the spacecraft was relative to all planets at that exact date and time.
- **Telemetry HUD & Camera Tracking Modes**: Real-time display of heliocentric distance (AU / km), velocity relative to the Sun ($v_{\text{rel}}$ in km/s), round-trip light time communication latency, and switchable camera modes ("Earth Departure View", "Planet Flyby Chase Cam", and "Heliocentric Overview").

---

### ⚛️ Phase 4: Interactive N-Body Gravity Sandbox & Slingshot Lab (P1)
*Status: ⏳ **PLANNED***

#### 4.1 Interactive Spacecraft / Particle Launcher (Gravity Sandbox)
- **4th-Order Runge-Kutta (RK4) Numerical Integrator**: Drop custom test spacecraft or particles into the 3D Solar System with user-defined initial position and velocity vector $\vec{v}_0$.
- **Gravitational Slingshots (Gravity Assists)**: Simulate real orbital mechanics, Oberth effect maneuvers, and hyperbolic trajectory bends around massive bodies (Jupiter, Earth, Sun).
- **Live Vector Field Visualizer**: Display gravitational acceleration vectors and potential wells in the Gravity Lab.

#### 4.2 Tidal Force & Roche Limit Inspector
- **Tidal Acceleration Computation**:
  $$a_{\text{tidal}} \approx \frac{2 \cdot G \cdot M \cdot R}{r^3}$$
- **Roche Limit Indicator**: Visual dynamic boundary around planets showing the critical tidal disruption radius where celestial bodies get torn apart into rings.

---

### 🎬 Phase 5: Cinematic Planet Tour & Cosmic Audio Synthesizer (P1)
*Status: ⏳ **PLANNED***

#### 5.1 Cinematic Guided Solar System Tour
- **Curated Fly-By Mode**: One-click guided tour mode that takes the user on a smooth, cinematic camera journey from the Sun through all planets, moons, and belts.
- **Dynamic HUD Overlays**: Synchronized scientific fun facts, mission discoveries, and atmospheric properties presented during each planetary fly-by.

#### 5.2 Cosmic Web Audio Synthesizer
- **Procedural Resonance Drones**: Web Audio API synth generating ambient drone pads tuned to harmonic orbital resonance frequencies.
- **NASA Space Acoustics**: Spatialized 3D audio emitters around planets incorporating NASA Voyager & Juno radio plasma emission recordings, with mute/volume controls.

---

### 🥽 Phase 6: WebXR Spatial Computing & Immersion (P2)
*Status: ⏳ **FUTURE***

#### 6.1 WebXR Virtual Reality (VR Mode)
- Full 360° 6DoF spatial VR exploration compatible with Meta Quest and Apple Vision Pro.

#### 6.2 WebXR Augmented Reality (AR Tabletop Mode)
- Project the Human-Scale solar system (e.g., 10 cm Earth model) directly onto the user's real-world desk or floor via WebXR plane detection.

---

## 📊 Summary Roadmap Matrix

| Milestone | Key Initiatives | Priority | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | VSOP87 Engine, 100% Real Scale, Lunar Orbit, Procedural Shaders, Gravity Lab, PWA | Critical | ✅ **Completed (v1.2)** |
| **Phase 2** | 5,000+ Asteroid Belt, Galilean Moons, Titan, Kuiper Belt, Spacecraft Trajectories | P0 | ✅ **Completed (v1.3)** |
| **Phase 3** | Live Celestial Event Scanner, Historical Spacecraft Launch Replay (Voyager 1/2), Time Warp | P0 | ⏳ **Next Up** |
| **Phase 4** | RK4 N-Body Gravity Sandbox, Orbital Slingshots, Roche Limit & Tidal Inspector | P1 | ⏳ **Planned** |
| **Phase 5** | Cinematic Fly-By Tour Mode, Web Audio Procedural Space Synthesizer | P1 | ⏳ **Planned** |
| **Phase 6** | WebXR 360° VR Mode, WebXR Tabletop AR Solar System | P2 | ⏳ **Future** |
