import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  {
    // zil-landing is the reference-only parent site; .claude / .impeccable are
    // vendored tooling. Never lint any of them here.
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      "public/",
      ".claude/",
      ".impeccable/",
      "zil-landing/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  // React islands (.tsx)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // Node-context config files
  {
    files: ["*.config.{js,mjs}", "*.config.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Turn off any rules that conflict with Prettier (keep last).
  prettier,
);
