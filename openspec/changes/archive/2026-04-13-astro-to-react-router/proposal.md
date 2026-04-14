## Why

The current Astro static site cannot support server-side concerns like GitHub API calls, authentication, or dynamic middleware. Migrating to React Router 7 on Cloudflare Workers provides a maintainable SSR-capable stack with the React component model, while preserving the existing site design and content.

## What Changes

- **BREAKING**: Replace the entire Astro build pipeline with React Router 7 framework mode on Cloudflare Workers
- **BREAKING**: Replace all `.astro` components (pages, layout, icons) with React `.tsx` components
- Replace the inline dark mode `<script>` with cookie-based SSR theme management using `remix-themes`
- Restructure from `src/pages/` to `app/routes/` with an explicit `routes.ts` configuration
- Introduce a layout route (`codedrift-layout.tsx`) to enable future projects with different site chrome
- Add Cloudflare Worker entry point (`cloudflare/handler.ts`) with `RouterContextProvider` for environment and execution context
- Add full tooling stack: eslint (with typescript-eslint + unicorn), prettier, husky, lint-staged, syncpack
- Add `rooks` hooks library and `clsx` for utility use
- Enable React Router v8 future flags: `v8_viteEnvironmentApi` and `v8_middleware`

## Capabilities

### New Capabilities

- `infrastructure`: Cloudflare Worker entry point, wrangler config, vite plugin setup with required workaround, and environment/execution context plumbing
- `framework`: React Router 7 framework mode setup with explicit `routes.ts`, SSR enabled, v8 future flags, codedrift layout route architecture, and cookie-based dark/light mode using `remix-themes` with React Router middleware for SSR theme resolution
- `component-migration`: Conversion of all Astro components (Layout, Content, 6 icons, 5 pages) to React TSX equivalents with identical visual output
- `tooling`: eslint (typescript-eslint + unicorn + prettier config), prettier, husky, lint-staged, syncpack, and associated configuration files

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- **All source files replaced**: Every `.astro` file in `src/` is removed and replaced with `.tsx` files in `app/`
- **Build system**: Astro CLI replaced by React Router dev/build via Vite with Cloudflare plugin
- **Dependencies**: Complete dependency overhaul — Astro removed, React + React Router + Cloudflare tooling added
- **Deployment**: Shifts from static file hosting to Cloudflare Workers (SSR)
- **Styling**: `global.css` carries over with minimal changes (`@source` directive updated for `.tsx` files)
- **Static assets**: `public/` directory contents unchanged
- **Content**: All hardcoded page content preserved identically in JSX form
