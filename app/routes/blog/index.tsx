import { useLoaderData, type MetaFunction } from "react-router";

import type { Route } from "./+types/index";
import PostList, { type PostListEntry } from "~/components/post-list";
import { cloudflareEnvironmentContext } from "~/context";
import { getSanityClient } from "~/sanity/client";
import { POST_INDEX_QUERY } from "~/sanity/queries";

export const meta: MetaFunction = () => [
  { title: "Blog — The CodeDrift" },
  { name: "description", content: "Long-form writing by Jakob Heuser." },
];

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
        <PostList posts={posts} />
      </div>
    </div>
  );
}
