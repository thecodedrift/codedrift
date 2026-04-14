## Context

Codedrift is a 5-page personal website currently on Astro (static output). The codebase is small — 15 source files, no data fetching, no content collections. All page content is hardcoded HTML. The site uses Tailwind v4 with a custom theme (paper/leather textures, Google Fonts, emerald/amber/stone palette) and a client-side dark mode toggle via `localStorage`.

Reference files for the target stack exist in `tmp/` from the twitchdrift project — a React Router 7 + Cloudflare Workers app. These provide proven configurations for vite, wrangler, eslint, tsconfig, and the Cloudflare handler pattern. The codedrift migration strips out twitchdrift-specific dependencies (Neon DB, Kysely, Spotify, etc.) while keeping the infrastructure skeleton.

## Goals / Non-Goals

**Goals:**

- Full SSR on Cloudflare Workers using React Router 7 framework mode
- Visually identical output — same design, same content, same behavior
- Cookie-based theme management with zero FOUC on server-rendered pages
- Layout route architecture that allows future projects with different site chrome
- Production-quality tooling (linting, formatting, type checking)
- Foundation for future server-side capabilities (GitHub API, auth, middleware)

**Non-Goals:**

- Content model changes (GitHub Discussions as external CMS stays as-is)
- New features or pages beyond what currently exists
- Database or API integrations (future concern)
- Pre-rendering or static generation (full SSR chosen for better-documented patterns)

## Decisions

### 1. Explicit `routes.ts` over file-convention routing

Use React Router's programmatic route config in `app/routes.ts` with `layout()`, `index()`, and `route()` helpers.

**Rationale**: With only 5 routes and one layout, the explicit config is clearer and more readable than encoding relationships in filenames (e.g., `_codedrift._index.tsx`). File conventions add value as route count grows; at this scale they add indirection.

**Alternative considered**: `@react-router/fs-routes` flat file convention — rejected for readability at this scale.

### 2. Separate layout route for site chrome

`root.tsx` is a minimal shell (`<html>`, `<head>`, `<body>`, ThemeProvider, `<Outlet />`). The codedrift header, nav, and footer live in a layout route (`codedrift-layout.tsx`) that wraps the 5 page routes.

**Rationale**: Future projects may need entirely different chrome. A layout route lets new sections opt into different visual shells without touching the root. The root stays focused on document-level concerns (meta, scripts, theme provider).

**Alternative considered**: Putting all chrome in `root.tsx` — rejected because it would require refactoring when adding a second layout.

### 3. `remix-themes` with cookie-based SSR over `next-themes` with localStorage

Use `remix-themes` for theme management. The theme preference is stored in a cookie, read by React Router middleware during SSR, and used to render the correct `<html>` class server-side.

**Rationale**: `next-themes` stores preference in `localStorage`, which the server cannot read — leading to a flash or requiring a blocking client script. Cookie-based storage lets the middleware resolve the theme before any rendering occurs, producing correct HTML on first byte. This is the right pattern for full SSR. `remix-themes` was built for Remix, which merged into React Router 7, so API compatibility is expected.

**Alternative considered**: `next-themes` — rejected because localStorage is invisible to the server. Hand-rolled cookie + context — viable but `remix-themes` already solves this.

### 4. `RouterContextProvider` for Cloudflare bindings

The worker handler (`cloudflare/handler.ts`) creates a `RouterContextProvider` and sets `cloudflareEnvironmentContext` and `cloudflareExecutionContext`. Loaders, actions, and middleware access these via `context.get()`.

**Rationale**: This is the modern React Router 7 pattern (replacing the older `getLoadContext`). It provides typed access to Cloudflare's `Env` and `ExecutionContext` without manual plumbing. The `userContext` from the twitchdrift reference is omitted — no auth layer yet.

### 5. Cloudflare Vite plugin workaround is required

The `vite.config.ts` must include the `cloudflare-vite-plugin-fix` inline plugin that conditionally deletes `config.dev` for the SSR environment in non-development builds. This works around an unresolved bug (cloudflare/workers-sdk#8909).

**Rationale**: Without this workaround, production builds fail. The fix is small (6 lines) and scoped. It should be removed when the upstream bug is fixed.

### 6. `rooks` for React hooks utility library

Add `rooks` as the hooks utility library.

**Rationale**: Better maintained and more idiomatic than `usehooks-ts`. Provides a broad set of hooks that will be useful as the site gains interactivity.

### 7. v8 future flags enabled from the start

Enable both `v8_viteEnvironmentApi` and `v8_middleware` in `react-router.config.ts`.

**Rationale**: `v8_middleware` is needed for the theme resolution middleware and future auth middleware. `v8_viteEnvironmentApi` is required by the Cloudflare Vite plugin. Starting with these flags avoids a future migration.

### 8. Tailwind v4 CSS carries over with minimal changes

The `global.css` file (custom theme tokens, paper/leather texture SVGs, `.as-link` utility, typography plugin) transfers nearly unchanged. The only required change is updating `@source` from `.astro` to `.tsx` file extensions.

**Rationale**: Tailwind v4's CSS-first config is framework-agnostic. The theme definition is pure CSS custom properties. The `@variant dark (html.dark &)` directive continues to work with `remix-themes` setting the `dark` class on `<html>`.

## Risks / Trade-offs

**`remix-themes` may need adaptation for React Router 7 APIs** — The package was built for Remix. If it still imports from `@remix-run/*` rather than `react-router`, it may need a fork or a thin wrapper. Mitigation: the cookie + middleware + context pattern is ~50-60 lines to hand-roll if the package is incompatible.

**Complete rewrite carries risk of subtle visual regressions** — Every component is being rewritten from Astro to React. Mitigation: the site is 5 pages with hardcoded content and no dynamic behavior beyond the theme toggle. Visual diffing after migration can catch regressions quickly.

**Cloudflare Vite plugin bug requires ongoing workaround** — The inline plugin fix is a dependency on an upstream bug remaining unfixed. Mitigation: the workaround is isolated, small, and easy to remove. Monitor the upstream issue for resolution.

**SSR adds complexity over static** — The current site could remain static and still work. SSR is chosen to enable future server-side capabilities. Mitigation: the site's simplicity means SSR overhead is minimal, and Cloudflare Workers are fast at the edge.
