import type { MetaFunction } from "react-router";
import Content from "~/components/content";
import { pageMeta } from "~/seo";

export const meta: MetaFunction = () =>
  pageMeta({
    title: "About Jakob Heuser - The CodeDrift",
    description:
      "Jakob Heuser is a co-founder of Taskless with 20+ years in software — Principal Engineer at LinkedIn, Director at Pinterest, and curriculum builder at Interview Kickstart. He writes about code and the people who build it.",
    path: "/about",
  });

export default function About() {
  return (
    <div className="w-full flex-shrink-0 flex-col lg:w-auto">
      <div className="max-w-reading mx-2 lg:mx-0">
        <h1 className="font-title mb-3 text-5xl font-bold">
          About Jakob Heuser
        </h1>
        <Content>
          <p>
            I&apos;m Jakob Heuser — a software engineer and engineering leader
            with more than 20 years of building behind me. I&apos;m currently a
            co-founder of{" "}
            <a href="https://taskless.io?ref=codedrift.com">Taskless</a>, where
            we&apos;re removing the risks of adopting third-party services.
          </p>
          <p>
            Along the way I was a Principal Engineer at LinkedIn, a Director at
            Pinterest, and helped build curriculum at the Interview Kickstart
            program. The messy part of building things is my happy place, and I
            write here about <a href="/blog/tag/code">code</a> and the{" "}
            <a href="/blog/tag/leadership">people</a> who build it. If
            there&apos;s a way I can help on your journey, see{" "}
            <a href="/help">how I&apos;m supporting others</a>, or find me{" "}
            <a href="/social">elsewhere on the web</a>.
          </p>
          <h2 id="colophon">Colophon</h2>
          <p>
            Code for codedrift &amp; code samples posted to codedrift are
            licensed under the{" "}
            <a href="https://github.com/jakobo/codedrift/blob/main/LICENSE-posts?ref=codedrift.com">
              MIT license
            </a>
            . Non-code content unless otherwise noted is licensed under the{" "}
            <a href="http://creativecommons.org/licenses/by-nc/4.0/?ref=codedrift.com">
              Creative Commons Attribution-NonCommercial 4.0 International
            </a>
            .
          </p>
          <hr />
          <p>
            This is the second revision of the codedrift project, and the 15th
            revision of Jakob&apos;s personal site. In the last iteration, I
            wanted to play with a chunky interface while simultaneously learning
            tailwind. In this revision, I sought to take elements of codedrift I
            felt mattered in the design aesthetic and strip as much as I could
            away.
          </p>
          <p>
            The guiding star for this design was a leather notebook where I take
            physical notes. As a lover of mechanical keyboards, digital
            notetaking would result in a horrible cacophony of clicks and
            clacks.
          </p>
          <p>Plus, I like pens.</p>
          <p>
            Most copy is set in{" "}
            <a href="https://fonts.google.com/specimen/Open+Sans?ref=codedrift.com">
              Open Sans Regular, SemiBold, and ExtraBold
            </a>{" "}
            with{" "}
            <a href="https://fonts.google.com/specimen/Roboto+Mono?ref=codedrift.com">
              Roboto Mono Light
            </a>{" "}
            for monospaced fonts. Titles are set in{" "}
            <a href="https://fonts.google.com/specimen/Work+Sans?ref=codedrift.com">
              Work Sans Light
            </a>
            . The{" "}
            <a href="https://tailwindcss.com/?ref=codedrift.com">
              Tailwind CSS
            </a>{" "}
            stone pallete drives the primary color scheme, with Emerald and
            Amber providing primary and secondary colors respectively.
          </p>
          <p>
            This began with{" "}
            <a href="https://codedrift.com/thunked/use-github-as-a-cms?ref=codedrift.com">
              GitHub as a CMS
            </a>
            , switched to Ghost, and now sits on React Router, because I&apos;m
            tired of building.
          </p>
          <p>We are only limited by the limits we place.</p>
          <h3 id="previous-versions">Previous Versions</h3>
          <p>
            As best I could, I&apos;ve retrieved old screenshots from the
            Wayback Machine, before this site was ever called codedrift. From
            &ldquo;mechanicalruins.net&rdquo; to Felocity (.org, then .com), to
            my own name, then to codedrift. I&apos;ll be restoring these as I
            find time.
          </p>
        </Content>
      </div>
    </div>
  );
}
