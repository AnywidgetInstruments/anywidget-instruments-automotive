import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

// No dynamic code evaluation and no HTML injection from trait data, as in
// anywidget-instruments: a label or a function name is text, never markup.
const security = {
  "no-eval": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",
  "no-restricted-properties": [
    "error",
    { property: "innerHTML", message: "Use textContent / DOM APIs." },
    { property: "outerHTML", message: "Use textContent / DOM APIs." },
    { property: "insertAdjacentHTML", message: "Use DOM APIs." },
    { object: "document", property: "write", message: "Use DOM APIs." },
  ],
};

export default [
  { ignores: ["src/**", "node_modules/**", "js/src/generated/**", "site/**"] },
  js.configs.recommended,
  {
    files: ["js/**/*.js", "js/**/*.mjs", "e2e/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.browser } },
    rules: { ...security, "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }] },
  },
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: ["js/**/*.ts"] })),
  {
    files: ["js/**/*.ts"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.browser } },
    rules: {
      ...security,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // the AFM model is untyped at the host boundary
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  { files: ["js/test/**/*.js", "js/test/**/*.ts", "js/build.mjs", "js/scripts/**/*.mjs", "e2e/**/*.js", "*.config.js"], languageOptions: { globals: { ...globals.node } } },
];
