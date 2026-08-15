# Cosmic Scale Explorer

Build a production-quality educational astronomy web app called OrbitSpan. This must be a real functional V1, not a landing-page mockup. The user already has a GitHub repo RootDeveloperDS/Orbit-Scale, but build the complete portable standard TypeScript project in this Lovable project; do not require GitHub integration to begin.

PRODUCT: OrbitSpan helps users understand Solar System scale and the actual gravitational influence of planets on a human. Scientific message: every planet gravitationally attracts you, but there is no established scientific evidence that planetary positions determine personality, luck, relationships, destiny, or future events. Do not use insulting or sensational anti-astrology language.

V1 MUST LET USERS: explore a real interactive 3D Solar System; select date/time and see calculated planetary positions update; select a body and see Earth-body distance, gravitational acceleration and force on a user-selected mass; use Human Scale where Earth is 1cm/5cm/10cm/25cm/50cm/1m/custom (10cm labeled approximate fist reference); compare gravity logarithmically; switch scientific scale / exploration / human scale; read methodology and physics-vs-astrology education; use the core experience offline after caching; work on mobile and desktop.

TECH STACK: TypeScript, React, Tailwind, shadcn/ui, React Three Fiber + Three.js, Zustand or similarly small state library, Astronomy Engine for client-side planetary calculations. No database, no authentication, no paid services, no server-side physics, no live astronomy API calls, no unnecessary API routes. The app must be client-first and Vercel-Hobby-friendly: Vercel primarily serves static assets; browser CPU/GPU performs astronomy, physics and 3D rendering.

ASTRONOMY: use Astronomy Engine's real planetary position/vector APIs for arbitrary timestamps instead of fake circular motion. Keep a single canonical UTC simulation timestamp internally; make timezone explicit in UI. Calculate Earth-relative vectors and distances from the astronomical state. Do not hardcode one universal Earth-Jupiter distance. For animation, avoid expensive astronomy calculations every React frame; calculate controlled simulation states and interpolate/render smoothly. Document the astronomy model and limitations in Sources/Methodology.

PHYSICS: centralize SI constants, including G=6.67430e-11. Centralize typed body metadata (mass, radius/diameter). Calculate a=G*M/r^2 and F=m*a. Distinguish acceleration from force. Scientific notation formatting must be accessible. Test formulas and representative expected ranges. Do not claim weak gravity alone disproves astrology; explain that the scientific problem is lack of evidence for claimed causal/predictive effects.

HUMAN SCALE: Earth is the reference diameter. Convert real astronomical distances using the ratio of chosen reference Earth diameter to real Earth diameter. Show Moon, Sun and planets with dynamically calculated distances; distances vary with orbital positions. For 10cm Earth, show approximate translated distances such as Moon ~3m, Sun ~1.17km and outer planets tens of km, but calculate dynamically rather than hardcode. Do not attempt to render a literal tens-of-kilometers WebGL world; use an educational measurement/scale-space visualization and distance cards/markers.

3 MODES: (1) Scientific/Real Scale: true relative planet sizes and distances, with explanation that planets become tiny; (2) Exploration: useful orbit/distance layout but planet sizes enlarged, with persistent label that sizes are visually exaggerated; (3) Human Scale: chosen Earth reference size and intuitive translated distances.

3D: full-screen responsive WebGL/React Three Fiber centerpiece. Sun + Mercury/Venus/Earth/Mars/Jupiter/Saturn/Uranus/Neptune, Moon where practical, orbit paths, labels, click/tap selection, camera focus, smooth controls, timeline/playback speed controls, NOW button, date/time picker. Use restrained premium observatory/scientific aesthetics, not generic AI SaaS. Avoid huge textures and expensive postprocessing. Add performance/reduced-effects mode and WebGL fallback/error boundary.

GRAVITY LAB: default user mass 70kg, editable. Selected body, current distance, acceleration m/s², force N, Earth comparison, logarithmic gravity visualization across bodies, intuitive explanation. Include Sun/Moon/planets.

EDUCATION: explain scale, inverse-square law, distance changes, acceleration vs force, planetary motion, what physics says about planetary influence, and a careful Physics vs Astrology section. Include Sources/Methodology with Astronomy Engine attribution and links/documentation, Newtonian calculation method, constants and visualization limitations.

OFFLINE/BANDWIDTH: PWA/service-worker foundation; cache app shell and core static assets; core simulation must work offline after initial cache. No third-party live astronomy API. Lazy-load noncritical assets/textures. Keep initial payload lean; avoid massive datasets. Clearly indicate offline state and gracefully handle unsupported browser/service-worker situations. Do not make a false guarantee of universal offline support.

PERFORMANCE: strict TypeScript, pure astronomy/physics/scale modules separated from React UI, no any unless unavoidable, no per-frame React state, avoid allocations in render loops, dispose Three resources, respect prefers-reduced-motion, low-power/mobile fallback, memoize appropriately, minimal dependencies, unit tests for physics/scale/formatting and key astronomy calculations, basic E2E smoke coverage, production build must pass.

DESIGN: Brand OrbitSpan. No logo exists; create a simple temporary text/icon mark. Dark near-black/navy space background, restrained cyan/blue/white accents, premium observatory/instrument feel, strong typography, sparse glass panels, no excessive neon. 3D scene is the centerpiece. Responsive mobile layout.

ROUTES/SECTIONS: Home/Explorer, Gravity Lab, Human Scale, Science/Learn, Sources/Methodology. Prefer one app shell and avoid duplicating heavy 3D scenes.

IMPORTANT: Build the actual working V1 now. Do not stop at a mockup. Prioritize scientific core, real calculated planetary positions, working 3D, gravity, scale engine, responsive UX, offline foundation and tests over decorative effects. Do not add Supabase/database/auth. At completion, report implementation summary, architecture, test/build status, and known limitations.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ced50477-0599-412a-9939-9f57056c479d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
