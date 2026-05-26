import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import {
  ThemeProvider,
  PreventFlashOnWrongTheme,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "./theme.server";
import type { Route } from "./+types/root";
import { SOCIAL_PROFILES, personJsonLd } from "./seo";
import "./styles/global.css";

export async function loader({ request }: Route.LoaderArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const pathname = new URL(request.url).pathname;
  return {
    theme: getTheme(),
    canonicalUrl: `https://www.codedrift.com${pathname}`,
  };
}

function Document({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={data.canonicalUrl} />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {SOCIAL_PROFILES.map((href) => (
          <link key={href} rel="me" href={href} />
        ))}
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <script
          type="application/ld+json"
          // Site-wide Person entity; sameAs mirrors the rel=me links above.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body
        className="bg-paper-stone-200 dark:bg-paper-stone-800 bg-gray-100 font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-100"
        style={{
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          transition: "all 0.5s",
        }}
      >
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <Document>
        <Outlet />
      </Document>
    </ThemeProvider>
  );
}
