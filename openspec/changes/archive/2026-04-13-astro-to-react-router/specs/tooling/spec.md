## ADDED Requirements

### Requirement: ESLint configuration

The system SHALL provide an `eslint.config.js` using typescript-eslint with type-checked rules, eslint-plugin-unicorn (flat/recommended), and eslint-config-prettier. The config SHALL enforce kebab-case filenames (with exceptions for React Router convention files like `_index.tsx`, `$.tsx`, and `*.server.ts`), allow underscore-prefixed unused variables, and permit common abbreviations (`env`, `ctx`, `args`, `props`, `utils`).

#### Scenario: ESLint runs without errors on valid source

- **WHEN** `pnpm lint` is run on correctly formatted source files
- **THEN** ESLint reports no errors

#### Scenario: Non-kebab-case filename is flagged

- **WHEN** a file is named `MyComponent.tsx`
- **THEN** ESLint reports a `unicorn/filename-case` error

#### Scenario: React Router convention files are allowed

- **WHEN** a file is named `_index.tsx` or `home.server.ts`
- **THEN** ESLint does not flag the filename

### Requirement: Prettier configuration

The system SHALL provide a `.prettierrc` and `.prettierignore`. The prettier config SHALL include `prettier-plugin-tailwindcss` for class sorting. The ignore file SHALL exclude config files, lock files, ignore files, generated files, shell scripts, and cfg files.

#### Scenario: Prettier formats source files

- **WHEN** `pnpm prettier --write` is run on source files
- **THEN** files are formatted with Tailwind class sorting applied

### Requirement: Husky and lint-staged

The system SHALL configure husky for git hooks and lint-staged for pre-commit checks. The lint-staged config SHALL run eslint --fix and prettier --write on JS/TS/JSX/TSX files, prettier --write on md/json/graphql files, and syncpack list-mismatches + syncpack format + prettier --write on package.json.

#### Scenario: Pre-commit hook runs linting

- **WHEN** a developer stages files and runs `git commit`
- **THEN** lint-staged runs the configured checks on staged files before allowing the commit

### Requirement: Syncpack configuration

The system SHALL provide a `.syncpackrc.json` with workspace mode enabled, semver range set to `^`, and sorted package.json field ordering matching the reference configuration.

#### Scenario: Package.json field order is enforced

- **WHEN** `syncpack format` is run
- **THEN** package.json fields are reordered to match the configured `sortFirst` order

### Requirement: Package.json scripts

The system SHALL provide the following npm scripts: `dev` (react-router dev), `build` (react-router build), `lint` (eslint), `lint:fix` (eslint --fix .), `typecheck` (typegen + tsc), `typegen` (react-router typegen), `prettier`, `syncpack`, `husky`, `lint-staged`, `prepare` (husky).

#### Scenario: Development server starts via script

- **WHEN** a developer runs `pnpm dev`
- **THEN** the React Router dev server starts with Cloudflare worker emulation

#### Scenario: Type checking runs via script

- **WHEN** a developer runs `pnpm typecheck`
- **THEN** React Router types are generated and TypeScript compiler checks the project
