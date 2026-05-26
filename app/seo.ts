import type { MetaDescriptor } from "react-router";

/**
 * Single source of truth for site-wide SEO constants and metadata helpers.
 * Consumed by `root.tsx` (rel=me links, Person JSON-LD) and by every route's
 * `meta` export (via `pageMeta`) so titles, descriptions, Open Graph, and
 * Twitter Card tags stay consistent without per-route boilerplate.
 */

export const SITE = {
  name: "The CodeDrift",
  url: "https://www.codedrift.com",
  author: "Jakob Heuser",
  /** Absolute URL of the default Open Graph / Twitter share image. */
  defaultImage: "https://www.codedrift.com/og-default.png",
  /** Stable @id for the site's Person entity, referenced by article author. */
  personId: "https://www.codedrift.com/#person",
} as const;

/**
 * Canonical list of social / identity profile URLs. Rendered both as
 * `<link rel="me">` tags in `root.tsx` and as the `sameAs` array of the
 * Person JSON-LD, so the two never drift apart.
 */
export const SOCIAL_PROFILES = [
  "https://hachyderm.io/@jakobo",
  "https://twitter.com/jakobo",
  "https://linkedin.com/in/jakobheuser",
  "https://github.com/jakobo",
  "https://twitch.tv/jakobox",
  "https://www.instagram.com/codedrift.social/",
  "https://www.reddit.com/user/Jakobox",
  "https://www.threads.net/@codedrift.social",
  "https://bsky.app/profile/codedrift.social",
] as const;

/** Build an absolute canonical URL for a path (leading slash expected). */
export function absoluteUrl(path: string): string {
  return `${SITE.url}${path}`;
}

/** The site-wide Person entity emitted on every page. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": SITE.personId,
    name: SITE.author,
    alternateName: "CodeDrift",
    url: SITE.url,
    sameAs: [...SOCIAL_PROFILES],
  };
}

interface PageMetaInput {
  /** Full <title> text, used verbatim. */
  title: string;
  description: string;
  /** Path of the current page (leading slash), used for og:url. */
  path: string;
  /** Absolute image URL; falls back to the site default share image. */
  image?: string;
  /** Open Graph type; defaults to "website". */
  type?: "website" | "article";
}

/**
 * Returns the React Router meta descriptors for a page: title, description,
 * Open Graph, and Twitter Card tags. Each route's `meta` export spreads this
 * and may append additional descriptors (e.g. `script:ld+json`).
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  type = "website",
}: PageMetaInput): MetaDescriptor[] {
  const img = image ?? SITE.defaultImage;
  const url = absoluteUrl(path);
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE.name },
    { property: "og:image", content: img },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
  ];
}
