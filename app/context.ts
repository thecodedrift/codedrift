import { createContext } from "react-router";

/**
 * Context for Cloudflare environment bindings.
 * Set in the request handler, accessible in loaders/actions/middleware.
 */
export const cloudflareEnvironmentContext = createContext<Env>();

/**
 * Context for Cloudflare execution context.
 * Set in the request handler, accessible in loaders/actions/middleware.
 */
export const cloudflareExecutionContext = createContext<ExecutionContext>();
