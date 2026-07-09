import {
  PortableText as PortableTextRoot,
  type PortableTextComponents,
  type PortableTextReactComponents,
} from "@portabletext/react";
import { createImageUrlBuilder } from "@sanity/image-url";
import { Highlight, themes } from "prism-react-renderer";

export interface ImageConfig {
  projectId: string;
  dataset: string;
}

interface PortableTextProperties {
  value: unknown;
  imageConfig: ImageConfig;
}

interface CodeBlock {
  _type: "code";
  language?: string;
  code: string;
  filename?: string;
}

interface SanityImageBlock {
  _type: "image";
  alt?: string;
  asset?: { _ref?: string };
}

function makeComponents(
  imageConfig: ImageConfig,
): Partial<PortableTextReactComponents> {
  const builder = createImageUrlBuilder(imageConfig);

  const components: PortableTextComponents = {
    types: {
      image: ({ value }: { value: SanityImageBlock }) => {
        if (!value?.asset?._ref) return <></>;
        const source = builder.image(value).width(1200).auto("format").url();
        return (
          <img
            src={source}
            alt={value.alt ?? ""}
            loading="lazy"
            className="rounded-md"
          />
        );
      },
      code: ({ value }: { value: CodeBlock }) => (
        <Highlight
          code={value.code ?? ""}
          language={value.language ?? "tsx"}
          theme={themes.vsDark}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} overflow-x-auto rounded-md p-4 text-sm`}
              style={style}
            >
              {value.filename ? (
                <div className="mb-2 text-xs text-gray-400">
                  {value.filename}
                </div>
              ) : undefined}
              {tokens.map((line, index) => (
                <div key={index} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      ),
    },
    marks: {
      link: ({ value, children }) => {
        const link = value as { href?: string } | undefined;
        const href = link?.href ?? "";
        const isExternal = /^https?:\/\//i.test(href);
        return (
          <a
            href={href}
            {...(isExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {children}
          </a>
        );
      },
    },
    unknownType: () => <></>,
    unknownMark: ({ children }) => <>{children}</>,
    unknownBlockStyle: ({ children }) => <p>{children}</p>,
  };

  return components;
}

export function PortableText({ value, imageConfig }: PortableTextProperties) {
  if (!value) return <></>;
  return (
    <PortableTextRoot value={value} components={makeComponents(imageConfig)} />
  );
}
