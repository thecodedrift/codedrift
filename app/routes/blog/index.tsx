import { Link, useLoaderData, type MetaFunction } from "react-router";

import type { Route } from "./+types/index";
import { cloudflareEnvironmentContext } from "~/context";
import { getSanityClient } from "~/sanity/client";
import { POST_INDEX_QUERY } from "~/sanity/queries";

export const meta: MetaFunction = () => [
  { title: "Blog — The CodeDrift" },
  { name: "description", content: "Long-form writing by Jakob Heuser." },
];

interface TagReference {
  _id: string;
  name: string;
  slug: { current: string };
}

interface PostListEntry {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  tags?: TagReference[];
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvironmentContext);
  const client = getSanityClient({ env });
  const posts = await client.fetch<PostListEntry[]>(POST_INDEX_QUERY);
  return { posts };
}

export default function BlogIndex() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="w-full flex-shrink-0 flex-col lg:w-auto">
      <div className="max-w-reading mx-2 lg:mx-0">
        <h1 className="font-title mb-3 text-5xl font-bold">Blog</h1>
        {posts.length === 0 ? (
          <p className="font-sans text-lg text-gray-600 dark:text-gray-400">
            Nothing here yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-300 dark:divide-gray-700">
            {posts.map((post) => (
              <li key={post._id}>
                <Link
                  to={`/blog/${post.slug.current}`}
                  className="group block py-6"
                >
                  <time
                    dateTime={post.publishedAt}
                    className="font-mono text-sm text-gray-500 dark:text-gray-400"
                  >
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="font-title group-hover:text-primary-700 dark:group-hover:text-primary-400 mt-1 text-2xl font-semibold">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-1 line-clamp-2 font-sans text-base text-gray-600 dark:text-gray-300">
                      {post.excerpt}
                    </p>
                  ) : undefined}
                  {post.tags && post.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
