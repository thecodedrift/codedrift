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
import "./styles/global.css";

export async function loader({ request }: Route.LoaderArgs) {
  const { getTheme } = await themeSessionResolver(request);
  return { theme: getTheme() };
}

function Document({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="me" href="https://hachyderm.io/@jakobo" />
        <link rel="me" href="https://twitter.com/jakobo" />
        <link rel="me" href="https://linkedin.com/in/jakobheuser" />
        <link rel="me" href="https://github.com/jakobo" />
        <link rel="me" href="https://twitch.tv/jakobox" />
        <link rel="me" href="https://www.instagram.com/codedrift.social/" />
        <link rel="me" href="https://www.reddit.com/user/Jakobox" />
        <link rel="me" href="https://www.threads.net/@codedrift.social" />
        <link rel="me" href="https://bsky.app/profile/codedrift.social" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
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
