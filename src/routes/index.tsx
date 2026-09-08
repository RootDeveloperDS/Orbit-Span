import { createFileRoute } from "@tanstack/react-router";

import { SceneHost } from "@/components/orbit/scene/SceneHost";
import { ExplorerHUD } from "@/components/orbit/hud/ExplorerHUD";
import {
  ROUTE_SEO,
  BASE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  getBreadcrumbSchema,
} from "@/lib/seo-config";

const { title, description, keywords, breadcrumbs } = ROUTE_SEO.explorer;
const CANONICAL_URL = `${BASE_URL}/`;

export const Route = createFileRoute("/")({
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
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      { name: "twitter:image:alt", content: DEFAULT_OG_IMAGE_ALT },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(getBreadcrumbSchema(breadcrumbs)),
      },
    ],
  }),
  component: ExplorerPage,
});

function ExplorerPage() {
  return (
    <div className="relative h-[calc(100dvh-3.5rem)] w-full overflow-hidden bg-space-deep select-none">
      {/* Edge-to-edge 3D Cosmos Scene */}
      <SceneHost />

      {/* Modern, Floating Glass HUD Layer */}
      <ExplorerHUD />
    </div>
  );
}
