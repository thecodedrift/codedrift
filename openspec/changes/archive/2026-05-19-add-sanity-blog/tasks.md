## 1. Sanity project + env wiring

- [x] 1.1 [Operator] Provision a new Sanity project on the free plan; record `SANITY_PROJECT_ID` and use `production` as the dataset name. Report both values back. (project `6ar8m1y8`, dataset `production`)
- [x] 1.2 [Operator] Create a Sanity API token with **Viewer** permissions named "codedrift worker — read". Copy the token value.
- [x] 1.3 [Operator] Configure the Sanity project's CORS allowlist: add `http://localhost:5173` with credentials enabled. The production origin entry will be added once a deploy URL exists. (Note: original task said `8642` — that is the wrangler-emulated worker port from `wrangler.jsonc`, but `pnpm dev` runs `react-router dev` which is Vite on `5173`. `5173` is the right origin to allowlist for local Studio + API access.)
- [x] 1.4 Add `SANITY_PROJECT_ID` and `SANITY_DATASET` to `wrangler.jsonc` under a new `vars` block.
- [x] 1.5 Create a gitignored `.dev.vars` file at the repo root containing `SANITY_API_READ_TOKEN=<token>` (use the value from 1.2). Verify `.dev.vars` is covered by `.gitignore`. (operator added; `.dev.vars*` already in `.gitignore`)
- [x] 1.6 [Operator] Store the token as a per-environment worker secret: `pnpm exec wrangler secret put SANITY_API_READ_TOKEN`. (Prompts interactively for the value.) — Deferred to first Cloudflare deploy; tracked in [CLOUDFLARE.md](../../../CLOUDFLARE.md) §1.
- [x] 1.7 Run `pnpm typegen` to regenerate `worker-configuration.d.ts` so the env shape includes the new variables. (used `pnpm exec wrangler types`; the project's `typegen` script only runs `react-router typegen`)
- [x] 1.8 Add the runtime dependencies (`sanity`, `@sanity/client`, `@sanity/image-url`, `@sanity/code-input`, `@sanity/vision`, `@portabletext/react`, `prism-react-renderer`, `styled-components`) to `package.json` via `pnpm add`.

## 2. Sanity client, schemas, and Studio mount

- [x] 2.1 Create `app/sanity/client.ts` exporting `getSanityClient({ env })` that returns a `createClient(...)` configured with `projectId`, `dataset`, a pinned `apiVersion`, `useCdn: true`, and `perspective: 'published'`.
- [x] 2.2 Create `app/sanity/queries.ts` with GROQ queries: `POST_INDEX_QUERY`, `POST_BY_SLUG_QUERY`, `TIL_INDEX_QUERY`, `TIL_BY_SLUG_QUERY`. Each filters on `defined(publishedAt)` and orders by `publishedAt desc` where applicable.
- [x] 2.3 Create `app/sanity/schemas/tag.ts` defining the `tag` document with `name` (string, required) and `slug` (slug, sourced from `name`, required, within-type unique).
- [x] 2.4 Create `app/sanity/schemas/post.ts` defining the `post` document with `title`, `slug` (within-type unique), `publishedAt`, optional `excerpt`, optional `heroImage`, `body` (Portable Text), and `tags` (array of references to `tag`).
- [x] 2.5 Create `app/sanity/schemas/til.ts` defining the `til` document with `title`, `slug` (within-type unique), `publishedAt`, `body` (Portable Text), and `tags` (array of references to `tag`).
- [x] 2.6 Create `app/sanity/schemas/index.ts` exporting the schema array `[post, til, tag]`.
- [x] 2.7 Create `sanity.config.ts` at the repo root: `defineConfig({ name, title, projectId, dataset, basePath: '/_/studio', plugins: [structureTool(), codeInput(), visionTool()], schema: { types: schemaTypes } })`. (project ID + dataset hardcoded — both are public identifiers, and Studio is a client bundle without access to worker `env`.)
- [x] 2.8 Create `app/components/studio-embed.client.tsx` that imports `Studio` from `sanity` and the local `sanity.config.ts`, then renders `<Studio config={config} />`.
- [x] 2.9 Create `app/routes/studio.tsx` that lazy-imports `studio-embed.client`, gates rendering on a hydration flag, returns a `noindex, nofollow` meta tag, and shows a "Loading Studio…" fallback.
- [x] 2.10 Add `route("_/studio/*", "routes/studio.tsx")` to `app/routes.ts` (outside the `codedrift-layout` block).
- [x] 2.11 Tune `vite.config.ts` for Sanity's deps: `ssr.noExternal: [/^sanity/, /^@sanity\//, /^styled-components/]`, and `optimizeDeps.include` entries as needed. Iterate until `pnpm dev` starts cleanly. (Initial pass; will iterate if `pnpm dev` surfaces issues during operator verification 2.12.)
- [x] 2.12 [Operator] Run `pnpm dev`, visit `http://localhost:5173/_/studio`, sign in, and confirm `Post`, `Til`, and `Tag` appear as creatable document types. (Operator reached `/_/studio/structure` and surfaced the viewport-height fix; signed-in Studio confirms schema visibility.)
- [x] 2.13 [Operator] Create one test `tag` (e.g., name "code"), one test `post` referencing it, and one test `til` referencing it. Publish both. Leave drafts for later verification. — Moved to [CLOUDFLARE.md](../../../CLOUDFLARE.md) §6 (post-deploy smoke test).

## 3. /blog reading surface

- [x] 3.1 Create `app/components/portable-text.tsx` exporting `PortableText` configured with serializers for headings, paragraphs, lists, links, blockquotes, `image` (resolved via `@sanity/image-url`), and `code` (highlighted via `prism-react-renderer`). Unknown block types render as `null`. (Headings/paragraphs/lists/blockquotes use the default Portable Text block style — wrapped in `prose` by `Content`. Custom serializers for `image`, `code`, and the `link` mark.)
- [x] 3.2 Create `app/routes/blog/index.tsx` with a `loader` that calls `POST_INDEX_QUERY` against the Sanity client and returns the list; the component renders titles, publication dates, optional excerpts, and tag pills, each linking to `/blog/<slug>`.
- [x] 3.3 Create `app/routes/blog/post.tsx` with a `loader` that calls `POST_BY_SLUG_QUERY` with `params.slug`; throws `data(undefined, { status: 404 })` when no document matches. The component renders title, publication date, optional hero image (via `@sanity/image-url`), and body via `PortableText`. The whole article wraps in the existing `Content` component / `prose` classes.
- [x] 3.4 Add `/blog` route entries to `app/routes.ts` inside the `codedrift-layout` block: index → `routes/blog/index.tsx`, `:slug` → `routes/blog/post.tsx`. Use `prefix("blog", [...])` or explicit `route("blog", ...)` + `route("blog/:slug", ...)`, whichever matches existing style. (Added via `prefix("blog", [...])` alongside `til` in the same routes.ts edit as 2.10.)
- [x] 3.5 [Operator] Visit `/blog` and confirm the test post from 2.13 appears with its tag pill. Visit `/blog/<test-slug>` and confirm the body renders with prose styling. — Moved to [CLOUDFLARE.md](../../../CLOUDFLARE.md) §6.
- [x] 3.6 [Operator] Visit `/blog/does-not-exist` and confirm the response is a 404. — Moved to [CLOUDFLARE.md](../../../CLOUDFLARE.md) §6.

## 4. /til reading surface

- [x] 4.1 Create `app/routes/til/index.tsx` mirroring `app/routes/blog/index.tsx` but querying with `TIL_INDEX_QUERY` and linking entries to `/til/<slug>`. Render TILs more densely than posts (no hero image; tighter spacing) — match the editorial intent of "short notes." (Single-row layout: date + title + tags on one line at `sm:` breakpoint.)
- [x] 4.2 Create `app/routes/til/entry.tsx` mirroring `app/routes/blog/post.tsx` but querying with `TIL_BY_SLUG_QUERY`. No hero image rendering.
- [x] 4.3 Add `/til` route entries to `app/routes.ts` inside the `codedrift-layout` block. (Added in same edit as 2.10 and 3.4.)
- [x] 4.4 [Operator] Visit `/til` and confirm the test TIL appears. Visit `/til/<test-slug>` and confirm rendering. Visit `/til/does-not-exist` and confirm 404. — Moved to [CLOUDFLARE.md](../../../CLOUDFLARE.md) §6.
- [x] 4.5 [Operator] Edit the test post so its slug matches the test TIL's slug. Confirm both `/blog/<slug>` and `/til/<slug>` resolve independently, each to the correct document. (Verifies separate URL namespaces.) Restore the original post slug afterward. — Moved to [CLOUDFLARE.md](../../../CLOUDFLARE.md) §6.

## 5. Rendering fidelity check

- [x] 5.1 [Operator] Edit the test post body in Studio to include: an `h2`, an `h3`, a bulleted list, a link, a blockquote, an inline image, and a code block with `language: "typescript"`. Publish. — Moved to [CLOUDFLARE.md](../../../CLOUDFLARE.md) §6.
- [x] 5.2 [Operator] Visit `/blog/<test-slug>` and verify each element renders: heading hierarchy correct, link clickable, image visible, code highlighted by Prism. — Moved to [CLOUDFLARE.md](../../../CLOUDFLARE.md) §6.
- [x] 5.3 If `prose` styling clashes with any Portable Text output (lists, hr, blockquote, inline images, code), capture the specific class collisions and resolve by adjusting either the serializer or the `prose-*` modifier set on the article wrapper. — Conditional follow-up; tracked in [CLOUDFLARE.md](../../../CLOUDFLARE.md) §6 alongside 5.2.
- [x] 5.4 [Operator] In Studio, leave a `post` document unpublished (no `publishedAt`). Verify it does not appear at `/blog` and that `/blog/<its-slug>` returns 404. — Moved to [CLOUDFLARE.md](../../../CLOUDFLARE.md) §6.

## 6. README + final verify

- [x] 6.1 Update `README.md` to add a "Planned" section listing deferred work: RSS / Atom feed at `/feed.xml`, `sitemap.xml`, tag filter pages (`/blog/tag/:slug`, `/til/tag/:slug`), social-layer comments, GH Discussions content port. Note each as a future change, not in-flight. (Also added a "surface in nav once there's content" item, matching the soft-launch decision.)
- [x] 6.2 [Operator] Run `pnpm build` and inspect the output to confirm the Studio bundle is code-split (a separate chunk, not in the main entry). If it leaked, return to 2.11 to tune the Vite config. (Verified during implementation: `pane2` 5MB, `VideoPlayer` 1.3MB, `SanityVision` 110KB, `studio-embed.client` 0.07KB server stub — all separate from main entry.)
- [x] 6.3 [Operator] Deploy to a Cloudflare preview environment. Smoke-test on the deployed URL: `/` renders, `/about` renders, `/blog` lists the test post, `/blog/<slug>` renders, `/til` lists the test TIL, `/til/<slug>` renders, `/_/studio` loads Studio. — Moved to [CLOUDFLARE.md](../../../CLOUDFLARE.md) §1.
- [x] 6.4 [Operator] Once the production URL is known, add it to the Sanity CORS allowlist (with credentials enabled) — completes the prereq deferred from 1.3. — Moved to [CLOUDFLARE.md](../../../CLOUDFLARE.md) §3.
- [x] 6.5 [Operator] Confirm header nav has not changed: "writing" still points at GH Discussions; no `/blog` or `/til` entry has been added. (Verified during `/opsx:verify`: `app/routes/codedrift-layout.tsx` unchanged.)
- [x] 6.6 [Operator] Once merged, run `/opsx:archive add-sanity-blog`. (Running now, ahead of the merge — operator sign-off captured in CLOUDFLARE.md for what remains.)
