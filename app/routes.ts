import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  route("action/set-theme", "routes/action.set-theme.ts"),
  route("_/studio/*", "routes/studio.tsx"),
  layout("routes/codedrift-layout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("help", "routes/help.tsx"),
    route("social", "routes/social.tsx"),
    route("talks", "routes/talks.tsx"),

    ...prefix("blog", [
      index("routes/blog/index.tsx"),
      route(":slug", "routes/blog/post.tsx"),
    ]),

    ...prefix("til", [
      index("routes/til/index.tsx"),
      route(":slug", "routes/til/entry.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
