# Zil Design — Landing Page

Marketing landing page for **Zil Design**, a strategic design agency under the
Zil parent company. This site is fully independent from the main Zil site — it
shares only the **font family** (Circular) and the **logo mark** (recolored
violet). Everything else is its own design system, driven by our Figma.

Built with **Astro + React (islands) + Tailwind CSS v4 + TypeScript**.

## Getting started

```sh
npm install       # install dependencies
npm run dev       # start the dev server at http://localhost:4321
```

> Per project convention, prefer running the dev server in background mode:
> `astro dev --background` (manage with `astro dev stop` / `status` / `logs`).

### All commands

| Command                | Action                                                  |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Start the local dev server (`localhost:4321`)           |
| `npm run build`        | Build the production site to `./dist/`                  |
| `npm run preview`      | Preview the production build locally                    |
| `npm run check`        | Type-check `.astro` / `.ts` / `.tsx` with `astro check` |
| `npm run lint`         | Lint with ESLint                                        |
| `npm run format`       | Format the codebase with Prettier                       |
| `npm run format:check` | Verify formatting without writing                       |

## Responsive system — the core constraint

There are exactly **three layouts** controlled by exactly **two breakpoints**.
Layout may change **only** at these two points, nowhere else. Do not introduce
any intermediate breakpoint.

| Layout      | Width            | Tailwind prefix       |
| ----------- | ---------------- | --------------------- |
| **Mobile**  | `< 640px`        | _(unprefixed / base)_ |
| **Tablet**  | `640px – 1023px` | `tablet:`             |
| **Desktop** | `≥ 1024px`       | `desktop:`            |

This is **mobile-first**: unprefixed classes are the mobile base, `tablet:`
applies at ≥640px, `desktop:` applies at ≥1024px.

All of Tailwind's default breakpoints (`sm` `md` `lg` `xl` `2xl`) have been
**removed** in [`src/styles/global.css`](src/styles/global.css) so that only
`tablet` and `desktop` exist — this is enforced at the config level, not by
convention:

```css
@theme {
  --breakpoint-*: initial; /* wipe all defaults */
  --breakpoint-tablet: 640px;
  --breakpoint-desktop: 1024px;
}
```

## Design tokens

All tokens live in a single source of truth:
[`src/styles/global.css`](src/styles/global.css), inside the `@theme` block.
Change a value once there and it propagates everywhere via Tailwind utilities
and CSS variables.

- **Raw palette** — the literal Figma brand values (`--color-violet`,
  `--color-lime`, …). Edit hex here.
- **Semantic aliases** — what components should actually use (`primary`,
  `primary-dark`, `primary-light`, `accent`, `surface`, `surface-inverse`,
  `text`, `text-inverse`, `muted`, `border`). These map onto the raw palette, so
  the whole site can be re-themed by remapping aliases without touching a single
  component.

Use semantic utilities in markup (`bg-primary`, `text-text`, `bg-accent`, …),
**not** the raw names. Radii and shadows are tokenized too. Anything not yet
finalized in Figma is marked with a `TODO: confirm from Figma` comment.

### Current palette

| Token              | Value                                    |
| ------------------ | ---------------------------------------- |
| `primary` (violet) | `#9747FF`                                |
| `primary-dark`     | `#4B256E`                                |
| `primary-light`    | `#E7D5FF`                                |
| `accent` (lime)    | `#C2FE2D`                                |
| white / black      | `#FFFFFF` / `#000000`                    |
| `muted` / `border` | placeholder — _TODO: confirm from Figma_ |

## Fonts & logo

- **Circular** is self-hosted from [`public/fonts/`](public/fonts) (weights
  400 / 500 / 700 / 900, `woff2` with `woff` fallback), declared via
  `@font-face` in `global.css` and exposed as `--font-sans`. Shared with the
  parent Zil brand.
- The **logo** lives at [`src/assets/logo.svg`](src/assets/logo.svg) — the Zil
  mark recolored to Zil Design violet (`#9747FF`).

## Project structure

```
src/
  layouts/Layout.astro          Base HTML shell (loads global.css + fonts)
  components/
    astro/                      Static, non-interactive .astro components
    react/                      Interactive React islands (.tsx) — hydrated only
  sections/                     One file per page section (filled in over time)
  pages/index.astro             The landing page shell
  styles/global.css             Tailwind import, @theme tokens, breakpoints, fonts
  assets/logo.svg               Recolored Zil Design logo
public/fonts/                   Self-hosted Circular font files
```

**React is used only for genuinely interactive/complex components** (as Astro
islands), never for static markup — static content stays in `.astro`.

## Section-by-section workflow

Setup is intentionally minimal. Real work happens **one section at a time**:

1. You provide the Figma layout + specs for a section.
2. It's implemented responsively across mobile / tablet / desktop using **only**
   the two breakpoints, following the design tokens and the `impeccable` design
   skill.
3. Any missing values are asked for, not guessed.

### Throwaway test block

[`src/pages/index.astro`](src/pages/index.astro) currently contains a **throwaway
breakpoint test block** (labeled in a comment) that shows `MOBILE` / `TABLET` /
`DESKTOP` and swaps background color at each breakpoint, plus a small React
island to confirm hydration. **Delete it before building the first real
section.**
