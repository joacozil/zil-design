/** @type {import("prettier").Config} */
export default {
  // prettier-plugin-tailwindcss MUST be last so class sorting runs after the
  // other plugins have parsed the file.
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  // Point the Tailwind class-sorter at our v4 stylesheet so it knows our custom
  // theme (breakpoints, semantic colors) when ordering classes.
  tailwindStylesheet: "./src/styles/global.css",
  overrides: [
    {
      files: "*.astro",
      options: { parser: "astro" },
    },
  ],
};
