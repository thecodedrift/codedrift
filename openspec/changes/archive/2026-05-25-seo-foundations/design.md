## Context

codedrift.com is a React Router 7 app rendered server-side on a Cloudflare Worker, with content in Sanity. Today, document `<head>` metadata is produced ad hoc: each route exports its own `meta` array, `root.tsx` hard-codes `<link rel="me">` and a canonical link, and there is no structured data, no Open Graph/Twitter markup, and no sitemap. The audit (see proposal) confirmed the content itself is strong; this change adds the machine-readable layer on top without touching URLs or the data model.

Key constraints:

- **React Router v7 `meta` semantics**: the deepest matched route's `meta` export is what renders; parent `meta` is not automatically merged in. Per-route arrays must therefore be self-complete, which invites drift if each route hand-rolls OG/JSON-LD.
- **Edge runtime**: any sitemap or metadata generation runs per-request on the Worker; Sanity is the only data source and network calls cost latency.
- **Google's structured-data policy**: `HowTo`/`FAQPage` markup must match content visible on the page, or it risks manual action — markup cannot be invented from heuristics.
- **`rel="me"` ↔ `sameAs` parity**: the social identity list already exists in `root.tsx`; duplicating it in JSON-LD invites the two lists drifting apart.

## Goals / Non-Goals

**Goals:**

- One shared, typed source of truth for SEO defaults (site name, base URL, social identity list, default share image) consumed by both `<head>` links and JSON-LD.
- A small composable helper so each route declares only what is page-specific (title, description, image, type) and gets correct OG/Twitter/canonical/JSON-LD for free.
- A fresh, always-correct `sitemap.xml` driven by Sanity.
- Structured data that is valid and matches visible content.
- Fix the two H1 content bugs and the metadata gaps as part of the same pass.

**Non-Goals:**

- Changing any URL, route, or Sanity document shape beyond optional additive fields.
- Adding runtime dependencies (no schema/sitemap libraries).
- Editing `robots.txt` (Cloudflare-managed) or changing the AI-crawler / `ai-train=no` policy — surfaced as a decision for the owner, not implemented here.
- Auto-detecting which TILs are "how-tos" — markup is author-driven.

## Decisions

### 1. Centralize SEO constants and a `pageMeta()` helper in `app/seo.ts`

A new module exports `SITE` (name, base URL `https://www.codedrift.com`, default OG image, author name) and `SOCIAL_PROFILES` (the canonical list of identity URLs). `root.tsx` renders both its `<link rel="me">` tags and the `Person.sameAs` array from `SOCIAL_PROFILES`, eliminating drift. A `pageMeta({ title, description, image?, url, type? })` helper returns the full React Router meta descriptor array — title, description, `og:*`, `twitter:*`, and (where relevant) a `script:ld+json` descriptor — so each route's `meta` export stays a one-liner.

- _Why over per-route hand-rolling_: RR v7 doesn't merge parent meta, so without a helper every route must repeat OG/Twitter boilerplate. A helper keeps routes declarative and guarantees consistency.

### 2. Emit JSON-LD via React Router `script:ld+json` meta descriptors

React Router supports `{ "script:ld+json": {...} }` in `meta`, so structured data rides the same mechanism as the rest of the head — no extra `<script>` wiring, no hydration mismatch. The sitewide `Person`/`Organization` is emitted from `root.tsx`'s `meta`; `BlogPosting`, `BreadcrumbList`, and `HowTo`/`FAQPage` are emitted from their respective leaf routes and reference the `Person` by `@id`.

- _Alternative considered_: rendering raw `<script>` tags in components — rejected because it bypasses RR's head management and risks duplication on client navigation.

### 3. Sitemap as an SSR resource route at `routes/sitemap[.xml].ts`

A loader-only route returns an XML `Response` with `Content-Type: application/xml`. It fetches all `post` and `til` slugs + `_updatedAt`, all `tag` slugs, and a static list of marketing routes, then serializes `<urlset>` with `<loc>` and `<lastmod>`. A `Cache-Control: public, max-age=3600` header lets Cloudflare cache it so Sanity isn't hit on every crawl.

- _Why over build-time prerender_: the site is SSR with frequently-changing content; a live route is always current and avoids a build step. The bracket filename `sitemap[.xml].ts` produces the literal `/sitemap.xml` path.

### 4. HowTo / FAQ markup is author-opt-in via optional Sanity fields

Rather than guessing from titles, add optional fields to the `til` (and where useful `post`) schema — e.g. a `howToSteps` array and/or `faq` array. When present, the route emits matching `HowTo`/`FAQPage` JSON-LD; when absent, nothing is emitted. This guarantees markup-to-content parity (Google's requirement).

- _Alternative considered_: heuristic detection from headings — rejected as brittle and policy-risky.

### 5. Updated date driven by an explicit author field

The visible "Updated <date>" on posts is driven by an explicit author-set `updatedAt` field, not Sanity's system `_updatedAt`. Implementation revealed that the content migration set `_updatedAt` on every document, so any threshold against `_updatedAt` would falsely mark every post as recently updated. `BlogPosting.dateModified` prefers the explicit `updatedAt` and falls back to `_updatedAt`. This keeps the visible signal honest while still emitting a `dateModified` for structured data.

### 6. Image alt text: prefer real text, fall back deliberately

Hero images use a Sanity hero `alt` field when set, falling back to the post title (descriptive, not empty). In-body Portable Text images already read `value.alt`; keep that, but treat a missing alt as an authoring gap (surface in Studio rather than silently emitting `alt=""`). Genuinely decorative images may still opt into empty alt explicitly.

### 7. OG images: default asset + per-post hero

A static default share image lives in `public/` for routes without their own imagery. Posts with a `heroImage` generate a 1200×630 OG image via the existing Sanity image URL builder.

## Risks / Trade-offs

- **RR meta merge semantics surprise** → Mitigate by routing all head output through `pageMeta()` and verifying the rendered `<head>` of each route type after implementation.
- **Sitemap adds a Sanity fetch to a crawler-hit endpoint** → Mitigate with `Cache-Control` + Cloudflare edge caching; the query is slug/timestamp-only (cheap).
- **Structured-data manual action if markup ≠ visible content** → Mitigate via author-opt-in fields (Decision 4) and post-deploy validation with Google's Rich Results Test.
- **`rel=me` / `sameAs` drift** → Mitigate with the single `SOCIAL_PROFILES` constant (Decision 1).
- **Moving credentials from `/help` to `/about`** → Trade-off: `/help` becomes offer-focused, `/about` becomes the identity/bio surface; ensure no credential content is lost in the move.

## Migration Plan

All changes are additive (new route, new metadata, optional Sanity fields, content edits) with no URL or breaking data changes. Deploy normally via the existing Cloudflare pipeline. Post-deploy validation:

1. Fetch `/sitemap.xml` and confirm it lists posts, TILs, tags, and static pages with `lastmod`.
2. Run representative URLs through Google Rich Results Test and a social card debugger.
3. Spot-check rendered `<head>` for homepage, a post, a tag page, and a TIL.
4. **Owner decision (out of band)**: add a `Sitemap:` line and revisit the AI-crawler policy in the Cloudflare dashboard.

Rollback is a straight revert; no data migration is required.

## Open Questions

- Does the owner want to **reverse the `ai-train=no` / AI-crawler blocks** to enable GEO visibility, or keep the current stance? (Dashboard decision; affects whether structured data is even reachable by AI engines.)
- Should HowTo/FAQ Sanity fields ship in this change or in a follow-up once a few entries are ready to use them?
- Final default OG share image artwork — needs a design asset before launch.
