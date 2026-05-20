import { codeInput } from "@sanity/code-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./app/sanity/schemas";

export default defineConfig({
  name: "codedrift",
  title: "Codedrift",
  projectId: "6ar8m1y8",
  dataset: "production",
  basePath: "/_/studio",
  plugins: [structureTool(), codeInput(), visionTool()],
  schema: { types: schemaTypes },
});
