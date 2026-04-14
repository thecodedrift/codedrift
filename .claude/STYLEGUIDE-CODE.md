# Code Style Guide

This document outlines code style conventions for the Twitchdrift codebase.

## Import Patterns

### Prefer Direct Imports Over Barrel Exports

**DO NOT** use barrel exports (re-exporting from `index.ts` files) for internal modules. Import directly from the source file.

```typescript
// ✅ Good - Direct imports
import { checkoutRepository } from "./actions/git";
import { invokeClaudeCLI } from "./actions/invoke-claude";
import { validateAllRules } from "./actions/validation";

// ❌ Bad - Barrel import
import {
  checkoutRepository,
  invokeClaudeCLI,
  validateAllRules,
} from "./actions";
```

**Rationale:**

- Direct imports make it easier to trace where code is defined
- Reduces indirection when debugging or navigating the codebase
- Avoids circular dependency issues that barrel exports can introduce
- Makes tree-shaking more predictable

**Exception:** Third-party packages that use barrel exports as their public API are fine to import from their main entry point.

```typescript
// ✅ Fine - External package API
import { getSandbox } from "@cloudflare/sandbox";
```

### Group and Order Imports

Organize imports in the following order, separated by blank lines:

1. Node.js built-in modules (if any)
2. External packages (npm dependencies)
3. Internal modules (relative imports)

```typescript
// External packages
import { getSandbox } from "@cloudflare/sandbox";

// Internal modules
import { checkoutRepository } from "./actions/git";
import { invokeClaudeCLI } from "./actions/invoke-claude";
import { GeneratorError, GeneratorErrorCode } from "./types";
```

## Type Definitions

### Prefer Library Types Over Custom Definitions

When working with external APIs or libraries, **always prefer using types exported by those libraries** instead of defining your own interfaces. Library types are more complete, stay in sync with API changes, and provide better IDE support.

```typescript
// ✅ Good - Use library types
import type { Octokit } from "@octokit/core";
import type { Endpoints } from "@octokit/types";

type PullRequest =
  Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"]["response"]["data"];
type IssueComment =
  Endpoints["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"]["response"]["data"];

async function fetchPR(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
) {
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}",
    {
      owner,
      repo,
      pull_number: prNumber,
    },
  );
  return response.data; // Correctly typed as PullRequest
}

// ❌ Bad - Custom interface duplicating library types
interface GitHubPR {
  title: string;
  body: string | null;
}

interface GitHubComment {
  id: number;
  user: { login: string } | null;
  body: string;
}
```

**Rationale:**

- Library types are generated from OpenAPI specs or source code, so they're always accurate
- Custom types quickly become stale and incomplete
- IDE autocomplete works better with complete library types
- Reduces maintenance burden - library updates automatically fix type issues

**Common library type patterns:**

| Library        | Type Source                 | Example                                                                          |
| -------------- | --------------------------- | -------------------------------------------------------------------------------- |
| Octokit        | `@octokit/types`            | `Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['response']['data']` |
| Octokit client | `@octokit/core`             | `import type { Octokit } from '@octokit/core'`                                   |
| Cloudflare     | `@cloudflare/workers-types` | Globals like `Request`, `Response`, `DurableObjectStub`                          |
| Zod            | Infer from schema           | `z.infer<typeof mySchema>`                                                       |

**When custom types are acceptable:**

- The library doesn't export types
- You need a subset/transformation of the original type for your domain model
- You're defining types for your own APIs (not external ones)

## Cross-Worker Durable Object Access

### Use DurableObjectRPC for Cross-Worker DO Calls

When accessing Durable Objects from a different worker (e.g., dashboard accessing storage DOs), use `DurableObjectRPC<T>` from `@taskless/shared/rpc` instead of `DurableObjectStub<T>`.

```typescript
// ✅ Good - DurableObjectRPC for cross-worker access
import type { DurableObjectRPC } from "@taskless/shared/rpc";
import type { GitHubOrganizationDO } from "@taskless/storage";

const orgDoId = env.GITHUB_ORGANIZATION_DO.idFromName(installId);
const orgDO = env.GITHUB_ORGANIZATION_DO.get(
  orgDoId,
) as DurableObjectRPC<GitHubOrganizationDO>;

// ❌ Bad - DurableObjectStub doesn't correctly type RPC returns
import type { GitHubOrganizationDO } from "@taskless/storage";

const orgDO = env.GITHUB_ORGANIZATION_DO.get(
  orgDoId,
) as DurableObjectStub<GitHubOrganizationDO>;
```

**Rationale:**

- RPC calls across workers are inherently async - all method returns become Promises
- `DurableObjectStub<T>` doesn't correctly infer Promise-wrapped return types for cross-worker bindings
- `DurableObjectRPC<T>` wraps all method returns in `Promise<>` for correct typing

**When to use each:**

| Context                              | Type to Use                                                  |
| ------------------------------------ | ------------------------------------------------------------ |
| Calling DO from **same** worker      | `DurableObjectStub<T>` (the default from a `get() operation) |
| Calling DO from **different** worker | `DurableObjectRPC<T>`                                        |

**Import pattern:**

```typescript
// Type imports for cross-worker DO access
import type { DurableObjectRPC } from "@taskless/shared/rpc";
import type { UserDO, GitHubOrganizationDO } from "@taskless/storage";
```

## Code Quality Checks

**IMPORTANT:** After making code changes, you **MUST** run these checks before considering the task complete:

```bash
# Run TypeScript type checking (required for all TypeScript changes)
pnpm typecheck  # Runs typecheck across all packages

# Run linting (required for all code changes)
pnpm lint

# For package-specific checks:
pnpm --filter @taskless/shared typecheck
pnpm --filter @taskless/storage typecheck
pnpm --filter @taskless/generator typecheck
pnpm --filter @taskless/dashboard typecheck
```

If any of these checks fail, you **MUST** fix the issues before marking the task as complete.

### macOS Version Limitations

**WARNING:** On macOS versions below 13.5.0, the following limitations apply:

- **Wrangler type generation may fail** due to esbuild compatibility issues
- **ESLint may report false positives** about "unsafe" TypeScript operations when Cloudflare types cannot be generated
- **Some build tools may not work correctly**

If you encounter these issues on older macOS versions:

1. TypeScript compilation (`tsc --noEmit`) can still validate basic type safety
2. CI/CD in GitHub Actions will catch issues that local development might miss
3. Consider using a DevContainer or upgrading to macOS 13.5.0+ for full compatibility
