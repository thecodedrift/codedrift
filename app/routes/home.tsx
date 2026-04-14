import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "The CodeDrift - Jakob Heuser" },
];

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
          <a
            href="https://github.com/thecodedrift/codedrift/discussions/categories/thunked?discussions_q=is%3Aopen+category%3AThunked+label%3A%22%F0%9F%93%9A+Code%22"
            className="as-link"
          >
            code
          </a>{" "}
          and the{" "}
          <a
            href="https://github.com/thecodedrift/codedrift/discussions/categories/thunked?discussions_q=is%3Aopen+category%3AThunked+label%3A%22%F0%9F%93%9A+Leadership%22"
            className="as-link"
          >
            people
          </a>{" "}
          who build it.
        </p>
      </div>
    </div>
  );
}
