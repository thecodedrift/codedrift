import { createRequestHandler, RouterContextProvider } from "react-router";
import {
  cloudflareEnvironmentContext,
  cloudflareExecutionContext,
} from "../app/context";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const context = new RouterContextProvider();
    context.set(cloudflareEnvironmentContext, env);
    context.set(cloudflareExecutionContext, ctx);
    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
