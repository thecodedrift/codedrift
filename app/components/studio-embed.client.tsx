import { Studio } from "sanity";

import config from "../../sanity.config";

export default function StudioEmbed() {
  return <Studio config={config} />;
}
