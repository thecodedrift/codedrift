import createImageUrlBuilder, {
  type SanityImageSource,
} from "@sanity/image-url";
import { data, useLoaderData } from "react-router";

import type { Route } from "./+types/post";
import Content from "~/components/content";
import { PortableText, type ImageConfig } from "~/components/portable-text";
import { cloudflareEnvironmentContext } from "~/context";
import { getSanityClient } from "~/sanity/client";
import { POST_BY_SLUG_QUERY } from "~/sanity/queries";

interface TagReference {
  _id: string;
  name: string;
  slug: { current: string };
}

interface PostEntry {
  _id: string;
  _updatedAt?: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  heroImage?: SanityImageSource;
  body: unknown[];
  tags?: TagReference[];
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Not Found — The CodeDrift" }];
  const { post } = loaderData;
  return [
    { title: `${post.title} — The CodeDrift` },
    ...(post.excerpt ? [{ name: "description", content: post.excerpt }] : []),
  ];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvironmentContext);
  const client = getSanityClient({ env });
  const post = await client.fetch<PostEntry | null>(POST_BY_SLUG_QUERY, {
    slug: params.slug,
  });

  if (!post) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router idiom: throwing a `data()` response surfaces as a 404 to the framework.
    throw data(undefined, { status: 404 });
  }

  const imageConfig: ImageConfig = {
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
  };

  return { post, imageConfig };
}

export default function BlogPost() {
  const { post, imageConfig } = useLoaderData<typeof loader>();
  const heroSource = post.heroImage
    ? createImageUrlBuilder(imageConfig)
        .image(post.heroImage)
        .width(1600)
        .auto("format")
        .url()
    : undefined;

  return (
    <div className="w-full flex-shrink-0 flex-col lg:w-auto">
      <div className="max-w-reading mx-2 lg:mx-0">
        <header className="mb-6">
          <time
            dateTime={post.publishedAt}
            className="font-mono text-sm text-gray-500 dark:text-gray-400"
          >
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="font-title mt-1 text-5xl font-bold">{post.title}</h1>
          {post.tags && post.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
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

        {heroSource ? (
          <img
            src={heroSource}
            alt=""
            className="mb-6 w-full rounded-md"
            loading="lazy"
          />
        ) : undefined}

        <Content>
          <PortableText value={post.body} imageConfig={imageConfig} />
        </Content>
      </div>
    </div>
  );
}
