import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Jakob Elsewhere on the Web - The CodeDrift - Jakob Heuser" },
];

export default function Social() {
  return (
    <div className="w-full flex-shrink-0 flex-col lg:w-auto">
      <div className="max-w-reading mx-2 lg:mx-0">
        <h1 className="font-title mb-3 text-5xl font-bold">
          Elsewhere on the Web
        </h1>
        <article className="prose dark:prose-invert">
          <p>
            I&apos;m on a few other websites, in case one website wasn&apos;t
            enough. There&apos;s a lot of internet out there; looking forward to
            meeting you digitally.
          </p>
          <h2>Active Profiles</h2>
          <ul>
            <li>
              <a href="https://www.twitch.tv/theCodeDrift?ref=codedrift.com">
                Twitch
              </a>{" "}
              as theCodeDrift
            </li>
            <li>
              <a href="https://www.threads.net/@codedrift.social?ref=codedrift.com">
                Threads
              </a>{" "}
              &amp;{" "}
              <a href="https://www.instagram.com/codedrift.social/">
                Instagram
              </a>{" "}
              as codedrift.social
            </li>
            <li>
              <a href="https://bsky.app/profile/codedrift.social?ref=codedrift.com">
                Bluesky
              </a>{" "}
              as @codedrift.social
            </li>
            <li>
              <a href="https://github.com/theCodeDrift?ref=codedrift.com">
                GitHub
              </a>{" "}
              as theCodeDrift
            </li>
            <li>
              <a href="https://www.reddit.com/user/theCodeDrift?ref=codedrift.com">
                Reddit
              </a>{" "}
              as theCodeDrift
            </li>
          </ul>

          <h2>Inactive Profiles</h2>
          <ul>
            <li>
              <a href="https://hachyderm.io/@jakobo?ref=codedrift.com">
                Mastodon @ Hacyderm
              </a>{" "}
              as @jakobo@hachyderm.io
            </li>
            <li>
              <a href="https://x.com/jakobo?ref=codedrift.com">X / Twitter</a>{" "}
              as @jakobo
            </li>
            <li>
              <a href="https://www.linkedin.com/in/jakobheuser/?ref=codedrift.com">
                LinkedIn
              </a>{" "}
              as Jakob Heuser
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
