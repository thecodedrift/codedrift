import { absoluteUrl } from "~/seo";

// Allow all crawlers (including AI) over content; keep the embedded Studio and
// action/resource endpoints out of indexes; advertise the sitemap.
const BODY = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /_/",
  "Disallow: /action/",
  "",
  `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
  "",
].join("\n");

export function loader() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
