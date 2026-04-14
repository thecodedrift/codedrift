import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, route } from "@react-router/dev/routes";

export default [
  route("action/set-theme", "routes/action.set-theme.ts"),
  layout("routes/codedrift-layout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("help", "routes/help.tsx"),
    route("social", "routes/social.tsx"),
    route("talks", "routes/talks.tsx"),
  ]),
] satisfies RouteConfig;
