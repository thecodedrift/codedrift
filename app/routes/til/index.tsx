import { Link, useLoaderData, type MetaFunction } from "react-router";

import type { Route } from "./+types/index";
import { cloudflareEnvironmentContext } from "~/context";
import { getSanityClient } from "~/sanity/client";
import { TIL_INDEX_QUERY } from "~/sanity/queries";
import { pageMeta } from "~/seo";

export const meta: MetaFunction = () =>
  pageMeta({
    title: "TIL — The CodeDrift",
    description: "Today I learned. Short notes by Jakob Heuser.",
    path: "/til",
  });

interface TagReference {
  _id: string;
  name: string;
  slug: { current: string };
}

interface TilListEntry {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  tags?: TagReference[];
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvironmentContext);
  const client = getSanityClient({ env });
  const tils = await client.fetch<TilListEntry[]>(TIL_INDEX_QUERY);
  return { tils };
}

export default function TilIndex() {
  const { tils } = useLoaderData<typeof loader>();

  return (
    <div className="w-full flex-shrink-0 flex-col lg:w-auto">
      <div className="max-w-reading mx-2 lg:mx-0">
        <h1 className="font-title mb-3 text-5xl font-bold">TIL</h1>
        <p className="mb-6 font-sans text-lg text-gray-600 dark:text-gray-300">
          Today I learned. Quick notes — things worth remembering, not full
          posts.
        </p>
        {tils.length === 0 ? (
          <p className="font-sans text-lg text-gray-600 dark:text-gray-400">
            Nothing here yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-300 dark:divide-gray-700">
            {tils.map((til) => (
              <li key={til._id}>
                <Link
                  to={`/til/${til.slug.current}`}
                  className="group flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <time
                    dateTime={til.publishedAt}
                    className="font-mono text-sm text-gray-500 sm:w-28 sm:flex-shrink-0 dark:text-gray-400"
                  >
                    {new Date(til.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span className="group-hover:text-primary-700 dark:group-hover:text-primary-400 font-sans text-lg">
                    {til.title}
                  </span>
                  {til.tags && til.tags.length > 0 ? (
                    <span className="flex flex-wrap gap-1.5 sm:ml-auto">
                      {til.tags.map((tag) => (
                        <span
                          key={tag._id}
                          className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </span>
                  ) : undefined}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
