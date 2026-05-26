// Use the explicit workerd entry: the bare "@cf-wasm/og" specifier resolves to
// the Node condition under Vite's worker environment, which dynamically compiles
// WASM (disallowed on workerd). The /workerd build statically imports the wasm.
import { ImageResponse } from "@cf-wasm/og/workerd";

import type { Route } from "./+types/og";
import { cloudflareEnvironmentContext } from "~/context";
import { normalizeTitle, verifyTitle } from "~/og";
import { SITE } from "~/seo";

/** codedrift logo mark (the favicon chevrons), inlined as a data URI. */
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none"><path d="M274.896 153.384L420.146 298.634L274.896 443.884" stroke="#10b981" stroke-width="49.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M222.938 346.276L77.688 201.026L222.938 55.776" stroke="#10b981" stroke-width="49.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const LOGO_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG)}`;

/** Pick a title font size that keeps long titles readable within the card. */
function titleFontSize(title: string): number {
  if (title.length <= 36) return 76;
  if (title.length <= 60) return 64;
  if (title.length <= 90) return 54;
  return 46;
}

/** Module-scoped font cache; persists across requests in a warm isolate. */
let fontCache: { data: ArrayBuffer; weight: 300 | 600 }[] | undefined;
async function loadFonts(assets: Fetcher, origin: string) {
  if (fontCache) return fontCache;
  const [light, semibold] = await Promise.all([
    assets.fetch(new URL("/og/fonts/work-sans-300.woff", origin)),
    assets.fetch(new URL("/og/fonts/work-sans-600.woff", origin)),
  ]);
  fontCache = [
    { data: await light.arrayBuffer(), weight: 300 },
    { data: await semibold.arrayBuffer(), weight: 600 },
  ];
  return fontCache;
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvironmentContext);
  const url = new URL(request.url);
  const rawTitle = url.searchParams.get("title") ?? "";
  const sig = url.searchParams.get("sig") ?? "";

  const verified =
    rawTitle.length > 0 &&
    sig.length > 0 &&
    (await verifyTitle(rawTitle, sig, env.OG_SIGNATURE));

  // Production requires a valid signature (forged/missing → static default).
  // In dev, allow unsigned previews so layouts can be iterated freely at
  // /og/card.png?title=Your+Title (add &format=svg for fast iteration).
  if (!verified && !import.meta.env.DEV) {
    return Response.redirect(`${SITE.url}/og-default.png`, 302);
  }

  const title = normalizeTitle(rawTitle) || "Preview — pass ?title=Your+Title";
  const format = url.searchParams.get("format") === "svg" ? "svg" : "png";
  const fonts = await loadFonts(env.ASSETS, url.origin);

  return ImageResponse.async(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#1c1917",
        padding: "72px 80px",
        fontFamily: "Work Sans",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1200px",
          height: "10px",
          backgroundColor: "#047857",
        }}
      />
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={LOGO_DATA_URI} width={76} height={76} alt="" />
        <div
          style={{
            display: "flex",
            marginLeft: "22px",
            fontSize: "48px",
            fontWeight: 600,
          }}
        >
          <span style={{ color: "#fafaf9" }}>code</span>
          <span style={{ color: "#78716c" }}>drift</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: `${titleFontSize(title)}px`,
          fontWeight: 300,
          color: "#fafaf9",
          lineHeight: 1.15,
          maxWidth: "1040px",
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: "30px",
            fontWeight: 600,
            color: "#34d399",
          }}
        >
          codedrift.com
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            color: "#a8a29e",
            marginTop: "8px",
          }}
        >
          Jakob Heuser
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      format,
      fonts: fonts.map(({ data, weight }) => ({
        name: "Work Sans",
        data,
        weight,
        style: "normal",
      })),
      headers: {
        // Signed content is immutable; unsigned dev previews must not be cached.
        "Cache-Control": verified
          ? "public, max-age=31536000, immutable"
          : "no-store",
      },
    },
  );
}
