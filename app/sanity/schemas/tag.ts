import { defineField, defineType } from "sanity";

export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      description:
        "Describes the type of tag this is, with categories sorted first. Eras denote specific periods of time or employment",
      options: {
        list: [
          { title: "Category (top-level, sorts first)", value: "category" },
          { title: "Topic", value: "topic" },
          { title: "Era", value: "era" },
        ],
        layout: "radio",
      },
      initialValue: "topic",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "type" },
  },
});
