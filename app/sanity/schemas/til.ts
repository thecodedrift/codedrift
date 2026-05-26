import { defineArrayMember, defineField, defineType } from "sanity";

export const til = defineType({
  name: "til",
  title: "TIL",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      description:
        "TILs without a publishedAt value are hidden from /til and return 404 on /til/:slug.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        }),
        defineArrayMember({ type: "code", options: { withFilename: true } }),
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })],
    }),
    defineField({
      name: "howToSteps",
      title: "How-to steps",
      description:
        "Optional. When set, the entry renders a numbered step list and emits HowTo structured data. Use only when the steps are genuinely the page's how-to content.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            { name: "name", title: "Step name (optional)", type: "string" },
            {
              name: "text",
              title: "Step text",
              type: "text",
              rows: 2,
              validation: (rule) => rule.required(),
            },
          ],
          preview: { select: { title: "name", subtitle: "text" } },
        }),
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      description:
        "Optional. When set, the entry renders a Q&A list and emits FAQPage structured data. Each answer must match the displayed text.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            {
              name: "question",
              title: "Question",
              type: "string",
              validation: (rule) => rule.required(),
            },
            {
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            },
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt" },
  },
  orderings: [
    {
      title: "Published at, newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
