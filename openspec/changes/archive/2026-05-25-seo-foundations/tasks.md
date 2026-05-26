## 1. Shared SEO foundation

- [x] 1.1 Create `app/seo.ts` exporting `SITE` (name, base URL `https://www.codedrift.com`, author name, default share image path) and `SOCIAL_PROFILES` (canonical list of identity URLs currently hard-coded in `root.tsx`)
- [x] 1.2 Add a `pageMeta({ title, description, image?, url, type? })` helper in `app/seo.ts` that returns a React Router meta descriptor array including `<title>`, description, `og:*`, and `twitter:*` tags with sensible defaults
- [x] 1.3 Add a `personJsonLd()` helper in `app/seo.ts` that builds the `Person`/`Organization` JSON-LD object (stable `@id`, name, url, `sameAs` from `SOCIAL_PROFILES`)
- [x] 1.4 Add `public/apple-touch-icon.png` and a default Open Graph share image to `public/` (placeholder acceptable until final art lands)

## 2. Root document head & identity

- [x] 2.1 Update the viewport in `app/root.tsx` to `width=device-width, initial-scale=1`
- [x] 2.2 Render `<link rel="me">` tags in `root.tsx` from `SOCIAL_PROFILES` instead of the hard-coded list
- [x] 2.3 Add `<link rel="apple-touch-icon">` in `root.tsx`
- [x] 2.4 Emit the sitewide `Person` JSON-LD as a static `<script type="application/ld+json">` in the `Document` head (RR v7 overrides parent `meta`, so a static head script is more robust than a root `meta` descriptor)

## 3. Static route metadata & content fixes

- [x] 3.1 Homepage (`routes/home.tsx`): add description + OG/Twitter via `pageMeta`
- [x] 3.2 `routes/help.tsx`: fix the H1 (currently "Elsewhere on the Web") to describe the help page, and add a meta description
- [x] 3.3 `routes/talks.tsx`: change the second `<h1>` ("Microphone Optional") to `<h2>` and add a meta description
- [x] 3.4 `routes/social.tsx`: add a meta description
- [x] 3.5 `routes/about.tsx`: rewrite into a real author bio + credentials (consolidating credentials from `/help`), keep colophon as a secondary section, add a meta description
- [x] 3.6 Confirm each static route emits OG/Twitter tags via `pageMeta`

## 4. Blog & TIL metadata + reading-surface changes

- [x] 4.1 Extend `app/sanity/queries.ts` to project hero image `alt` and ensure `_updatedAt` is available where needed (hero `alt` field added to the post schema; the existing `heroImage` and `_updatedAt` projections already carry both)
- [x] 4.2 `routes/blog/post.tsx`: emit `og:type=article` + `og:image` from the hero, and `BlogPosting` JSON-LD (headline, datePublished, dateModified, author ref, image)
- [x] 4.3 `routes/blog/post.tsx`: display a visible "Updated" date when `_updatedAt` is materially later than `publishedAt`
- [x] 4.4 `routes/blog/post.tsx`: give the hero `<img>` descriptive alt (author alt, fallback to post title)
- [x] 4.5 `components/portable-text.tsx`: keep author alt for in-body images (already uses the author-supplied `alt`; only genuinely decorative images fall back to empty)
- [x] 4.6 `routes/blog/tag.tsx`: emit `BreadcrumbList` JSON-LD for Blog → Tag and add OG/Twitter via `pageMeta`
- [x] 4.7 `routes/til/entry.tsx`: add a meta description derived from the entry, plus OG/Twitter via `pageMeta`
- [x] 4.8 `routes/blog/index.tsx` and `routes/til/index.tsx`: route OG/Twitter through `pageMeta`

## 5. Sitemap

- [x] 5.1 Add a sitemap query to `app/sanity/queries.ts` returning post/til slugs + `_updatedAt` and tag slugs
- [x] 5.2 Create resource route (`app/routes/sitemap.ts`, mapped to `sitemap.xml` in `routes.ts`) with a loader that serializes a `<urlset>` (posts, TILs, tags, static routes) with `<loc>` and `<lastmod>`
- [x] 5.3 Set `Content-Type: application/xml` and a `Cache-Control: public, max-age=3600` header on the response
- [x] 5.4 Register the route in `app/routes.ts` (resolves at `/sitemap.xml`, verified during build in group 7)
- [x] 5.5 Verify Studio (`/_/studio/*`), action routes, and unpublished content are excluded (query filters on `defined(publishedAt)`; sitemap enumerates a fixed allowlist only)

## 6. Author-opt-in HowTo / FAQ structured data

- [x] 6.1 Add optional structured fields to the `til` Sanity schema (`howToSteps`, `faq`) and project them in `TIL_BY_SLUG_QUERY`
- [x] 6.2 Emit `HowTo` JSON-LD on `/til/<slug>` only when how-to steps are present, rendering a matching numbered step list on the page
- [x] 6.3 Emit `FAQPage` JSON-LD only when Q&A pairs are present, rendering a matching Q&A list on the page

## 7. Verification

- [x] 7.1 Run `pnpm typecheck` and `pnpm lint` clean
- [x] 7.2 Build and serve locally; inspect rendered `<head>` for homepage, a post, a tag page, and a TIL (title, description, canonical, OG/Twitter, JSON-LD all present) — verified on localhost:5173
- [x] 7.3 Validate JSON-LD parses and matches visible content — all blocks parse locally (Person/BlogPosting/BreadcrumbList; HowTo/FAQ only when authored). NOTE: run Google Rich Results Test on live URLs after deploy
- [x] 7.4 Fetch `/sitemap.xml` and confirm posts, TILs, tags, and static pages appear with `lastmod` — 115 URLs, correct content-type + cache-control
- [ ] 7.5 Check a post and tag share preview in a social card debugger (post-deploy — requires public URL)

## 8. Owner decisions (out of band — not code)

- [ ] 8.1 Add a `Sitemap: https://www.codedrift.com/sitemap.xml` directive in the Cloudflare-managed `robots.txt` (dashboard)
- [ ] 8.2 Decide whether to keep or relax the AI-crawler blocks / `ai-train=no` content signal for GEO visibility (dashboard)
- [ ] 8.3 Commission/approve the final default Open Graph share image artwork
