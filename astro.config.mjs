// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // React is used ONLY for genuinely interactive islands, never static markup.
  integrations: [react()],
  vite: {
    // Tailwind v4 via the official Vite plugin (the @astrojs/tailwind
    // integration is legacy/Tailwind-3 only).
    plugins: [tailwindcss()],
  },
});
