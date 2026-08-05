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
  // The public origin. `base` says where under it we live, this says which host —
  // together they give Astro.site + Astro.url.pathname, which is how Layout builds
  // a canonical per page instead of hard-coding one URL for all of them.
  site: "https://zil.global",
  // Every internal link ends in a slash, and that is load-bearing, not cosmetic.
  //
  // Pages Functions proxy this project under /design (zil-landing's
  // functions/design/[[path]].js), stripping the prefix before fetching upstream.
  // A link to /design/proyectos/clojure therefore asks the upstream for
  // /proyectos/clojure, which answers 308 → Location: /proyectos/clojure/ — a
  // path relative to the UPSTREAM root, with no /design in it. The browser
  // resolves that against zil.global and lands on a 404. Every project card hit
  // exactly this.
  //
  // Emitting the slash ourselves means the upstream never has to redirect, so the
  // prefix is never at risk. "always" also makes `astro dev` reject the
  // slash-less form, which turns this from a production-only failure into one
  // that shows up locally.
  trailingSlash: "always",
  // React is used ONLY for genuinely interactive islands, never static markup.
  integrations: [react()],
  vite: {
    // Tailwind v4 via the official Vite plugin (the @astrojs/tailwind
    // integration is legacy/Tailwind-3 only).
    plugins: [tailwindcss()],
  },
});
