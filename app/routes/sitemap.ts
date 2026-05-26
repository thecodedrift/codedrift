import type { Route } from "./+types/sitemap";
import { cloudflareEnvironmentContext } from "~/context";
import { getSanityClient } from "~/sanity/client";
import { SITEMAP_QUERY } from "~/sanity/queries";
import { absoluteUrl } from "~/seo";

interface ContentEntry {
  slug: string;
  publishedAt?: string;
  _updatedAt?: string;
}

interface SitemapData {
  posts: ContentEntry[];
  tils: ContentEntry[];
  tags: { slug: string; _updatedAt?: string }[];
}

const STATIC_PATHS = [
  "/",
  "/about",
  "/talks",
  "/social",
  "/help",
  "/blog",
  "/til",
];

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlEntry(path: string, lastmod?: string): string {
  const loc = `  <url>\n    <loc>${xmlEscape(absoluteUrl(path))}</loc>`;
  const lastmodTag = lastmod
    ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>`
    : "";
  return `${loc}${lastmodTag}\n  </url>`;
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvironmentContext);
  const client = getSanityClient({ env });
  const { posts, tils, tags } = await client.fetch<SitemapData>(SITEMAP_QUERY);

  const entries: string[] = [
    ...STATIC_PATHS.map((path) => urlEntry(path)),
    ...posts.map((p) =>
      urlEntry(`/blog/${p.slug}`, p._updatedAt ?? p.publishedAt),
    ),
    ...tags.map((t) => urlEntry(`/blog/tag/${t.slug}`, t._updatedAt)),
    ...tils.map((t) =>
      urlEntry(`/til/${t.slug}`, t._updatedAt ?? t.publishedAt),
    ),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
