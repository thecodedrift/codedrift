> **TODO — STUB.** This is a placeholder created to capture work deferred from the [`add-sanity-blog`](../archive/2026-05-19-add-sanity-blog/) change and the render→Cloudflare migration. Treat the sections below as a notes-page, not a fully-realized proposal. Flesh out (and run `/opsx:propose` / `/opsx:continue` to generate `design.md`, `specs/`, and `tasks.md`) before implementation begins.

## Why

`add-sanity-blog` shipped the reading surfaces (`/blog`, `/til`) and Studio, but the underlying Sanity dataset is empty. Long-form writing currently lives in the GitHub Discussions "Thunked" category and short notes in "TIL". Both need to land in Sanity so the reader surfaces have content worth pointing at — and once they do, the header "writing" link can flip from GH Discussions to `/blog`.

The acceptance bar for this change is: the live `www.codedrift.com/blog` and `www.codedrift.com/til` surfaces serve real historical content with no rendering regressions, and the header nav points readers at them.

## What Changes

**TODO — flesh out, then split into proposal/design/specs/tasks via `/opsx:continue`.**

Working notes (stub):

- **Import GH Discussions "Thunked" → Sanity `post`.** Pull via GitHub GraphQL API, convert markdown → Portable Text (`@sanity/block-tools`), preserve `created_at` as `publishedAt`, map the `📚 Code` / `📚 Leadership` (etc.) labels to `tag` references, hand-check code-block fidelity (language hints, fenced vs. indented).
- **Import GH Discussions "TIL" → Sanity `til`.** Same pipeline, lighter content shape.
- **Decide on a re-runnable vs. one-shot import.** One-shot is simpler. Re-runnable (idempotent on Discussion ID → Sanity `_id`) covers the case where you keep authoring on GitHub for a while.
- **Preserve URLs where reasonable.** Old codedrift.com Ghost URLs (e.g. `/thunked/use-github-as-a-cms`) — out of scope here unless cheap; otherwise covered by 301 redirects in a separate change.
- **Verification scaffold.** Deferred from `add-sanity-blog` ([tasks.md groups 2.13, 3.5, 3.6, 4.4, 4.5, 5.1–5.4](../archive/2026-05-19-add-sanity-blog/tasks.md)) — reuse these as the acceptance scenarios once content is in:
  - Test tag + post + til render at `/blog`, `/blog/<slug>`, `/til`, `/til/<slug>`
  - Unknown slugs return 404
  - Same slug across `post` and `til` resolves independently in each namespace
  - Rich-content fidelity: h2, h3, bulleted list, link, blockquote, inline image, code block with Prism highlighting
  - Unpublished post (no `publishedAt`) is hidden from `/blog` and 404s on `/blog/<its-slug>`
  - Adjust `prose-*` modifiers or Portable Text serializers if rendering clashes appear ([app/components/portable-text.tsx](../../../app/components/portable-text.tsx), [app/components/content.tsx](../../../app/components/content.tsx))
- **Header nav flip (deferred from `add-sanity-blog` D9).** Once content lands, update [app/routes/codedrift-layout.tsx](../../../app/routes/codedrift-layout.tsx) to point the "writing" link at `/blog` instead of the GH Discussions "Thunked" category. The "til" link similarly moves to `/til`. Track in this change's tasks rather than as a separate one.

### Out of scope

- 301 redirects from legacy Ghost / render URLs (separate change if/when needed).
- RSS / Atom feed (planned, separate change — see README "Planned").
- `sitemap.xml` (planned, separate change).
- Tag filter pages (`/blog/tag/:slug`, `/til/tag/:slug`).

## Capabilities

**TODO** — likely modifies the existing `blog` capability (adds requirements around content presence + nav-link surface). May not need new capabilities. Decide during `/opsx:propose` / `/opsx:continue`.

## Impact

**TODO** — depends on the import approach decided above. At minimum:

- A new top-level `scripts/` (or similar) directory for the import script(s).
- `app/routes/codedrift-layout.tsx` — nav link updates.
- Possibly a new `blog` spec delta if the "nav unchanged at launch" requirement gets superseded.
