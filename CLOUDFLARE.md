# Cloudflare migration

Tracking the move of codedrift.com from render.com to Cloudflare Workers. Single-environment (no staging/prod split). Each box is a manual / operator step.

Phases are ordered by dependency. Don't skip ahead — the DNS cutover (§4) is the one-way door, and §1–§3 exist to make sure that step is boring.

---

## Current state

- **Domain:** codedrift.com
- **Registrar:** Namecheap. Staying on Namecheap (no registrar transfer) — DNS just gets repointed at Cloudflare's nameservers.
- **DNS host today:** render.com. Moves to Cloudflare in §2. Google Workspace / other third-party records (MX, TXT for SPF/DKIM/DMARC, domain verification) live in render's DNS today and **must follow** to Cloudflare.
- **Current production host:** render.com (web service serving codedrift.com)
- **Cloudflare account:** exists, on Workers Paid ($5/mo).

---

## 0. Cloudflare account + local wrangler auth

One-time setup before any deploy is possible.

- [ ] Account exists; confirm the Workers Paid subscription is active on it (Dashboard → Workers & Pages → Plans).
- [ ] Authenticate the local CLI: `pnpm exec wrangler login`. Opens a browser; confirm the correct Cloudflare account.
- [ ] Verify: `pnpm exec wrangler whoami` shows the correct account.

## 1. First worker deploy to `*.workers.dev` + production secret

The worker is created on Cloudflare automatically by the first `wrangler deploy`. This step exercises the whole stack at a temporary URL before touching DNS.

- [ ] `pnpm build && pnpm exec wrangler deploy`. Wrangler reports the assigned `*.workers.dev` URL (e.g. `https://codedrift.<account-subdomain>.workers.dev`).
- [ ] Set the Sanity API read token as a production worker secret:
      `pnpm exec wrangler secret put SANITY_API_READ_TOKEN` (paste the same value you have in `.dev.vars`).
- [ ] Smoke-test the `*.workers.dev` URL. Reader routes that don't require Sanity should already work: `/`, `/about`, `/talks`, `/social`, `/help`.
- [ ] (Optional) If you want to test `/blog`, `/til`, or `/_/studio` on the `*.workers.dev` URL, add that URL to Sanity's CORS allowlist with credentials enabled. Otherwise skip — it gets covered properly under codedrift.com in §3.

## 2. Move codedrift.com DNS onto Cloudflare

Goal: the codedrift.com zone is managed by Cloudflare's DNS, but **traffic still flows to render** because the A/CNAME records still point at render. Nothing user-visible changes here — including email, which must keep working.

> **Email / Google Workspace risk:** Google MX records and any SPF / DKIM / DMARC TXT records currently live in render's DNS. If the nameserver flip happens before those records exist in Cloudflare, email breaks. Inventory before flipping.

- [ ] In render's DNS panel, **export or screenshot every record** for codedrift.com. Specifically capture:
  - `A` / `AAAA` records for apex + `www` (pointing at render)
  - `MX` records (Google Workspace: `aspmx.l.google.com.` and friends with their priorities)
  - `TXT` records for SPF (e.g. `v=spf1 include:_spf.google.com ~all`)
  - `TXT` / `CNAME` records for DKIM (Google's selector, often something like `google._domainkey`)
  - `TXT` records for DMARC (`_dmarc.codedrift.com`)
  - Any domain-verification `TXT` records (Google site verification, GitHub Pages verification, Sanity Studio verification, etc.)
  - Any other `CNAME` records (e.g. analytics, vendor subdomains)
- [ ] In the Cloudflare dashboard: **Add a Site** → enter `codedrift.com` → select the existing account (Workers Paid).
- [ ] Cloudflare scans existing DNS records by querying the current authoritative nameservers (render). Review the import list against your inventory from the previous step.
- [ ] For each record in your inventory that Cloudflare did **not** auto-import, add it manually. **For now, leave the A / AAAA / CNAME records pointing at render unchanged** — those records will be deleted in §4, not now.
  - Email records (`MX`, SPF/DKIM/DMARC `TXT`) should be **DNS-only / not proxied** (gray cloud, not orange).
  - Web records pointing at render in this phase should also be set to DNS-only — Cloudflare can't proxy traffic to render correctly, and we'll delete them in §4 anyway.
- [ ] Cloudflare assigns two nameservers (e.g. `xxx.ns.cloudflare.com`). Note them down.
- [ ] At Namecheap (Domain List → codedrift.com → Manage → Nameservers), switch from "Namecheap BasicDNS" / current setting to **Custom DNS** and enter Cloudflare's two NS values.
- [ ] Wait for propagation. Cloudflare dashboard shows the zone status as **Active** once it sees its own NS records — typically minutes to a couple of hours.
- [ ] While waiting, confirm `dig codedrift.com NS` returns Cloudflare's nameservers.
- [ ] Once the zone is Active, verify:
  - `https://codedrift.com` still serves the **current render version** (web records still point at render).
  - **Send and receive a test email** to/from a codedrift.com address. If Google Workspace is broken, fix MX / TXT records before continuing — do not proceed to §4 until email is verified working.
  - Any other verification records (Sanity, analytics, etc.) still resolve.

## 3. Pre-stage Sanity CORS for the production origin

Do this before the cutover so the moment DNS flips, Studio works.

- [ ] https://www.sanity.io/manage → project `6ar8m1y8` → API → CORS origins.
- [ ] Add `https://codedrift.com` with **Allow credentials = on**.
- [ ] (Optional) Add `https://www.codedrift.com` if you'll redirect or serve there too.

## 4. Cut traffic over to the worker

This is the one-way door. Before doing this, confirm the `*.workers.dev` URL from §1 still works end-to-end.

- [ ] In Cloudflare DNS (the codedrift.com zone), **delete** the A / AAAA / CNAME records that point at render.com for the apex (`codedrift.com`) and `www` if applicable. Worker Custom Domain attachment will fail if a conflicting record exists.
- [ ] In the Workers dashboard: **codedrift worker → Settings → Domains & Routes → Add → Custom Domain**. Enter `codedrift.com`.
- [ ] Cloudflare automatically creates the proxied DNS record pointing at the worker. SSL provisioning runs (1–5 minutes; status visible in the dashboard).
- [ ] (Optional) Repeat for `www.codedrift.com` if you want it to serve too.
- [ ] Hit `https://codedrift.com/` from a fresh browser session. Confirm:
  - It loads
  - Response header `server: cloudflare` is present (`curl -I https://codedrift.com`)
  - `/_/studio` works (sign-in succeeds, schemas show — confirms §3 CORS landed correctly)
  - `/blog` and `/til` render their empty / populated states

## 5. Decommission render.com

Only after §4 has been stable for ~24 hours and you've used the site normally.

- [ ] In the render dashboard, check the request graph for the codedrift service — should be flat / near-zero traffic.
- [ ] If render was also providing DNS for the domain, make sure §2 imported everything (MX records, TXT records for email/verification, etc.). Re-check now while render is still available as a reference.
- [ ] Suspend, then delete, the render web service.
- [ ] Cancel any paid plans / clean up billing on render.

## 6. Sanity content smoke test

Deferred from the [add-sanity-blog](openspec/changes/archive/2026-05-19-add-sanity-blog/) change. Run these in Studio + the live worker once the cutover (§4) is stable. None of them require code changes; if `5.3` triggers, that's the only one that does.

- [ ] Create one `tag` (e.g., "code"), one `post` referencing it, one `til` referencing it. Publish both.
- [ ] Visit `/blog` — confirm the test post + tag pill render.
- [ ] Visit `/blog/<test-slug>` — confirm body renders with prose styling.
- [ ] Visit `/blog/does-not-exist` — confirm 404.
- [ ] Visit `/til`, `/til/<test-slug>`, `/til/does-not-exist` — same three checks.
- [ ] Edit the test post slug to match the test TIL slug; confirm `/blog/<slug>` and `/til/<slug>` resolve independently. Restore.
- [ ] Edit the test post body to include: `h2`, `h3`, bulleted list, link, blockquote, inline image, code block with `language: "typescript"`. Publish.
- [ ] Verify each rich-content element renders correctly: heading hierarchy, link clickable, image visible, code highlighted by Prism.
- [ ] If `prose` styling clashes with any Portable Text output (lists, hr, blockquote, inline images, code), adjust the serializer in [app/components/portable-text.tsx](app/components/portable-text.tsx) or the `prose-*` modifier set in [app/components/content.tsx](app/components/content.tsx).
- [ ] Leave one `post` document unpublished (no `publishedAt`); confirm it's hidden from `/blog` and that `/blog/<its-slug>` returns 404.

## 7. Housekeeping

- [ ] Update [README.md](README.md) "Stack" line — it still says "A simple Astro site". Should reflect React Router 7 on Cloudflare Workers.
- [ ] Once `/blog` and `/til` have content worth pointing at, flip the header "writing" link in [app/routes/codedrift-layout.tsx](app/routes/codedrift-layout.tsx) from GH Discussions to `/blog`. (Tracked in README's "Planned" section.)

---

## Reference

- Cloudflare project / worker name: `codedrift` (per [wrangler.jsonc](wrangler.jsonc))
- Vite dev port: `5173` (matches `wrangler dev.port` so CORS allowlists are consistent)
- Sanity project: `6ar8m1y8` (dataset `production`)
- Local secrets: `.dev.vars` (gitignored)
- Production secrets: Cloudflare Worker secrets (`wrangler secret put ...`)
- Currently NO custom domain or routes are configured in `wrangler.jsonc`. Custom domain attachment happens via the dashboard (§4) — wrangler.jsonc-based routes are an alternative path not used here, to keep DNS state visible in one place (the Cloudflare dashboard).
