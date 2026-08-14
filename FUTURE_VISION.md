# OrbitScale — Future Vision & Phased Product Roadmap

> **Project Vision**: Transform OrbitScale into the world's most scientifically rigorous, visually stunning, and intuitively engaging 3D Solar System exploration platform — combining live ephemeris math, photorealistic rendering, interactive gravity physics, and human-scale intuition.

---

## 🌟 Executive Summary & Core Objectives

OrbitScale V1 established the scientific foundation: live ephemeris coordinates from `astronomy-engine` (VSOP87 series), exact Ecliptic J2000 frame alignment, true 3D orbital trajectories, Newtonian gravity calculations ($a = GM/r^2$, $F = ma$), and live Human-Scale transformations.

The **Future Vision** elevates OrbitScale from a functional educational tool to an award-winning, state-of-the-art interactive space experience.

---

## 🚀 Phased Implementation Plan

### 🎨 Phase 1: Photorealism, Textures & Scientific Camera Zoom (P0)

#### 1.1 Unlimited Scientific Mode Camera Zoom (Logarithmic Depth Buffer)
- **Scientific Zoom Fix**:
  - Implement dynamic near-plane adjustment in `CameraRig` (`camera.near = Math.max(0.00001, currentFocusDistance * 0.001)`).
  - Enable WebGL Logarithmic Depth Buffer (`logarithmicDepthBuffer: true` in R3F `<Canvas>`).
  - Add **Focus Lock & Orbit Zoom Controls**: Double-tapping/clicking any planet locks the camera to its local frame, smoothly adjusting camera FOV and distance from 0.001 units to 100 units without visual clipping or camera jitter.

#### 1.2 Photorealistic Planet Surface Shaders & Texturing
- **Texture Engine**:
  - Load 2K/4K PBR texture maps (Albedo, Normal/Bump, Specular, Roughness, Night Lights).
  - **Earth**: Multi-layer mesh with ground texture, dynamic night-side city lights (emissive shader), rotating cloud layer with transparency, and Rayleigh/Mie atmosphere rim shader.
  - **Sun**: Volumetric solar atmosphere shader with procedural plasma turbulence, sunspots, and animated solar flare/corona glow.
  - **Saturn & Uranus Rings**: Custom 2D ring geometry with ring opacity maps, semi-transparent ring shadowing cast onto the planet body, and back-lit scattering.
  - **Venus**: Dense atmospheric cloud deck shader.
  - **Jupiter & Gas Giants**: Animated atmospheric band shear shaders (Great Red Spot rotation).

---

### 🪐 Phase 2: Expanded Astronomical Engine & Phenomena (P1)

#### 2.1 Minor Bodies & Asteroid Belts
- **Main Asteroid Belt**: Render 5,000+ instanced asteroids (Ceres, Vesta, Pallas, Hygiea) in Keplerian orbits between Mars and Jupiter using THREE.`InstancedMesh`.
- **Kuiper Belt & Dwarf Planets**: Add Pluto, Charon, Eris, Haumea, Makemake, and Sedna with true eccentric orbits.
- **Comets & Outgassing Effects**: Add periodic comets (Halley, 67P, C/2023 A3) with dynamic dust and ion tails pointing away from the Sun.

#### 2.2 Live Astronomical Event Predictor
- **Event Timeline Bar**: Automatically scan time windows for:
  - Planetary Conjunctions (two planets close in angular distance).
  - Oppositions (outer planet opposite the Sun).
  - Transits (Mercury or Venus passing in front of the Sun).
  - Solar & Lunar Eclipses.
- **"Jump to Event" Button**: One-click navigation to historical and upcoming celestial events (e.g. Great Conjunction of 2020, Total Solar Eclipse of 2024).

#### 2.3 Real Spacecraft Trajectories
- Integrate historic and active probe trajectories (Voyager 1, Voyager 2, New Horizons, James Webb Space Telescope at Lagrange Point L2, Artemis missions).

---

### ⚛️ Phase 3: Interactive Physics & Gravity Sandbox (P1)

#### 3.1 N-Body Orbital Simulator (Gravity Sandbox)
- Add a "Create Particle / Spacecraft" tool in Gravity Lab.
- Allow users to place a test particle in 3D space, set its initial velocity vector $\vec{v}$, and watch its path calculated live using 4th-Order Runge-Kutta (RK4) numerical integration against all 10 solar system bodies.
- Support slingshot maneuvers (gravitational assists) around Jupiter or Earth.

#### 3.2 Tidal Force & Roche Limit Inspector
- **Tidal Acceleration Formula**:
  $$a_{\text{tidal}} \approx \frac{2 \cdot G \cdot M \cdot R}{r^3}$$
- Calculate and display tidal force stretch across a human body, an ocean, or a moon.
- **Roche Limit Indicator**: Show the critical distance at which a moon would be torn apart by planetary tidal forces.

---

### 🎧 Phase 4: Immersive UX, Audio & WebXR (P2)

#### 4.1 Cosmic Audio Synthesizer
- Procedural ambient audio engine generated using Web Audio API:
  - Frequency-modulated drone pads tuned to planetary orbital resonance ratios.
  - Radio emission audio clips captured by NASA Voyager & Juno converted into spatialized 3D audio positional emitters around each planet.

#### 4.2 WebXR (Virtual & Augmented Reality)
- **VR Mode**: Step into a full 360° space view on Meta Quest or Vision Pro.
- **AR Tabletop Mode**: Project the Human-Scale Solar System (10 cm Earth model) directly onto the user's real-world desk using WebXR AR session markers.

---

## 🛠️ Step-by-Step Execution Phases

1. **Phase 1 (Immediate Next Step)**: Scientific Camera Zoom Fix (Logarithmic Depth Buffer + Adaptive Near Plane) & Photorealistic PBR Textures.
2. **Phase 2**: Asteroid Belt Instanced Rendering & Live Astronomical Event Predictor (Conjunctions/Transits).
3. **Phase 3**: N-Body Gravity Sandbox & Spacecraft Slingshot Launcher.
4. **Phase 4**: Web Audio Space Pads & WebXR VR/AR Tabletop Mode.
5. **Phase 5**: Web Worker Math Offloading & Offline PWA 2.0.
