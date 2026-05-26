import { Link, data, useLoaderData } from "react-router";

import type { Route } from "./+types/tag";
import PostList, { type PostListEntry } from "~/components/post-list";
import { cloudflareEnvironmentContext } from "~/context";
import { getSanityClient } from "~/sanity/client";
import { POSTS_BY_TAG_QUERY } from "~/sanity/queries";
import { buildSignedOgImageUrl } from "~/og";
import { absoluteUrl, pageMeta } from "~/seo";

interface TagDocument {
  _id: string;
  name: string;
  slug: string;
  type?: string;
}

interface PostsByTagResult {
  tag: TagDocument | null;
  posts: PostListEntry[];
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Not Found — The CodeDrift" }];
  const { tag } = loaderData;
  const path = `/blog/tag/${tag.slug}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: absoluteUrl("/blog"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tag.name,
        item: absoluteUrl(path),
      },
    ],
  };
  return [
    ...pageMeta({
      title: `${tag.name} — The CodeDrift`,
      description: `Long-form writing tagged ${tag.name} by Jakob Heuser.`,
      path,
      image: loaderData.ogImage,
    }),
    { "script:ld+json": breadcrumb },
  ];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvironmentContext);
  const client = getSanityClient({ env });
  const { tag, posts } = await client.fetch<PostsByTagResult>(
    POSTS_BY_TAG_QUERY,
    { slug: params.slug },
  );

  if (!tag) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router idiom: throwing a `data()` response surfaces as a 404 to the framework.
    throw data(undefined, { status: 404 });
  }

  const ogImage = await buildSignedOgImageUrl(tag.name, env.OG_SIGNATURE);
  return { tag, posts, ogImage };
}

export default function BlogTag() {
  const { tag, posts } = useLoaderData<typeof loader>();

  return (
    <div className="w-full flex-shrink-0 flex-col lg:w-auto">
      <div className="max-w-reading mx-2 lg:mx-0">
        <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
          <Link to="/blog" className="as-link">
            Blog
          </Link>{" "}
          / {tag.name}
        </p>
        <h1 className="font-title mt-1 mb-3 text-5xl font-bold">{tag.name}</h1>
        <PostList posts={posts} />
      </div>
    </div>
  );
}
