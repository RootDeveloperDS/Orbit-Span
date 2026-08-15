import { createFileRoute } from "@tanstack/react-router";

import { BodySelector } from "@/components/orbit/BodySelector";
import { HumanScalePanel } from "@/components/orbit/HumanScalePanel";
import { TimeControls } from "@/components/orbit/TimeControls";
import { useSolarSystemState } from "@/hooks/useSolarSystemState";
import {
  ROUTE_SEO,
  BASE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  getBreadcrumbSchema,
} from "@/lib/seo-config";

const { title, description, keywords, breadcrumbs } = ROUTE_SEO.humanScale;
const CANONICAL_URL = `${BASE_URL}/human-scale`;

const humanScaleSchema = {
  "@context": "https://schema.org",
  "@graph": [
    getBreadcrumbSchema(breadcrumbs),
    {
      "@type": "LearningResource",
      "@id": `${CANONICAL_URL}#resource`,
      name: title,
      description: description,
      url: CANONICAL_URL,
      educationalLevel: "All Ages / Secondary / Higher Education",
      learningResourceType: "Interactive Simulation & Scale Model",
      inLanguage: "en-US",
      author: {
        "@type": "Person",
        name: "Devansh Sharma",
      },
      publisher: {
        "@type": "Organization",
        name: "RootDeveloperDS",
      },
      about: [
        {
          "@type": "Thing",
          name: "Solar System Scale Model",
        },
        {
          "@type": "Thing",
          name: "Planetary Diameters and Orbital Distances",
        },
      ],
    },
  ],
};

export const Route = createFileRoute("/human-scale")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: keywords.join(", ") },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:image:alt", content: DEFAULT_OG_IMAGE_ALT },
      { property: "og:type", content: "article" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      { name: "twitter:image:alt", content: DEFAULT_OG_IMAGE_ALT },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(humanScaleSchema),
      },
    ],
  }),
  component: HumanScalePage,
});

function HumanScalePage() {
  const state = useSolarSystemState();

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      <header className="mb-5 max-w-2xl">
        <h1 className="text-2xl font-semibold">Human Scale</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Pick a size for Earth. Every diameter and distance below is the real value multiplied by the
          same ratio (your Earth ÷ 12,742 km), recomputed from the current planetary positions — so
          the numbers shift as the planets move.
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-3">
          <TimeControls />
          <BodySelector />
        </div>
        <HumanScalePanel state={state} />
      </div>
    </div>
  );
}
