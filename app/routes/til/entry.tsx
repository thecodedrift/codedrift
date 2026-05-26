import { data, useLoaderData } from "react-router";

import type { Route } from "./+types/entry";
import Content from "~/components/content";
import { PortableText, type ImageConfig } from "~/components/portable-text";
import { cloudflareEnvironmentContext } from "~/context";
import { getSanityClient } from "~/sanity/client";
import { TIL_BY_SLUG_QUERY } from "~/sanity/queries";
import { buildSignedOgImageUrl } from "~/og";
import { SITE, pageMeta } from "~/seo";

interface PortableBlock {
  _type: string;
  children?: { text?: string }[];
}

/** Plain-text summary from the first text blocks of a Portable Text body. */
function excerptFromBody(body: unknown[], max = 160): string {
  const text = (body as PortableBlock[])
    .filter((block) => block?._type === "block")
    .map((block) => (block.children ?? []).map((c) => c.text ?? "").join(""))
    .join(" ")
    .replaceAll(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

interface TagReference {
  _id: string;
  name: string;
  slug: { current: string };
}

interface HowToStep {
  name?: string;
  text: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface TilEntry {
  _id: string;
  _updatedAt?: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  body: unknown[];
  howToSteps?: HowToStep[];
  faq?: FaqItem[];
  tags?: TagReference[];
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Not Found — The CodeDrift" }];
  const { til } = loaderData;
  const bodyExcerpt = excerptFromBody(til.body);
  const description =
    bodyExcerpt.length > 0
      ? bodyExcerpt
      : `${til.title} — a quick note (TIL) by ${SITE.author}.`;

  const descriptors = pageMeta({
    title: `${til.title} — TIL — The CodeDrift`,
    description,
    path: `/til/${til.slug.current}`,
    image: loaderData.ogImage,
    type: "article",
  });

  // Structured data is emitted only when the author supplied the matching
  // visible content, keeping markup and page in sync (Google's requirement).
  if (til.howToSteps && til.howToSteps.length > 0) {
    descriptors.push({
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: til.title,
        step: til.howToSteps.map((howToStep, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          ...(howToStep.name ? { name: howToStep.name } : {}),
          text: howToStep.text,
        })),
      },
    });
  }
  if (til.faq && til.faq.length > 0) {
    descriptors.push({
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: til.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    });
  }

  return descriptors;
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvironmentContext);
  const client = getSanityClient({ env });
  const til = await client.fetch<TilEntry | null>(TIL_BY_SLUG_QUERY, {
    slug: params.slug,
  });

  if (!til) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router idiom: throwing a `data()` response surfaces as a 404 to the framework.
    throw data(undefined, { status: 404 });
  }

  const imageConfig: ImageConfig = {
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
  };

  // Don't let a signing/runtime failure 500 the TIL page; fall back to the
  // static default share image and surface the error for observability.
  let ogImage: string | undefined;
  try {
    ogImage = await buildSignedOgImageUrl(til.title, env.OG_SIGNATURE);
  } catch (error) {
    console.error(
      "buildSignedOgImageUrl failed for til",
      til.slug.current,
      error,
    );
  }
  return { til, imageConfig, ogImage };
}

export default function TilEntry() {
  const { til, imageConfig } = useLoaderData<typeof loader>();

  return (
    <div className="w-full flex-shrink-0 flex-col lg:w-auto">
      <div className="max-w-reading mx-2 lg:mx-0">
        <header className="mb-4">
          <time
            dateTime={til.publishedAt}
            className="font-mono text-sm text-gray-500 dark:text-gray-400"
          >
            {new Date(til.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="font-title mt-1 text-3xl font-bold">{til.title}</h1>
          {til.tags && til.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {til.tags.map((tag) => (
                <span
                  key={tag._id}
                  className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : undefined}
        </header>

        <Content>
          <PortableText value={til.body} imageConfig={imageConfig} />

          {til.howToSteps && til.howToSteps.length > 0 ? (
            <>
              <h2>Steps</h2>
              <ol>
                {til.howToSteps.map((step, index) => (
                  <li key={index}>
                    {step.name ? <strong>{step.name}: </strong> : undefined}
                    {step.text}
                  </li>
                ))}
              </ol>
            </>
          ) : undefined}

          {til.faq && til.faq.length > 0 ? (
            <>
              <h2>FAQ</h2>
              <dl>
                {til.faq.map((item, index) => (
                  <div key={index}>
                    <dt>
                      <strong>{item.question}</strong>
                    </dt>
                    <dd>{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : undefined}
        </Content>
      </div>
    </div>
  );
}
