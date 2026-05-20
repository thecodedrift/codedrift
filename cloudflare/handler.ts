import { createRequestHandler, RouterContextProvider } from "react-router";
import {
  cloudflareEnvironmentContext,
  cloudflareExecutionContext,
} from "../app/context";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

const APEX_HOST = "codedrift.com";
const CANONICAL_HOST = "www.codedrift.com";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === APEX_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    const context = new RouterContextProvider();
    context.set(cloudflareEnvironmentContext, env);
    context.set(cloudflareExecutionContext, ctx);
    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
