import type { MetaFunction } from "react-router";
import Content from "~/components/content";
import { pageMeta } from "~/seo";

export const meta: MetaFunction = () =>
  pageMeta({
    title: "Here to Help - The CodeDrift - Jakob Heuser",
    description:
      "How Jakob Heuser supports others — warm introductions, investing in developer tooling, advising, interview prep, and mentoring.",
    path: "/help",
  });

export default function Help() {
  return (
    <div className="w-full flex-shrink-0 flex-col lg:w-auto">
      <div className="max-w-reading mx-2 lg:mx-0">
        <h1 className="font-title mb-3 text-5xl font-bold">Here to Help</h1>
        <Content>
          <p>I believe we make progress together.</p>
          <p>
            Over the years, I&apos;ve responded in an ad-hoc manner to requests
            for help both inside and outside of my network. Requests ranged from
            interview preparation to networking to funding. The answer to these
            all is &ldquo;yes, if I can&rdquo;. This page is updated with how
            I&apos;m currently supporting others on their journey. You may
            always reach out to jakob [at] this domain about any of these items.
          </p>
          <h2 id="a-specific-note-for-underrepresented-groups">
            A Specific Note for Underrepresented Groups
          </h2>
          <p>
            Anything in this document is doubly true for underrepresented groups
            in STEM. Inbound requests for support from you will be given
            priority, and if you need a warm introduction to someone in my
            network, I&apos;m happy to connect you.
          </p>
          <h2 id="network">Network</h2>
          <p>
            My{" "}
            <a href="https://www.linkedin.com/in/jakobheuser/?ref=codedrift.com">
              LinkedIn Network
            </a>{" "}
            represents about 20 years working in the technology industry. I am
            able to introduce you to anyone in my network as a warm
            introduction. To do this, please provide me with a brief summary
            about who you are and what you need so that I can pass this along to
            the individual. All introductions require opt-in from both parties.
            I will let you know if for whatever reason I cannot make the
            introduction.
          </p>
          <h2 id="investing">Investing</h2>
          <p>
            I invest primarily in founders focused on developer tooling. My
            check size is usually under $7500, and I do not operate as a lead
            investor. When exploring new opportunities, I prioritize
            underrepresented founders to ensure they have a voice in building
            the tools that make us all more productive and successful.
          </p>
          <h2 id="advising">Advising</h2>
          <p>
            I advise for startups with unique and challenging technical
            problems. With the bulk of my experience in node.js stacks and
            frontend code, I am more valuable to companies that do not currently
            consider their DevOps a competitive advantage. I prefer to invest if
            I am going to advise, but also know that this isn&apos;t always
            feasible for companies. In the past, I have done architecture
            reviews, made connections, assisted with hiring, and have rolled up
            my sleeves to trace down memory leaks.
          </p>
          <h2 id="interview-prep">Interview Prep</h2>
          <p>
            Tech interviews suck. I offer interview preparation including resume
            review and mock interviews on an ad-hoc basis. I pull from my
            experience as a Principal Engineer at LinkedIn, Director at
            Pinterest, and my time building curriculum at the Interview
            Kickstart program when helping people prepare for their next role.
          </p>
          <h2 id="mentoring">Mentoring</h2>
          <p>
            I do structured mentoring with a meeting once a month over a three
            or six month period. In the past, these sessions focused on skill
            development and career path discussions. I have helped individuals
            transition from code-centric careers to leadership roles as well as
            in the opposite direction.
          </p>
        </Content>
      </div>
    </div>
  );
}
