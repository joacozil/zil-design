## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Design system

`src/styles/global.css` is the single source of truth for breakpoints, the type
scale, and the section rhythm. Everything there is a token that already steps at
the breakpoints. **Change a value once in that file — never re-declare it at a
call site.** Each rule below exists because the thing it forbids already happened
and had to be undone.

### Breakpoints — only two

```
unprefixed = mobile   (< 640px)
tablet:    = ≥ 640px
desktop:   = ≥ 1024px
```

Tailwind's defaults (sm/md/lg/xl/2xl) are deliberately wiped in `@theme`. Do not
add a third breakpoint.

### Section rhythm — the spacing BETWEEN sections

CSS has no "gap between sections": the gap is always one section's bottom padding
plus the next one's top padding. The system makes that sum deliberate — **every
flow section owns HALF the gap.** It applies `py-section`, and the gap to its
neighbour is the sum of the two halves. Two standard sections therefore always
sit `2 × --spacing-section` apart, and neither has to know what the other does,
so sections can be reordered, added, or removed without retuning anything.

| token                     | class              | mobile | tablet | desktop |
| ------------------------- | ------------------ | ------ | ------ | ------- |
| `--spacing-section`       | `py-section`       | 80px   | 112px  | 128px   |
| `--spacing-section-tight` | `py-section-tight` | 40px   | 56px   | 64px    |

Standard gap between two flow sections: **160 / 224 / 256px**.

When building a new section:

- Apply `py-section` to the element that carries the section's vertical padding.
  This is the default — use it unless there is a specific reason not to.
- `py-section-tight` is exactly half, for a strip rather than a block (e.g. the
  client logo marquee). It is not a "this feels like a lot" escape hatch.
- **NEVER write `py-20 tablet:py-28 desktop:py-32`, or any responsive padding
  chain, on a section.** One unprefixed class, no breakpoint prefixes. Hand-rolled
  padding is exactly how the rhythm drifted to a 96–160px spread on mobile and a
  128–256px spread on desktop before these tokens existed.
- Do not put margins between sections. The rhythm is padding-only, so the gap
  stays the sum of two known halves.
- Keep the padding symmetric (`py-*`, not `pt-*` + `pb-*`) unless the section
  borders a pinned one — see below.

### Viewport-pinned sections are exempt

`Hero` and `HowWeWork` / `MetodoZil` fill `100svh` and centre their content, so
the space a neighbour sees is `(viewport − content) / 2` — set by the centring,
not by padding. **`py-section` does not apply to them.** Adding it would decentre
their content and change the neighbour's gap by nothing at all.

A section that borders a pinned one contributes **no padding on that side** and
lets the pinned stage own the space. `Statement.astro` is the only such case and
records the measured numbers in its header comment. Read that before touching its
spacing, and do not "fix" its missing `pb` — it is deliberate.

### Type scale

One semantic class per role: `text-h1`…`text-h5`, `text-p-lg`, `text-p`,
`text-p-sm`. Each already steps at both breakpoints.

**NEVER write inline chains like `text-2xl tablet:text-3xl`.** To retune, edit the
mobile base in `@theme` plus the two media-query blocks at the bottom of
`global.css`.

### Container

`mx-auto w-full max-w-8xl px-6 tablet:px-8 desktop:px-12`. Full-bleed elements
(e.g. the projects slider) use `var(--gutter)` as side padding so they start
aligned with normal content while running to the true screen edge — it must be
applied on a full-width element.

### Colour

Use the semantic aliases (`primary`, `primary-dark`, `primary-light`, `accent`,
`surface`, `text`, `muted`, `border`), never the raw palette names, so the site
stays re-themable from `global.css` alone.

### Hover

There is no hover on a touch device, so a hover that **moves or reveals**
something must be gated behind `desktop:` — `desktop:hover:*`,
`desktop:group-hover:*`. This covers every pill button: the label slide, the
arrow-circle reveal, and the padding growth that makes room for it.

Pure colour/border feedback (`hover:text-text`, `hover:border-primary`) stays
ungated — it costs nothing on touch.

### Motion — scroll entrances

`src/scripts/reveal.ts` is the single source of truth for entrance motion, the way
this file's tokens are for the type scale. **Every distance, duration, ease and
stagger lives there.** Sections opt in declaratively and carry no motion numbers:

```
data-reveal[="rise"|"rail"|"band"]   reveal this element (omit the value → rise)
data-reveal-group                    sequence this element's own [data-reveal]
                                     descendants off one trigger, in DOM order
data-reveal-delay="0.45"             extra seconds on top of its sequence slot
```

Groups nest — an element joins its **closest** group — so a section can sequence
its header and its body off their own scroll positions.

The concept is **dirección**: the page's own copy argues that communication
_con dirección clara_ impulsa el crecimiento, so nothing here fades in. Things
arrive along an axis and settle into register. The vocabulary is deliberately
tiny: `rise` does almost everything, and `rail` / `band` exist only because the
Projects track and the Statement thesis make an argument motion can state. **A
new variant needs that kind of reason** — a section wanting to feel different is
not one.

Three rules that are load-bearing, not preferences:

- **Never hard-code a hidden state in markup or CSS.** Only
  `html.reveal-armed [data-reveal]:not([data-revealed])` may hide anything, and the
  inline head script in `Layout.astro` is the **one** place that decides whether it
  applies. It withholds the class for no-JS, for reduced motion, and for a document
  hidden at load — GSAP's ticker is rAF-driven, so in a hidden document (background
  tab, headless renderer) tweens never advance and anything hidden stays hidden.
  Deciding this twice is how the page goes blank.
- **An element must reach `[data-revealed]` before its tween runs**, or the
  `clearProps` at the end drops it back to `opacity: 0`.
- **Reveal server-rendered markup, not hydrated markup.** Inside a `client:visible`
  island, declare `data-reveal` in the JSX and let the global engine drive it: a
  `useGSAP` hook cannot touch the DOM until hydration, which fires exactly when the
  island scrolls into view — i.e. after the reader has already seen it. And never
  put the attribute on an Embla `<li>`; Embla measures those, so use an inner
  wrapper (see `ProjectsSlider`).

Not every section gets one, and the two exceptions are deliberate — do not "finish
the job" by adding entrances to them. `Clients` is already a perpetual marquee, and
an entrance on top of perpetual motion is noise. The `Footer` arrives settled: it is
the page signing off, and chrome should not ask for attention the CTA just spent.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
