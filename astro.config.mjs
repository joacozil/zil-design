// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // The site is published at zil.global/design, proxied to this Pages project by
  // zil-landing's functions/design/[[path]].js. Every asset URL must carry that
  // prefix or the browser resolves it against zil.global's root, where the Next
  // app answers 404 and the page loads with no CSS and no JS.
  //
  // This MUST live here rather than as an `astro build --base` flag in the
  // Cloudflare build command: a flag in the dashboard is invisible to the repo,
  // so a local build and a deployed build silently disagree — which is exactly
  // how this drifted. Keep it in sync with the prefix that Function strips.
  base: "/design",
  // React is used ONLY for genuinely interactive islands, never static markup.
  integrations: [react()],
  vite: {
    // Tailwind v4 via the official Vite plugin (the @astrojs/tailwind
    // integration is legacy/Tailwind-3 only).
    plugins: [tailwindcss()],
  },
});
