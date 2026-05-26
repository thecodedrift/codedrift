import { Link, type MetaFunction } from "react-router";
import { pageMeta } from "~/seo";

export const meta: MetaFunction = () =>
  pageMeta({
    title: "The CodeDrift - Jakob Heuser",
    description:
      "Jakob Heuser — co-founder of Taskless. Writing about code and the people who build it.",
    path: "/",
  });

export default function Home() {
  return (
    <div className="w-full flex-shrink-0 flex-col lg:w-auto">
      <div className="max-w-reading mx-2 lg:mx-0">
        <h1 className="font-title mb-3 text-6xl">Hey 👋🏼, I&rsquo;m Jakob</h1>
        <p className="font-sans text-2xl">
          I&lsquo;m a co-founder of{" "}
          <a href="https://taskless.io" className="as-link">
            Taskless
          </a>
          , removing the risks associated with adopting third party services.
        </p>
        <p className="mt-3 mb-6 font-sans text-2xl">
          The messy part of building things is my happy place. Ocassionally, I
          write about{" "}
          <Link to="/blog/tag/code" className="as-link">
            code
          </Link>{" "}
          and the{" "}
          <Link to="/blog/tag/leadership" className="as-link">
            people
          </Link>{" "}
          who build it.
        </p>
      </div>
    </div>
  );
}
