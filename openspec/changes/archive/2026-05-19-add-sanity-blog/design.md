## Context

Codedrift is a single-author React Router 7 app on Cloudflare Workers (`nodejs_compat` enabled, port 8642 for dev). The current site is hand-authored TSX with no CMS, no draft workflow, and no native content surface — long-form writing lives on GitHub Discussions ("Thunked") and short notes on "TIL". The README explicitly captures the intent to bring blog content back into the site itself.

This change introduces several first-for-this-repo concerns:

- **A client-heavy SPA (Sanity Studio) embedded inside a worker.** Studio is several MB and has peer deps (`styled-components`) that interact with the Vite + Cloudflare build pipeline.
- **Two distinct content types in two distinct URL namespaces.** `post` lives at `/blog/*` and `til` at `/til/*`. They share schema fragments (tags, body) but are separately addressed and separately listed.
- **A tag taxonomy as Sanity references**, sized so that future filter pages (`/blog/tag/:slug`) are a schema-compatible add, not a migration.
- **No editorial pipeline.** Single author, no draft review, no preview mode — keep the runtime simple.

The repo is also a meaningful step ahead of where the taskless-marketing reference change started: routes config is already explicit (no `flatRoutes()` refactor needed), Tailwind v4 + `@tailwindcss/typography` is already wired (bespoke prose styling in `app/components/content.tsx` ready to be reused), and there is no existing content to migrate.

## Goals / Non-Goals

**Goals:**

- `/blog` and `/til` are working reading surfaces backed by Sanity, with new content publishable without a deploy.
- Sanity Studio runs at `/_/studio/*` on the same origin as the live site, code-split so it never lands in the marketing bundle.
- Two URL namespaces, each with its own index and detail route, sharing one rendering pipeline.
- Tag taxonomy is real `tag` documents from day one, so the future "all posts tagged X" page is a route addition and a query — not a content migration.
- Visual aesthetic (the "leather notebook" look from `codedrift-layout`) is preserved; blog pages nest under the existing layout.
- README captures the deferred work (RSS, sitemap, tag pages, comments) so it does not silently fall off.

**Non-Goals:**

- Migration of existing content from GH Discussions or `public/site-archive/`. Greenfield only.
- Preview / draft mode. v1 is `published`-only.
- Comments. The future plan is a social-layer comment system; out of scope here.
- Tag filter pages (route work for `/blog/tag/:slug`).
- RSS / Atom feeds, `sitemap.xml`. Captured in README; not built here.
- Layout fork or redesign. Reuse `codedrift-layout` as the chrome for both reader surfaces.
- Cross-type slug validator. Not needed — distinct URL namespaces, distinct slug spaces.
- Routes-config refactor. Already on explicit `routes()`; nothing to do.

## Decisions

### D1. Studio lives at `/_/studio/*` inside the worker (embedded), not Sanity-hosted

**Chosen:** Embed Studio at `/_/studio/*` as a code-split lazy route.

**Alternatives considered:**

- **Sanity-hosted Studio** at `<project>.sanity.studio`. Simpler (zero Studio code in our bundle, `sanity deploy` is one command).
- **Studio in a separate Cloudflare worker.** Isolation without embedding; strictly more infra.

**Rationale:** Same-origin embedding means one login (Cloudflare Access or none) instead of two contexts. Even with preview mode out of scope, the single-login ergonomics are worth the build-config cost. The Studio chunk lands behind a lazy import so the marketing bundle is unaffected.

**Trade-off accepted:** Studio's bundle is substantial and Vite config will likely need tuning (`ssr.noExternal`, `optimizeDeps`). Verified via `react-router build` output before merging.

### D2. Two URL namespaces (`/blog/*` and `/til/*`), not one dispatched by `_type`

**Chosen:** `post` documents resolve at `/blog/:slug`; `til` documents resolve at `/til/:slug`. Each has its own index route.

**Alternatives considered:**

- **Unified `/blog/:slug`** with a `_type`-based dispatcher (taskless's pattern for post/episode). Single feed, but conflates two intentionally-distinct content shapes and forces a cross-type slug validator.
- **`/blog/*` only, treat TILs as short posts.** Loses the distinct reading affordance the user wants.

**Rationale:** TIL is "a different content shape" (the user's words) — short, frequent, lighter chrome. Two namespaces lets each surface evolve independently (a future `/til` listing could be denser, infinite-scrolling, etc.) without negotiating with the other. Eliminates the cross-type slug validator because each namespace owns its slug space.

**Schema impact:** `post.slug` and `til.slug` each use Sanity's built-in within-type uniqueness. No custom validator.

### D3. Tags are a `tag` reference document, not a string array

**Chosen:** Define a `tag` document type (name, slug). Both `post.tags` and `til.tags` are arrays of references to `tag` documents.

**Alternatives considered:**

- **String array on each document.** ~10 lines less code today, but locks out filter pages without a future content migration (rewriting every doc's strings into references).
- **Two separate taxonomies** (post-tags and til-tags). Editor footgun — same conceptual tag would exist twice. Doesn't pay for itself.

**Rationale:** The user explicitly chose "do it right with tag documents." Future `/blog/tag/:slug` and `/til/tag/:slug` filter pages become a route + query addition with no content migration. Shared taxonomy across both content types means the editor sees one canonical "code" tag, not two.

**Trade-off accepted:** Editor must create a tag document before they can reference it. Sanity's reference field UI mitigates this with an inline-create affordance.

### D4. Schemas defined in-repo; no Sanity plugins for content types

**Chosen:** `post`, `til`, and `tag` schemas are defined directly under `app/sanity/schemas/`. No third-party schema plugins.

**Rationale:** The total surface is ~100 lines of schema. Owning it keeps us in control of editor UX and version compatibility. Mirrors the rationale taskless landed on after `sanity-plugin-podcast` proved Studio-v2-only — even when plugins exist, owning small schema sets is cheaper than inheriting upstream constraints.

### D5. Code highlighting via `prism-react-renderer`

**Chosen:** Render code blocks with `prism-react-renderer` on the client; author with `@sanity/code-input` in Studio.

**Alternatives considered:**

- **Shiki.** Better fidelity (uses real VS Code grammars), but pulls in significant payload via grammar files unless aggressively configured.
- **Server-side rehype-prism.** Adds a transform pipeline step; not justified at this scale.

**Rationale:** User chose "Prism. keep it simple." `prism-react-renderer` is small, has no build-time grammar registration, and is the lowest-friction choice for a personal tech blog.

### D6. Secrets via per-environment `wrangler secret put`, not Cloudflare Secrets Store

**Chosen:** `SANITY_API_READ_TOKEN` lives as a worker secret (`wrangler secret put`). Local dev reads from `.dev.vars`. `SANITY_PROJECT_ID` and `SANITY_DATASET` live as `vars` in `wrangler.jsonc` (not secret — they're public identifiers).

**Alternatives considered:**

- **Cloudflare Secrets Store** (taskless's choice). Worth it when multiple workers share the same secret. Codedrift has one worker.

**Rationale:** User confirmed "I don't have other workers." Worker secrets are the simplest mechanism that fits.

### D7. No preview / draft mode in v1

**Chosen:** Loaders read `perspective: 'published'`. No cookie flow, no `/api/preview-mode/*` endpoints, no `@sanity/preview-url-secret`.

**Rationale:** Single author, no editorial review pipeline, no Presentation-tool need. Taskless ultimately descoped preview mode post-hoc and shipped fine without it; codedrift can start from that endpoint. The `node:crypto`-in-client-bundle footgun Sanity warns about does not apply when there is no preview-secret module to leak.

**Re-opens cleanly later:** If preview is wanted, it lands as its own change — adds endpoints and parameterizes loaders.

**Note on the client `token` option:** `app/sanity/client.ts` passes `token: env.SANITY_API_READ_TOKEN` even though with `perspective: 'published'` the token does not unlock any reader-visible content (drafts are not returned regardless of token). The token is present as forward-prep for a future preview-mode change, and to support authenticated CDN reads if rate limits ever bite. It is harmless today — leave as-is so a future preview-mode change is a smaller diff.

### D8. No content migration

**Chosen:** v1 ships against an empty Sanity dataset. First posts are authored fresh in Studio.

**Rationale:** User confirmed "Discussions do not need to migrate, content does not need to migrate." Migration is real work (GH API → `@sanity/block-tools` portable text, label-to-tag mapping, code-block fidelity checks) and is not load-bearing on the infra landing. The Sanity surfaces are usable without it.

### D9. Soft launch — `/blog` and `/til` exist but are not linked from the header

**Chosen:** Routes are live, but `codedrift-layout`'s header nav is unchanged. The "writing" link still points to GH Discussions.

**Rationale:** User said "URLs won't even be in nav to start." Lets the user validate Studio + the rendering pipeline end-to-end before committing to the new surfaces publicly. The flip is a one-line edit when ready.

### D10. Single `blog` capability — no separate `sanity-cms` capability

**Chosen:** One OpenSpec capability covering both the reader surfaces and the authoring infrastructure.

**Alternatives considered:**

- **Two capabilities** (`blog` + `sanity-cms`), as taskless did. Useful when a second reader surface might consume the authoring layer independently.

**Rationale:** User confirmed "one capability." Codedrift has no plausible second reader surface (no docs site, no second consumer of the Sanity project), so the split would create indirection without payoff.

### D11. Reuse `codedrift-layout`; no layout fork

**Chosen:** Both reader surfaces nest under the existing `layout("routes/codedrift-layout.tsx", [...])` block in `routes.ts`. No new layout file.

**Rationale:** User confirmed "current layout gets us most of the way there." The aesthetic — single column, leather-notebook vibe, existing `prose` styling in `content.tsx` — already fits how blog content should read. Portable Text serializers will render into the existing `prose` container.

## Risks / Trade-offs

- **[Studio bundle inflates worker size]** → Lazy route import (`React.lazy` + `Suspense`); audit `react-router build` output before merging the Studio group. Tune `vite.config.ts` (`ssr.noExternal: [/^sanity/, /^@sanity\//, /^styled-components/]`, `optimizeDeps.include`) as needed.
- **[CORS misconfig in Sanity causes silent Studio failure]** → Operator-actions checklist: add `http://localhost:8642` (dev, codedrift port) and the production origin to Sanity's CORS allowlist with credentials enabled, before first Studio load.
- **[`SANITY_API_READ_TOKEN` leak]** → Token has Viewer permissions only (read drafts). Stored as worker secret, gitignored locally via `.dev.vars`. Rotation is a Sanity dashboard + `wrangler secret put` round-trip.
- **[Free plan quota binding]** → Personal blog volume is well inside the free plan (3 users, 2 datasets, 500k API CDN hits/month, 5 GB assets). Monitor Sanity dashboard post-launch.
- **[Layout edge cases under blog content]** → `codedrift-layout` was designed for hand-authored short pages. Long posts with images and code blocks may surface layout assumptions (max-width clamps, scroll behavior, theme contrast on code). Verify with at least one realistic test post before merging the rendering group.
- **[Tag inline-create UX]** → Editor must create a `tag` document before referencing it. Sanity's reference field has an inline-create affordance — verify it works for `tag` on the first Studio test.

## Migration Plan

Each task group below corresponds to a natural commit boundary. Each state is independently deployable.

1. **Sanity project + env wiring (no Studio yet).** Provision project, add deps, wire `SANITY_PROJECT_ID`/`SANITY_DATASET` as vars, add `SANITY_API_READ_TOKEN` as worker secret, regenerate `worker-configuration.d.ts`. No routes, no Studio. Deployable; no user-visible change.
2. **Sanity client + schemas + Studio mount.** Add `app/sanity/{client,queries,schemas}.ts`, `sanity.config.ts`, `app/routes/studio.tsx`, route entry for `/_/studio/*`. Studio renders, login works, schemas (`post`, `til`, `tag`) appear. Deployable; only `/_/studio/*` newly visible.
3. **`/blog` reader surface.** Add `app/routes/blog/{index,post}.tsx`, route entries, and the `app/components/portable-text.tsx` serializer set (Prism, image URL builder). First reader-facing URLs live. Deployable.
4. **`/til` reader surface.** Add `app/routes/til/{index,entry}.tsx` and route entries, reusing the Portable Text serializers from Group 3. Deployable.
5. **README "Planned" section + final verify.** Document deferred work; smoke-test all four reader URLs and `/_/studio` on a deployed preview.

**Rollback:** Each merged group reverts cleanly via `git revert`. Sanity project and its content survive code rollback independently.

## Open Questions

- **Studio bundle size after `ssr.noExternal` tuning.** Verify with `react-router build` output in Group 2. If the marketing bundle grows materially, revisit Vite config or consider Sanity-hosted Studio for v1.5.
- **`prose` styling on Sanity-authored content.** The existing classes in `content.tsx` were tuned for hand-written copy; verify they handle Portable Text output (especially nested lists, hr, blockquote, inline images) on the first realistic test post.
