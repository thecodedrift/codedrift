## ADDED Requirements

### Requirement: Cloudflare Worker entry point

The system SHALL provide a Cloudflare Worker handler at `cloudflare/handler.ts` that creates a `RouterContextProvider`, sets `cloudflareEnvironmentContext` and `cloudflareExecutionContext`, and delegates to React Router's `createRequestHandler`.

#### Scenario: Worker handles incoming request

- **WHEN** a request arrives at the Cloudflare Worker
- **THEN** the handler creates a `RouterContextProvider`, sets environment and execution context, and passes the request to React Router's request handler

### Requirement: Cloudflare environment context

The system SHALL define `cloudflareEnvironmentContext` and `cloudflareExecutionContext` in `app/context.ts` using React Router's `createContext`. These SHALL be typed as `Env` and `ExecutionContext` respectively.

#### Scenario: Loader accesses environment bindings

- **WHEN** a route loader calls `context.get(cloudflareEnvironmentContext)`
- **THEN** it receives the typed Cloudflare `Env` object with all configured bindings

#### Scenario: Loader accesses execution context

- **WHEN** a route loader calls `context.get(cloudflareExecutionContext)`
- **THEN** it receives the Cloudflare `ExecutionContext` for operations like `waitUntil`

### Requirement: Wrangler configuration

The system SHALL provide a `wrangler.jsonc` with the worker name set to `codedrift`, `main` pointing to `./cloudflare/handler.ts`, `compatibility_flags` including `nodejs_compat`, assets bound to `ASSETS` with directory `./build/client`.

#### Scenario: Production build deploys to Cloudflare

- **WHEN** the project is built and deployed via `wrangler deploy`
- **THEN** the worker serves the React Router application with static assets from the client build directory

### Requirement: Vite Cloudflare plugin with workaround

The system SHALL configure `@cloudflare/vite-plugin` in `vite.config.ts` with `viteEnvironment: { name: "ssr" }`. The configuration SHALL include the `cloudflare-vite-plugin-fix` inline plugin that conditionally deletes `config.dev` for the SSR environment in non-development builds to work around cloudflare/workers-sdk#8909.

#### Scenario: Development server starts successfully

- **WHEN** `pnpm dev` is run
- **THEN** the Vite dev server starts with the Cloudflare plugin providing a local worker environment

#### Scenario: Production build succeeds

- **WHEN** `pnpm build` is run
- **THEN** the build completes without the Cloudflare plugin dev/build conflict, producing a deployable worker bundle
