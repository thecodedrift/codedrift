## 1. Infrastructure

- [x] 1.1 Replace `package.json` with React Router 7 dependencies (react, react-dom, react-router, @react-router/cloudflare, @cloudflare/vite-plugin, wrangler, remix-themes, rooks, clsx, isbot, tailwindcss, @tailwindcss/vite, @tailwindcss/typography) and dev dependencies (@react-router/dev, @cloudflare/workers-types, typescript, vite, vite-tsconfig-paths, @types/react, @types/react-dom, @types/node). Remove astro and prettier-plugin-astro. Update all scripts (dev, build, lint, typecheck, typegen, etc.)
- [x] 1.2 Create `tsconfig.json` targeting ES2022, moduleResolution bundler, jsx react-jsx, strict mode, `~/*` path alias to `./app/*`, rootDirs including `.react-router/types`, includes for `worker-configuration.d.ts`
- [x] 1.3 Create `react-router.config.ts` with `ssr: true` and future flags `v8_viteEnvironmentApi` and `v8_middleware`
- [x] 1.4 Create `vite.config.ts` with cloudflare plugin (`viteEnvironment: { name: "ssr" }`), tailwindcss, reactRouter, tsconfigPaths plugins, port 8642, and the required `cloudflare-vite-plugin-fix` inline plugin workaround
- [x] 1.5 Create `wrangler.jsonc` with name `codedrift`, main `./cloudflare/handler.ts`, `nodejs_compat` flag, assets binding to `./build/client`
- [x] 1.6 Create `app/context.ts` defining `cloudflareEnvironmentContext` (typed `Env`) and `cloudflareExecutionContext` (typed `ExecutionContext`) using React Router `createContext`
- [x] 1.7 Create `cloudflare/handler.ts` with `createRequestHandler`, `RouterContextProvider`, setting both context values and delegating to the request handler
- [x] 1.8 Update `.gitignore` to include `.react-router/`, `build/`, `.wrangler/`, `.dev.vars` and remove Astro-specific ignores
- [x] 1.9 Run `pnpm install` and verify dependencies resolve

## 2. Tooling

- [x] 2.1 Create `eslint.config.js` with typescript-eslint (type-checked), eslint-plugin-unicorn (flat/recommended), eslint-config-prettier, kebab-case filename enforcement with React Router exceptions, underscore-prefixed unused vars allowed, common abbreviations permitted
- [x] 2.2 Add eslint dev dependencies: `@eslint/js`, `eslint`, `eslint-config-prettier`, `eslint-plugin-unicorn`, `typescript-eslint`
- [x] 2.3 Create `.prettierrc` with `prettier-plugin-tailwindcss` and create `.prettierignore` excluding config/lock/ignore/generated/sh/cfg files
- [x] 2.4 Create `.syncpackrc.json` with workspace mode, `^` semver range, and sorted field ordering
- [x] 2.5 Create `.lintstagedrc.js` with eslint+prettier on source files, prettier on md/json/graphql, syncpack+prettier on package.json
- [x] 2.6 Add husky, lint-staged, and syncpack dev dependencies. Configure `prepare` script for husky. Initialize husky pre-commit hook running lint-staged
- [x] 2.7 Verify `pnpm lint` and `pnpm prettier --check .` run without configuration errors

## 3. Framework

- [x] 3.1 Create `app/routes.ts` with explicit route config: codedrift layout wrapping index route and four named routes (about, help, social, talks)
- [x] 3.2 Create `app/root.tsx` as minimal document shell: `<html>`, `<head>` (Meta, Links, favicon, rel-me links, referrer policy), `<body>`, ThemeProvider from remix-themes, Scripts, ScrollRestoration, Outlet. Import global CSS
- [x] 3.3 Set up remix-themes: create theme session resolver with cookie storage, add theme loader to root.tsx, wire ThemeProvider with resolved theme
- [x] 3.4 Create theme middleware (handled by remix-themes loader/action pattern + PreventFlashOnWrongTheme)
- [x] 3.5 Create `app/routes/codedrift-layout.tsx` with header (logo, nav links: writing, talks, til, ama, social icon, help icon, theme toggle), `<main>` with Outlet, and footer (copyright year, top link, about link). Visually match current Layout.astro

## 4. Component Migration

- [x] 4.1 Copy `src/styles/global.css` to `app/styles/global.css` and update `@source` directive from `.astro` to `.tsx` file extensions
- [x] 4.2 Create 6 icon components in `app/components/icons/` (chevron-left.tsx, chevron-right.tsx, chat.tsx, heart.tsx, sun.tsx, moon.tsx) as React components accepting `className` prop with identical SVG output
- [x] 4.3 Create `app/components/content.tsx` as prose wrapper component with full Tailwind Typography class list matching Content.astro
- [x] 4.4 Create `app/routes/home.tsx` with home page content matching index.astro (greeting, Taskless link, writing links). Set default title
- [x] 4.5 Create `app/routes/about.tsx` with colophon content matching about.astro. Set title "About Jakob"
- [x] 4.6 Create `app/routes/help.tsx` with support sections matching help.astro (Network, Investing, Advising, Interview Prep, Mentoring). Set title "Here to Help"
- [x] 4.7 Create `app/routes/social.tsx` with profile lists matching social.astro (Active and Inactive profiles). Set title "Jakob Elsewhere on the Web"
- [x] 4.8 Create `app/routes/talks.tsx` with talk archive matching talks.astro (all talks with links, Microphone Optional section). Set title "Talks and Speaking"

## 5. Cleanup and Verification

- [x] 5.1 Remove `src/` directory (all Astro pages, layouts, components, styles, assets)
- [x] 5.2 Remove `astro.config.mjs`
- [x] 5.3 Remove `.prettierrc` Astro parser overrides (if any remain) and `prettier-plugin-astro` references
- [x] 5.4 Remove `.vscode/extensions.json` Astro extension recommendation, update `.vscode/launch.json` for React Router dev
- [x] 5.5 Run `pnpm build` and verify production build succeeds without errors
- [x] 5.6 Run `pnpm dev` and verify all 5 routes render correctly with theme toggle working
- [x] 5.7 Run `pnpm typecheck` and verify no type errors
- [x] 5.8 Run `pnpm lint` and `pnpm prettier --check .` and fix any issues
