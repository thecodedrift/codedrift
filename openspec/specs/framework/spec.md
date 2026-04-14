# framework Specification

## Purpose

Defines the core React Router 7 framework configuration, routing model, root document shell, layouts, build tooling (Vite, TypeScript), and the cookie-based SSR theme system that replaces the current Astro framework. Establishes the foundation on which all routes and components are built.

## Requirements

### Requirement: React Router framework mode with SSR

The system SHALL use React Router 7 in framework mode with `ssr: true` in `react-router.config.ts`. The v8 future flags `v8_viteEnvironmentApi` and `v8_middleware` SHALL be enabled.

#### Scenario: Server-side rendering produces complete HTML

- **WHEN** a request arrives for any route
- **THEN** the server renders the full HTML document including layout, content, and applied theme class before sending to the client

### Requirement: Explicit route configuration

The system SHALL define all routes in `app/routes.ts` using React Router's programmatic API (`layout`, `index`, `route` helpers) rather than file-convention routing.

#### Scenario: Routes are defined in routes.ts

- **WHEN** the route configuration is loaded
- **THEN** it defines a codedrift layout wrapping an index route (`/`) and four named routes (`/about`, `/help`, `/social`, `/talks`)

### Requirement: Root document shell

The system SHALL provide an `app/root.tsx` that renders the `<html>`, `<head>`, and `<body>` elements, includes the global CSS import, renders React Router's `<Meta />`, `<Links />`, `<Scripts />`, and `<ScrollRestoration />` components, wraps content in the theme provider, and renders `<Outlet />` for child routes.

#### Scenario: Every page receives the document shell

- **WHEN** any route is rendered
- **THEN** the response includes a complete HTML document with charset, viewport meta, favicon, rel-me links, referrer policy, and the correct `<title>`

### Requirement: Codedrift layout route

The system SHALL provide a layout route (`codedrift-layout.tsx`) that renders the site header with logo and navigation, the `<main>` content area with `<Outlet />`, and the site footer. This layout SHALL be visually identical to the current Astro `Layout.astro`.

#### Scenario: Codedrift pages render with site chrome

- **WHEN** a user navigates to any codedrift route (/, /about, /help, /social, /talks)
- **THEN** the page displays the header with logo, navigation links (writing, talks, til, ama, social icon, help icon, theme toggle), main content, and footer with copyright year

#### Scenario: Future projects can use different layouts

- **WHEN** a new section of the site requires different chrome
- **THEN** a new layout route can be added to `routes.ts` without modifying the codedrift layout or root

### Requirement: Vite configuration

The system SHALL provide a `vite.config.ts` that configures the Cloudflare plugin, Tailwind CSS plugin, React Router plugin, and tsconfig paths plugin. The dev server SHALL use port 8642.

#### Scenario: All Vite plugins load without conflict

- **WHEN** the Vite dev server or build process starts
- **THEN** all plugins (cloudflare, tailwindcss, reactRouter, tsconfigPaths, cloudflare-vite-plugin-fix) initialize successfully

### Requirement: TypeScript configuration

The system SHALL provide a `tsconfig.json` targeting ES2022 with `moduleResolution: "bundler"`, `jsx: "react-jsx"`, strict mode enabled, and a `~/\*` path alias mapping to `./app/*`. The config SHALL include `.react-router/types` in `rootDirs` and `worker-configuration.d.ts` in includes.

#### Scenario: TypeScript resolves path aliases

- **WHEN** a source file imports from `~/components/content`
- **THEN** TypeScript resolves it to `./app/components/content`

### Requirement: Cookie-based theme storage

The system SHALL store the user's theme preference (light or dark) in a cookie using `remix-themes`. The cookie SHALL be readable during SSR so the server can render the correct theme on first byte.

#### Scenario: Theme preference persists across sessions

- **WHEN** a user sets their theme to dark and returns later
- **THEN** the server reads the theme cookie and renders the page with `class="dark"` on `<html>` before the client receives any HTML

#### Scenario: First visit with no cookie

- **WHEN** a new visitor arrives with no theme cookie
- **THEN** the system falls back to the OS preference via `prefers-color-scheme` media query

### Requirement: SSR theme resolution via middleware

The system SHALL use React Router v8 middleware to resolve the theme from the cookie before any route rendering occurs. The resolved theme SHALL be available to `root.tsx` for setting the `<html>` class attribute.

#### Scenario: Middleware resolves theme before render

- **WHEN** a request arrives with a theme cookie set to "dark"
- **THEN** the middleware resolves the theme and root.tsx renders `<html class="dark">`

#### Scenario: No flash of unstyled content

- **WHEN** a user with a dark theme preference loads any page
- **THEN** the server-rendered HTML already has the correct theme class applied, with zero FOUC on hydration

### Requirement: Theme toggle component

The system SHALL provide a theme toggle in the codedrift layout navigation that switches between light and dark modes. The toggle SHALL display a sun icon in dark mode and a moon icon in light mode, matching the current Astro behavior.

#### Scenario: User toggles from light to dark

- **WHEN** a user clicks the theme toggle while in light mode
- **THEN** the page switches to dark mode, the `<html>` class updates to "dark", the cookie is updated, and the icon changes to a sun

#### Scenario: User toggles from dark to light

- **WHEN** a user clicks the theme toggle while in dark mode
- **THEN** the page switches to light mode, the `<html>` class updates to "light", the cookie is updated, and the icon changes to a moon

### Requirement: Dark mode variant compatibility

The system SHALL continue using the `@variant dark (html.dark &)` Tailwind directive. The theme system SHALL set the `dark` class on the `<html>` element, maintaining compatibility with all existing Tailwind dark mode utilities.

#### Scenario: Tailwind dark utilities apply correctly

- **WHEN** the theme is set to dark
- **THEN** all `dark:` prefixed Tailwind classes activate based on the `html.dark` class
