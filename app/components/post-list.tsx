import { Link } from "react-router";

export interface TagReference {
  _id: string;
  name: string;
  slug: { current: string };
}

export interface PostListEntry {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  tags?: TagReference[];
}

interface PostListProperties {
  posts: PostListEntry[];
  emptyMessage?: string;
}

export default function PostList({
  posts,
  emptyMessage = "Nothing here yet.",
}: PostListProperties) {
  if (posts.length === 0) {
    return (
      <p className="font-sans text-lg text-gray-600 dark:text-gray-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-300 dark:divide-gray-700">
      {posts.map((post) => (
        <li key={post._id}>
          <Link to={`/blog/${post.slug.current}`} className="group block py-6">
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
  );
}
