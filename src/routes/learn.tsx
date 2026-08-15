import { createFileRoute } from "@tanstack/react-router";
import {
  ROUTE_SEO,
  BASE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  getBreadcrumbSchema,
  getLearnFaqSchema,
} from "@/lib/seo-config";

const { title, description, keywords, breadcrumbs } = ROUTE_SEO.learn;
const CANONICAL_URL = `${BASE_URL}/learn`;

const learnSchema = {
  "@context": "https://schema.org",
  "@graph": [
    getBreadcrumbSchema(breadcrumbs),
    getLearnFaqSchema(),
    {
      "@type": "Article",
      "@id": `${CANONICAL_URL}#article`,
      headline: title,
      description: description,
      url: CANONICAL_URL,
      inLanguage: "en-US",
      author: {
        "@type": "Person",
        name: "Devansh Sharma",
      },
      publisher: {
        "@type": "Organization",
        name: "RootDeveloperDS",
      },
      articleSection: "Astrophysics & Space Science Education",
      about: [
        {
          "@type": "Thing",
          name: "Inverse-Square Law of Gravitation",
        },
        {
          "@type": "Thing",
          name: "Gravitational Acceleration and Force",
        },
        {
          "@type": "Thing",
          name: "Astrophysics vs Astrological Claims",
        },
      ],
    },
  ],
};

export const Route = createFileRoute("/learn")({
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
        children: JSON.stringify(learnSchema),
      },
    ],
  }),
  component: LearnPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-panel space-y-2 p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Science & Learn</h1>
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted-foreground">
        Everything OrbitSpan shows comes from two well-tested ideas: bodies move on computable orbits,
        and mass attracts mass with a strength that falls off with the square of distance.
      </p>

      <div className="space-y-3">
        <Section title="Why scale is so hard to picture">
          <p>
            The Solar System is mostly empty. If Earth were a 10 cm ball, the Moon would be a 2.7 cm
            ball three metres away, the Sun an 11 m sphere over a kilometre off, and Neptune would be
            tens of kilometres distant. Almost every diagram you have seen compresses distance,
            enlarges planets, or both — which is exactly why OrbitSpan separates true scale from
            exploration layouts and says so on screen.
          </p>
        </Section>

        <Section title="The inverse-square law">
          <p>
            Gravitational acceleration is a = G·M / r². Because r is squared, distance dominates.
            Jupiter is about 318 times Earth's mass, but at roughly 4–6 astronomical units its pull on
            your body is around a hundred-millionth of a percent of Earth's surface gravity.
          </p>
          <p>
            Distances are not fixed either. Earth–Mars ranges from about 0.4 AU to 2.6 AU, so the
            acceleration Mars produces at your position varies by a factor of roughly forty over a
            synodic cycle. Any statement built on "the distance to Mars" without a date is incomplete.
          </p>
        </Section>

        <Section title="Acceleration versus force">
          <p>
            Acceleration (m/s²) describes what a gravitational field does at a point: it is the same
            for a feather and a person. Force (newtons) is that acceleration multiplied by your mass,
            F = m·a. Doubling your mass doubles the force but changes no acceleration. Confusing the
            two is the most common error in popular discussions of planetary "influence".
          </p>
        </Section>

        <Section title="How planets actually move">
          <p>
            Planetary positions follow from gravity plus initial conditions. Modern ephemerides — like
            the VSOP87-derived series used by Astronomy Engine — reproduce those orbits to arc-second
            accuracy over centuries, which is why OrbitSpan can compute a genuine position for any
            timestamp instead of animating a decorative circle.
          </p>
        </Section>

        <Section title="Tides: a real, measurable effect">
          <p>
            Gravity is not just an abstraction. The Moon and Sun raise Earth's ocean tides through the
            <em> difference</em> in their pull across Earth's diameter. That tidal effect drops with the
            cube of distance, so the planets' tidal contribution on Earth — and on a human body — is
            far too small to measure.
          </p>
        </Section>

        <Section title="Physics vs astrology — stated carefully">
          <p>
            Every planet does attract you. That part of astrology's imagery is physically real, and
            OrbitSpan shows the numbers rather than hiding them.
          </p>
          <p>
            The scientific problem is different: there is no established evidence for the claimed
            causal or predictive effects. Controlled studies of astrological prediction — including
            work where astrologers matched charts to personality profiles or life outcomes — have not
            found reliable effects beyond chance, and no proposed mechanism connects planetary
            positions to personality, luck, relationships, destiny or future events.
          </p>
          <p>
            Note also what a small pull does <em>not</em> prove. "Gravity is weak, therefore astrology
            is false" is not a valid argument: a hypothetical influence could in principle work through
            something other than gravity. The honest position is that the proposed effects have been
            looked for, no dependable signal has been found, and no tested mechanism exists — while
            the gravitational effects that <em>can</em> be measured are calculable and tiny.
          </p>
          <p>
            Astrology remains culturally and historically significant, and people find meaning in it.
            OrbitSpan is not here to mock that; it is here to make the measurable physics legible.
          </p>
        </Section>
      </div>
    </div>
  );
}
