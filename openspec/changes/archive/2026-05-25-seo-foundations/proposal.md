## Why

The first-ever SEO/GEO/AEO audit of codedrift.com (2026-05-25) found a strong content base undermined by missing discoverability plumbing: `sitemap.xml` 404s, there is no structured data or social-card markup anywhere, several routes lack meta descriptions, and two pages ship visible heading bugs. These are low-effort, high-return gaps that currently cap how well search engines, AI answer engines, and social platforms can understand and surface the site.

## What Changes

- **Add a generated `sitemap.xml` route** enumerating posts, TILs, tags, and static pages, with `lastmod` derived from Sanity timestamps.
- **Add Open Graph + Twitter Card metadata** sitewide (sensible defaults in `root.tsx`) with per-route overrides for title, description, and `og:image`.
- **Add JSON-LD structured data**: a `Person`/`Organization` entity sitewide (with `sameAs` mirroring the existing `rel="me"` links), `BlogPosting` on posts (with `datePublished`/`dateModified`), `BreadcrumbList` on tag pages, and `HowTo`/`FAQPage` on eligible TIL entries.
- **Fill metadata gaps**: add meta descriptions to the homepage, `/about`, `/talks`, `/social`, `/help`, and every `/til/<slug>` entry; add `initial-scale=1` to the viewport; add an `apple-touch-icon`.
- **Fix on-page content bugs**: `/help` renders the H1 "Elsewhere on the Web" (copied from `/social`); `/talks` ships a second `<h1>`. Each page SHALL have exactly one accurate H1.
- **Turn `/about` into a real author bio** that establishes Jakob's identity and credentials (the human-readable counterpart to the `Person` entity), consolidating credentials currently buried on `/help`.
- **Surface a visible "Updated" date** on posts when content has been revised, and give hero/in-body images descriptive `alt` text instead of empty strings.
- **Out of scope (documented, not implemented)**: `robots.txt` is Cloudflare-managed — adding a `Sitemap:` pointer and revisiting the AI-crawler/`ai-train=no` policy are Cloudflare dashboard decisions, not code. Flagged for a conscious call.

## Capabilities

### New Capabilities

- `seo-metadata`: Per-route document head metadata and on-page integrity — unique titles, meta descriptions, viewport, canonical, Open Graph + Twitter Card tags, favicons/apple-touch-icon, and a single accurate H1 per page (including the author-bio `/about` surface).
- `structured-data`: Site-wide JSON-LD — `Person`/`Organization` with `sameAs`, `BlogPosting` on posts, `BreadcrumbList` on tag pages, and `HowTo`/`FAQPage` on eligible TIL content.
- `sitemap`: A dynamically generated `sitemap.xml` enumerating all indexable URLs with `lastmod` values.

### Modified Capabilities

- `blog`: The reading surfaces additionally emit descriptive image `alt` text and surface a visible "Updated" date on posts when the content has been revised after publication.

## Impact

- **Affected code**: `app/root.tsx` (default meta, viewport, OG/Twitter defaults, sitewide Person JSON-LD), all route modules under `app/routes/` (per-route meta + descriptions + H1 fixes), new `app/routes/sitemap[.xml].ts` route + `app/routes.ts` registration, `app/sanity/queries.ts` (slugs + `_updatedAt`/`lastmod` projections, sitemap query), `app/routes/blog/post.tsx`, `app/routes/til/entry.tsx`, and `app/components/portable-text.tsx` (alt text, structured data, updated date).
- **Assets**: new `public/apple-touch-icon.png` and a default Open Graph share image in `public/`.
- **Dependencies**: none required (JSON-LD and sitemap XML are emitted directly; no new packages).
- **External / out of scope**: Cloudflare-managed `robots.txt` (`Sitemap:` directive + AI-crawler policy) — dashboard change tracked separately.
- **No breaking changes**: all changes are additive metadata or content corrections; no URL or data-model changes.
