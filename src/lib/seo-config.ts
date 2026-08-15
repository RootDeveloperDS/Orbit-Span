/**
 * OrbitSpan — Centralized SEO, GEO & Schema.org Configuration
 * Comprehensive keyword dictionaries, structured data generators, and metadata builders.
 */

export const BASE_URL = "https://orbitspan.vercel.app";
export const SITE_NAME = "OrbitSpan";
export const SITE_TAGLINE = "Interactive Solar System Scale, Live Ephemeris & Gravity Engine";
export const AUTHOR_NAME = "Devansh Sharma";
export const AUTHOR_URL = "https://devanshsharma.vercel.app/";
export const GITHUB_REPO_URL = "https://github.com/RootDeveloperDS/Orbit-Span";
export const TWITTER_HANDLE = "@devanshsha6563";
export const DEFAULT_OG_IMAGE = `${BASE_URL}/logo.png`;
export const DEFAULT_OG_IMAGE_ALT = "OrbitSpan — Interactive 3D Solar System & Orbital Scale Platform";

/**
 * Global Search Keywords
 */
export const GLOBAL_KEYWORDS = [
  "OrbitSpan",
  "Orbit Span",
  "Cosmic Scale Explorer",
  "Solar System 3D Simulator",
  "Real Planetary Positions",
  "Live Planetary Ephemeris",
  "Planetary Gravity Calculator",
  "Human Scale Solar System",
  "Astrophysics Simulation Web App",
  "WebGL Solar System",
  "Three.js Planetarium",
  "Newtonian Gravitation Calculator",
  "Inverse Square Law Physics",
  "VSOP87 Ephemeris JS",
  "Astronomy Engine",
  "True Scale Space",
  "Planetary Distances Live",
  "Physics vs Astrology Evidence",
  "Earth Moon Sun Scale Model",
  "Interactive Space Science",
  "Celestial Mechanics Simulator",
  "Devansh Sharma",
  "RootDeveloperDS",
];

export interface RouteSeoConfig {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
  breadcrumbs: { name: string; path: string }[];
}

export const ROUTE_SEO: Record<string, RouteSeoConfig> = {
  explorer: {
    path: "/",
    title: "OrbitSpan — Interactive 3D Solar System, Live Ephemeris & Planetary Scale",
    description:
      "Explore the Solar System in interactive 3D with live calculated planetary positions (VSOP87 ephemeris), true-scale orbital distances, and real-time gravitational readouts.",
    keywords: [
      "Solar System 3D simulator",
      "Interactive 3D Solar System",
      "Real time planetary positions",
      "Live planet tracker online",
      "3D orbit visualizer WebGL",
      "Planetary ephemeris calculator",
      "True scale Solar System model",
      "Exploration mode vs scientific scale",
      "Astronomical units distance calculator",
      "Heliocentric coordinates 3D",
      "Geocentric planetary distance",
      "VSOP87 planetary theory simulation",
      "Interactive planets Three.js",
      "Celestial mechanics web application",
      "Real-time astronomy browser app",
      "Solar system map interactive",
      "Sun Earth Mars Jupiter Saturn 3D",
      "Planetary orbital mechanics live",
      "Free astronomy educational software",
      "Open source 3D planetarium",
      "Accurate orbital trajectories web",
      "Space exploration simulator 3D",
      "Offline PWA space explorer",
      "Physics based planetary engine",
    ],
    changefreq: "daily",
    priority: 1.0,
    breadcrumbs: [{ name: "3D Explorer", path: "/" }],
  },
  gravityLab: {
    path: "/gravity-lab",
    title: "Gravity Lab — Real-Time Planetary Gravitational Pull Calculator | OrbitSpan",
    description:
      "Enter your body mass to calculate the real Newtonian gravitational acceleration (a = GM/r²) and force (F = ma) exerted on you by the Sun, Moon, and every planet live.",
    keywords: [
      "Planetary gravity calculator",
      "Real gravity pull from planets on human",
      "Newtonian gravitation simulator",
      "Gravitational acceleration calculator a = GM/r2",
      "Gravitational force calculator F = ma",
      "Inverse square law gravity calculator",
      "Calculate Jupiter gravity on human body",
      "Mars gravitational pull on Earth person",
      "Planetary mass gravitational field",
      "Astrology planetary influence physics test",
      "Physics vs astrological force calculation",
      "Celestial gravity comparison chart",
      "Gravitational pull comparison human vs planet",
      "Planetary alignment gravity myth",
      "Real time planetary force tool",
      "Newton law of universal gravitation online",
      "CODATA gravitational constant calculator",
      "Mass of planets gravitational attraction",
      "Interactive gravity laboratory web app",
      "STEM astrophysics gravity education",
    ],
    changefreq: "weekly",
    priority: 0.9,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Gravity Lab", path: "/gravity-lab" },
    ],
  },
  humanScale: {
    path: "/human-scale",
    title: "Human Scale Solar System — Intuitive Cosmic Distances | OrbitSpan",
    description:
      "Shrink Earth to the size of a marble (1 cm), a golf ball (5 cm), a fist (10 cm), or a basketball (25 cm) to discover where the Moon, Sun, and planets sit at true physical scale.",
    keywords: [
      "Human scale solar system",
      "If Earth was a fist size",
      "If Earth were a marble how big is the solar system",
      "Scaled solar system distance calculator",
      "Intuitive solar system scale model",
      "Shrunk solar system model dimensions",
      "Earth size comparison scale model",
      "Distance to Moon at human scale",
      "Distance to Sun if Earth is 10cm",
      "Scale model of the planets walking distance",
      "Cosmic scale comparison tool",
      "Space scale visualizer",
      "True relative distance of planets",
      "Human sized astronomy benchmarks",
      "Understand space distance intuitively",
      "Scale of the universe interactive model",
      "Solar system scale in meters and kilometers",
      "Classroom solar system scale experiment",
      "Physical scale model planets ratios",
      "Astronomy education scale visualization",
    ],
    changefreq: "weekly",
    priority: 0.9,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Human Scale", path: "/human-scale" },
    ],
  },
  learn: {
    path: "/learn",
    title: "Science & Physics of Cosmic Scale & Gravity | OrbitSpan",
    description:
      "Master the physics of cosmic scale: the inverse-square law, acceleration vs force, planetary ephemerides, tidal forces, and a rigorous scientific evaluation of physics vs astrology.",
    keywords: [
      "Astrophysics educational guide",
      "Science of cosmic scale explained",
      "Inverse square law gravity explained",
      "Gravitational acceleration versus force difference",
      "How planets move in space orbital mechanics",
      "VSOP87 ephemeris theory explained",
      "Meeus lunar theory simplified",
      "Ocean tides and tidal force physics",
      "Physics vs astrology scientific analysis",
      "Planetary alignment scientific evidence",
      "Why astrology is not supported by physics",
      "Astrological claims and physical mechanics",
      "Newtonian mechanics vs general relativity in astronomy",
      "Euclidean distance in solar system calculations",
      "Astronomy educational concepts explained",
      "STEM space physics lessons",
      "Why space is mostly empty physics",
      "Planetary distance variance synodic cycle",
      "Scientific literacy in astronomy",
      "Clear physics guide to planetary gravity",
    ],
    changefreq: "monthly",
    priority: 0.8,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Science & Learn", path: "/learn" },
    ],
  },
  sources: {
    path: "/sources",
    title: "Data Sources, Constants & Mathematical Methodology | OrbitSpan",
    description:
      "Explore the open-source astronomy ephemeris (VSOP87 / Meeus), NASA JPL planetary parameters, CODATA & IAU physical constants, and computational methods powering OrbitSpan.",
    keywords: [
      "Astronomy Engine JS Don Cross",
      "VSOP87 planetary series algorithm",
      "Meeus ELP lunar theory ephemeris",
      "IAU 2012 astronomical unit constants",
      "CODATA gravitational constant G",
      "NASA JPL planetary fact sheet data",
      "Center to center Euclidean distance astrophysics",
      "Offline PWA astronomy tool architecture",
      "Open source space simulation code",
      "Ephemeris computation methodology",
      "Pure client-side astronomy calculation",
      "Equatorial J2000 coordinate frame conversion",
      "TanStack Start Three.js astronomy architecture",
      "Planetary mass and mean diameter constants",
      "Astronomy JavaScript API documentation",
      "Astronomical algorithms implementation",
    ],
    changefreq: "monthly",
    priority: 0.8,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Sources & Methodology", path: "/sources" },
    ],
  },
};

/**
 * Generate Structured JSON-LD for WebSite & Organization
 */
export function getRootSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: SITE_NAME,
        alternateName: ["Orbit Span", "OrbitScale", "Cosmic Scale Explorer"],
        description:
          "Interactive 3D Solar System exploration platform with live ephemeris planetary positions, true Newtonian gravity calculations, and intuitive human-scale models.",
        publisher: {
          "@id": `${BASE_URL}/#organization`,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "RootDeveloperDS",
        url: AUTHOR_URL,
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_OG_IMAGE,
          width: 512,
          height: 512,
        },
        founder: {
          "@type": "Person",
          name: AUTHOR_NAME,
          url: AUTHOR_URL,
          sameAs: [
            "https://github.com/RootDeveloperDS",
            "https://www.linkedin.com/in/devanshsharma987",
            "https://x.com/devanshsha6563",
            "https://t.me/developerofroot",
          ],
        },
        sameAs: [
          GITHUB_REPO_URL,
          "https://github.com/RootDeveloperDS",
          "https://x.com/devanshsha6563",
        ],
      },
      {
        "@type": "WebApplication",
        "@id": `${BASE_URL}/#webapp`,
        url: BASE_URL,
        name: SITE_NAME,
        applicationCategory: "EducationalApplication",
        operatingSystem: "All",
        browserRequirements: "Requires WebGL support (Modern Chrome, Safari, Edge, Firefox)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@type": "Person",
          name: AUTHOR_NAME,
          url: AUTHOR_URL,
        },
        softwareVersion: "1.0.0",
        description:
          "Interactive astrophysics & orbital scale explorer. High-precision calculations, real-time planetary positions, human-scale benchmarks, and true gravitational pull.",
      },
    ],
  };
}

/**
 * Generate BreadcrumbList Schema
 */
export function getBreadcrumbSchema(breadcrumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${BASE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

/**
 * Generate FAQ Schema (for /learn page)
 */
export function getLearnFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why is Solar System scale so difficult to picture accurately?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Solar System is overwhelmingly empty space. If Earth were scaled down to a 10 cm ball (approx. the size of a human fist), the Moon would be a 2.7 cm ball 3 metres away, the Sun would be an 11-metre sphere over 1.17 kilometres away, and Neptune would be over 35 kilometres distant. Traditional illustrations compress distances by factors of thousands so bodies fit on screen.",
        },
      },
      {
        "@type": "Question",
        name: "What is the inverse-square law of gravity?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Newton's law of universal gravitation dictates that gravitational acceleration decreases with the square of distance (a = G * M / r²). Doubling the distance to a celestial body reduces its gravitational pull on you to one quarter (1/4). Because planetary distances range from tens of millions to billions of kilometres, distance dominates over planetary mass.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between gravitational acceleration and force?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Gravitational acceleration (m/s²) describes what a celestial body's gravitational field does at a specific point in space, identical for all objects regardless of mass. Force (Newtons) is that acceleration multiplied by the observer's mass (F = m * a). Doubling your mass doubles the force acting on you, but does not alter the planetary acceleration field.",
        },
      },
      {
        "@type": "Question",
        name: "Do planets exert measurable gravitational forces on human beings?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, every planet exerts a calculable gravitational pull governed by Newton's law. However, due to enormous astronomical distances, the acceleration produced by even massive planets like Jupiter on a human body on Earth is less than a hundred-millionth of Earth's surface gravity—smaller than the gravitational pull of a person standing one metre away from you.",
        },
      },
      {
        "@type": "Question",
        name: "What does physics say about astrology and planetary alignment?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "While celestial bodies do exert real gravitational attraction, extensive controlled scientific investigations have found no empirical evidence connecting planetary positions to human personality, destiny, fortune, or relationships. Furthermore, there is no known physical mechanism by which tiny planetary gravitational or tidal variations could produce such effects.",
        },
      },
    ],
  };
}

/**
 * Generate dynamic XML sitemap string
 */
export function generateSitemapXml(): string {
  const currentDate = new Date().toISOString().split("T")[0];

  const urlEntries = Object.values(ROUTE_SEO).map((route) => {
    const loc = `${BASE_URL}${route.path === "/" ? "" : route.path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
    <image:image>
      <image:loc>${DEFAULT_OG_IMAGE}</image:loc>
      <image:title>${escapeXml(route.title)}</image:title>
      <image:caption>${escapeXml(route.description)}</image:caption>
    </image:image>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join("\n")}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
