import { data, useLoaderData } from "react-router";

import type { Route } from "./+types/entry";
import Content from "~/components/content";
import { PortableText, type ImageConfig } from "~/components/portable-text";
import { cloudflareEnvironmentContext } from "~/context";
import { getSanityClient } from "~/sanity/client";
import { TIL_BY_SLUG_QUERY } from "~/sanity/queries";

interface TagReference {
  _id: string;
  name: string;
  slug: { current: string };
}

interface TilEntry {
  _id: string;
  _updatedAt?: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  body: unknown[];
  tags?: TagReference[];
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Not Found — The CodeDrift" }];
  const { til } = loaderData;
  return [{ title: `${til.title} — TIL — The CodeDrift` }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvironmentContext);
  const client = getSanityClient({ env });
  const til = await client.fetch<TilEntry | null>(TIL_BY_SLUG_QUERY, {
    slug: params.slug,
  });

  if (!til) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router idiom: throwing a `data()` response surfaces as a 404 to the framework.
    throw data(undefined, { status: 404 });
  }

  const imageConfig: ImageConfig = {
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
  };

  return { til, imageConfig };
}

export default function TilEntry() {
  const { til, imageConfig } = useLoaderData<typeof loader>();

  return (
    <div className="w-full flex-shrink-0 flex-col lg:w-auto">
      <div className="max-w-reading mx-2 lg:mx-0">
        <header className="mb-4">
          <time
            dateTime={til.publishedAt}
            className="font-mono text-sm text-gray-500 dark:text-gray-400"
          >
            {new Date(til.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="font-title mt-1 text-3xl font-bold">{til.title}</h1>
          {til.tags && til.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {til.tags.map((tag) => (
                <span
                  key={tag._id}
                  className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : undefined}
        </header>

        <Content>
          <PortableText value={til.body} imageConfig={imageConfig} />
        </Content>
      </div>
    </div>
  );
}
