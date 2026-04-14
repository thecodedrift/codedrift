// syncpack commands
const syncpack = {
  listMismatches: () => "syncpack list-mismatches",
  format: () => "syncpack format",
};

const config = {
  // prettier formatting only
  "*.(md|json|graphql)": "prettier --write",

  // package.json formatting
  "./package.json": [
    syncpack.listMismatches,
    syncpack.format,
    "prettier --write",
  ],

  // source files (function form to quote paths containing $)
  "*.{js,jsx,ts,tsx}": [
    (filenames) => `eslint --fix ${filenames.map((f) => `'${f}'`).join(" ")}`,
    (filenames) =>
      `prettier --write ${filenames.map((f) => `'${f}'`).join(" ")}`,
  ],
};

export default config;
