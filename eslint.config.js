import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".wrangler/",
      "tmp/",
      "*.config.js",
      ".lintstagedrc.js",
      ".react-router/",
      "**/eslint.config.js",
      "**/worker-configuration.d.ts",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  unicorn.configs["flat/recommended"],
  prettierConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Ban /// <reference /> directives in source files
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": [
        "error",
        { path: "never", types: "never", lib: "never" },
      ],
    },
  },
  // TypeScript-specific rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "unicorn/prevent-abbreviations": [
        "error",
        {
          allowList: {
            env: true,
            ctx: true,
            args: true,
            props: true,
            utils: true,
          },
        },
      ],
    },
  },
  // File naming conventions - enforce kebab-case
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: [
            // React Router convention files
            "^_.*\\.tsx$",
            "^\\$\\.tsx$",
            ".*\\.server\\.(ts|tsx)$",
          ],
        },
      ],
      "unicorn/numeric-separators-style": "off",
      "unicorn/import-style": [
        "error",
        {
          styles: {
            "node:path": {
              default: false,
            },
          },
        },
      ],
    },
  },
);
