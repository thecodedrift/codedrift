## Why

Codedrift has no native blog surface. Long-form writing lives on GitHub Discussions (the "Thunked" category) and short notes live in the "TIL" category — surfaces the user has explicitly flagged in the README as wanting to bring back into the site itself ("Eventually, I'd like to return to hosting the blog content as dynamic pages."). Sanity.io's free plan gives a hosted content lake with structured schemas and a free editor (Studio), and integrates cleanly with React Router 7 on Cloudflare via a published client. This change wires Sanity into the worker, mounts Studio at an internal URL, and ships two reader surfaces — `/blog` for long-form posts and `/til` for short notes — without yet linking either from the public navigation (soft launch).

## What Changes

- **New `/blog` index + `/blog/:slug`** reading from Sanity, rendering Portable Text for the body.
- **New `/til` index + `/til/:slug`** as a separate URL namespace, using the same rendering pipeline but a distinct schema and feed.
- **New `/_/studio/*`** route embedding Sanity Studio same-origin, lazy-loaded so marketing visitors do not download the Studio bundle.
- **Three Sanity schemas defined in-repo**: `post` (title, slug, publishedAt, excerpt, heroImage, body, tags), `til` (title, slug, publishedAt, body, tags), and `tag` (name, slug) as a reference type so future filter pages (`/blog/tag/:slug`) are a schema-compatible follow-up.
- **Portable Text rendering** via `@portabletext/react`, with `prism-react-renderer` for syntax-highlighted code blocks.
- **Image pipeline** via `@sanity/image-url` for hero images, inline images, and OG image generation.
- **Existing layout reused**: `/blog` and `/til` nest under `codedrift-layout`, inheriting the existing header, footer, and theme system. No layout fork.
- **Environment wiring**: `SANITY_PROJECT_ID` and `SANITY_DATASET` as `vars` in `wrangler.jsonc`; `SANITY_API_READ_TOKEN` as a per-environment worker secret via `wrangler secret put`; local dev reads from `.dev.vars`.
- **README "Planned" section** added listing follow-on work (RSS/Atom feed, `sitemap.xml`, tag filter pages, optional social-layer comments) so they don't fall off.
- **Nav unchanged at launch.** The header's "writing" link continues to point at GH Discussions until the user manually flips it. `/blog` and `/til` exist but are unlinked — soft launch.

### Explicitly out of scope

- Migration of existing content from GitHub Discussions or from the legacy Ghost archive at `public/site-archive/`. v1 ships against an empty content lake; first posts will be authored fresh in Studio.
- Preview / draft mode. v1 reads `perspective: 'published'` only. No cookie flow, no `/api/preview-mode/*` endpoints.
- Comments. GH Discussions stays as the existing community surface; an in-site social comment layer is a future change.
- Tag filter pages (`/blog/tag/:slug`, `/til/tag/:slug`). Schema supports them; routes come later.
- RSS / Atom feed, `sitemap.xml`. Captured as planned items in the README.
- Cross-type slug validator. The two reader surfaces live in separate URL namespaces (`/blog/*` vs. `/til/*`), so within-type uniqueness (Sanity's built-in slug-field default) is sufficient.
- Routes-config refactor. Codedrift is already on explicit `routes()`; nothing to migrate.

## Capabilities

### New Capabilities

- `blog`: the public reading surfaces (`/blog`, `/blog/:slug`, `/til`, `/til/:slug`) and the authoring infrastructure (Sanity client, schema set for `post`/`til`/`tag`, embedded Studio at `/_/studio/*`, Portable Text rendering, image URL builder). Single capability per the design decision below — no separate `sanity-cms` capability because codedrift has no second reader surface that would consume the authoring layer independently.

### Modified Capabilities

None. Existing specs (`component-migration`, `framework`, `infrastructure`, `tooling`) describe build/runtime concerns; none specify user-facing content-surface behavior, so no requirements change.

## Impact

**Affected code**

- `app/routes.ts` — new entries for `/blog`, `/blog/:slug`, `/til`, `/til/:slug`, `/_/studio/*`.
- `app/routes/blog/` (new) — `index.tsx`, `post.tsx`.
- `app/routes/til/` (new) — `index.tsx`, `entry.tsx`.
- `app/routes/studio.tsx` (new) — lazy-loaded Studio embed.
- `app/sanity/` (new) — `client.ts`, `queries.ts`, `schemas/{post,til,tag,index}.ts`.
- `app/components/portable-text.tsx` (new) — shared Portable Text serializers (incl. Prism-highlighted code blocks).
- `app/components/blog/` (new) — small UI helpers (date, tag pill, share button if added).
- `sanity.config.ts` (new, repo root) — Studio configuration and schema registration.
- `vite.config.ts` — likely tuning for Sanity's deps (`ssr.noExternal`, `optimizeDeps`) and Studio code-splitting.
- `wrangler.jsonc` — new `vars` block for `SANITY_PROJECT_ID`, `SANITY_DATASET`.
- `worker-configuration.d.ts` — regenerated to include the new env shape.
- `package.json` — new dependencies (see below).
- `README.md` — new "Planned" section.
- `.dev.vars` (new, gitignored) — local `SANITY_API_READ_TOKEN`.
- `.gitignore` — ensure `.dev.vars` is ignored if not already.

**New dependencies**

- `sanity` (Studio runtime)
- `@sanity/client`
- `@sanity/image-url`
- `@sanity/code-input` (Studio input widget for code blocks)
- `@sanity/vision` (Studio query tool — optional but standard)
- `@portabletext/react`
- `prism-react-renderer`
- `styled-components` (Studio peer dep)

**External systems**

- Sanity project must be provisioned on the free plan; dataset name `production`.
- Sanity API CORS allowlist must include `http://localhost:8642` (dev — note codedrift uses port 8642, not Vite's default 5173) and the production origin, with credentials enabled.
- A Sanity API read token must be generated and stored as a Cloudflare worker secret (`wrangler secret put SANITY_API_READ_TOKEN`).

**Runtime considerations**

- Cloudflare Workers with `nodejs_compat` already enabled. Sanity's React Router 7 guidance warns against importing `node:crypto` into client-bundled files; with preview mode out of scope this footgun does not apply, but keep an eye on any server-only utilities added later.
- Studio is a substantial SPA (several MB). Must be lazy-imported via a code-split route so the main bundle is unaffected. Verify with the `react-router build` output before merging.
