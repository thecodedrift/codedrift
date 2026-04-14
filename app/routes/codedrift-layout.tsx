import { Outlet } from "react-router";
import { useTheme, Theme } from "remix-themes";
import ChevronLeft from "~/components/icons/chevron-left";
import ChevronRight from "~/components/icons/chevron-right";
import Chat from "~/components/icons/chat";
import Heart from "~/components/icons/heart";
import Sun from "~/components/icons/sun";
import Moon from "~/components/icons/moon";

export default function CodedriftLayout() {
  const [theme, setTheme] = useTheme();
  const year = new Date().getFullYear();

  return (
    <div
      id="content"
      className="flex h-screen max-w-full min-w-full flex-col items-start"
    >
      <div className="h-6 w-full flex-shrink-0 bg-gray-600 dark:bg-gray-700" />
      <header className="max-w-limit flex w-full flex-row px-4">
        <a href="#content" className="sr-only" id="top">
          Skip Navigation
        </a>
        <a
          href="/"
          className="as-link flex h-[40px] flex-row items-center pt-2"
        >
          <ChevronLeft className="h-[30px] w-[30px] text-current" />
          <ChevronRight className="mt-[10px] ml-[-17px] h-[30px] w-[30px] text-current" />
          <span className="mt-[7px] ml-[-5px] hidden md:block">
            <span className="float-left font-semibold">code</span>
            <span className="float-left brightness-50 dark:brightness-75">
              drift
            </span>
          </span>
        </a>

        <nav className="flex flex-grow flex-row items-center justify-end space-x-2 self-end">
          <a
            href="https://github.com/thecodedrift/codedrift/discussions/categories/thunked?discussions_q=is%3Aopen+category%3AThunked+sort%3Adate_created"
            className="as-link"
            title="Longer writing and thoughts"
          >
            writing
          </a>
          <a href="/talks" className="as-link" title="Talks and Speaking">
            talks
          </a>
          <a
            href="https://github.com/thecodedrift/codedrift/discussions/categories/til?discussions_q=is%3Aopen+sort%3Adate_created+category%3ATIL"
            className="as-link"
            title="Today I Learned..."
          >
            til
          </a>
          <a
            href="https://github.com/jakobo/codedrift/discussions/categories/ask-me-anything-ama"
            className="as-link"
            title="Ask me Anything"
          >
            ama
          </a>
          <a href="/social" title="My presence on the social web">
            <Chat className="as-link h-6 w-6" />
          </a>
          <a href="/help" title="Investing, mentoring, and more">
            <Heart className="as-link h-6 w-6" />
          </a>
          <button
            type="button"
            className="cursor-pointer"
            onClick={() =>
              setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)
            }
          >
            <Sun className="hidden h-6 w-6 text-gray-500 hover:text-gray-700 dark:block dark:hover:text-gray-300" />
            <Moon className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:hidden dark:hover:text-gray-300" />
          </button>
        </nav>
      </header>
      <main className="max-w-limit w-full flex-grow p-4 pt-12" id="main">
        <Outlet />
      </main>
      <footer className="bg-leather-stone-700 dark:bg-leather-stone-700 mt-8 h-20 w-full bg-gray-700 dark:bg-gray-800">
        <div className="max-w-limit flex flex-row items-center p-4 text-sm text-gray-100 dark:text-gray-200">
          <div className="w-1/4">&lt;/&gt;</div>
          <div className="flex-grow text-center">
            <a
              className="border-b border-dotted border-gray-500 hover:text-gray-300"
              href="#top"
            >
              top
            </a>
          </div>
          <div className="w-1/4 text-right">
            <a
              href="/about"
              className="border-b border-dotted border-gray-500 hover:text-gray-300"
            >
              &copy; {year} Jakob Heuser
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
