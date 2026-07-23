import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Mobile browsers fire `resize` every time the URL bar slides away mid-scroll —
// which is constantly, right as this section is being read. Each one would
// otherwise cost a full ScrollTrigger.refresh() (re-measure every trigger, and
// jump the scroller to 0 and back), which is where the reader felt the lag and
// the flicker. A resize that only changes height on a touch device is the URL
// bar, never a real layout change, so it is safe to ignore: our measurements are
// svh-based and don't move with it. Rotation still changes width, so that
// refreshes normally.
ScrollTrigger.config({ ignoreMobileResize: true });

/* ---------------------------------------------------------------------------
   Geometry — the ZIL mark reconstructed on a clean integer grid so every edge
   is exact and every state registers pixel-perfectly.

     · bar thickness      T = 68
     · diagonal run       s = 54   (horizontal shift of the z diagonal over T)
     · short glyphs (z,i) = 2T tall, top at y = 34 (½T), baseline y = 170
     · ascender  (l)      = 2·5T tall, top at y = 0
     · midline            y = 102   (34 + T)
     · x-slots            z [0–122]   i [138–206]   l [234–302]

   The viewBox is padded 8u on every side so the corner nodes never clip.
   --------------------------------------------------------------------------- */

// FILL geometry (states 2 & 3). The z is two equal-weight bars joined by a
// diagonal band; its two diagonal edges are exactly parallel (run s/T). Because
// the two bars overlap through the midline, the filled form is solid there.
const LETTERS = [
  "M8 34 L122 34 L68 102 L114 102 L114 170 L0 170 L54 102 L8 102 Z", // z
  "M138 34 H206 V170 H138 Z", // i
  "M234 0 H302 V170 H234 Z", // l
];

// STROKE geometry (state 1 wireframe). Same two-trapezoid outline as the fill,
// but with a short bridge segment (54,102)→(68,102) added so the midline reads
// as ONE continuous horizontal — the diagonal keeps its two-edge jog and simply
// crosses over it. (The bare fill outline omits that span as solid interior.)
// The 6 corners carry nodes; the two diagonal junctions stay bare. i / l match
// their fills.
const STROKES = [
  "M8 34 L122 34 L68 102 L114 102 L114 170 L0 170 L54 102 L8 102 Z M54 102 L68 102", // z + midline bridge
  LETTERS[1],
  LETTERS[2],
];

// The fill colour — primary violet, shared by the outline and every fill so the
// whole mark reads as ONE tone progressing.
const FILL = "var(--color-primary)";

// Z remainder — the whole z MINUS the top-right wedge (its top bar stops at x68,
// then the shape drops down the diagonal to the bottom bar). This is what pours
// in during state 3 to complete the z; kept as its own clip so the completion
// fills cleanly inside the letter with no distortion.
const Z_REST = "M8 34 L68 34 L68 102 L114 102 L114 170 L0 170 L54 102 L8 102 Z";

// The progressive fill, letter by letter. Each glyph is filled by a shape that
// GROWS along one axis, so the mark reads as physically filling up rather than a
// wash sweeping over it. `s1` is how full it sits in state 2 (the block), `s2` in
// state 3 (complete); the element scales from 0 → s1 → s2 along `axis`, anchored
// at `origin` so it grows the right way:
//   · z wedge — grows in from the right point to seed the z (state 2), holds.
//   · z rest  — pours DOWN from the top edge to complete the z (state 3).
//   · i       — ONE fill rising from the base: half-full block, then to the top.
//   · l       — ONE fill dropping from the top: the cap, then down to the base.
// z rest is clipped to Z_REST; the wedge to the whole z; i / l need no clip
// because their fill shape is the letter itself.
const FILLS = [
  { key: "z-wedge", d: "M68 34 L122 34 L68 102 Z", clip: "z-clip", axis: "x", origin: "122 68", s1: 1, s2: 1 }, // prettier-ignore
  { key: "z-rest", rect: { x: 0, y: 34, width: 122, height: 136 }, clip: "z-rest-clip", axis: "y", origin: "61 34", s1: 0, s2: 1 }, // prettier-ignore
  { key: "i", rect: { x: 138, y: 34, width: 68, height: 136 }, clip: null, axis: "y", origin: "172 170", s1: 0.5, s2: 1 }, // prettier-ignore
  { key: "l", rect: { x: 234, y: 0, width: 68, height: 170 }, clip: null, axis: "y", origin: "268 0", s1: 0.2, s2: 1 }, // prettier-ignore
] as const;

interface Step {
  title: string;
  copy: string;
}

const STEPS: Step[] = [
  {
    title: "Entendemos tu negocio",
    copy: "Te acompañamos con un análisis 100% personalizado, diseñando una hoja de ruta técnica para construir presencia y diferenciación real en tu mercado.",
  },
  {
    title: "Desarrollamos tu estructura",
    copy: "Transformamos tu comunicación en un activo comercial con propuestas visuales que potencian el engagement, aumentan la conversión y aportan valor.",
  },
  {
    title: "Acompañamos tu crecimiento",
    copy: "Nos integramos como tu aliado estratégico para guiarte y resolver en cada paso, alineando cada pieza de diseño con los objetivos de tu negocio.",
  },
];

export default function MetodoZil() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      const letters = q("[data-stroke]");
      const fills = q("[data-fill]");
      const texts = q("[data-text]");
      const bars = q("[data-bar-fill]");
      const header = root.current!.querySelector(
        "[data-section-head]",
      ) as HTMLElement;
      const runway = root.current!.querySelector(
        "[data-runway]",
      ) as HTMLElement;
      const stage = root.current!.querySelector("[data-stage]") as HTMLElement;

      const axisProp = (i: number) =>
        FILLS[i].axis === "x" ? "scaleX" : "scaleY";

      // Pre-entrance state: each outline hides behind its own full dash length
      // so it can trace itself out (the vector draw-on) as the section
      // approaches. Every progressive fill starts empty (scale 0) at its own
      // growth anchor, so nothing is filled in state 1.
      letters.forEach((p) => {
        const len = (p as unknown as SVGPathElement).getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(letters, { opacity: 1 });
      fills.forEach((el, i) =>
        gsap.set(el, { [axisProp(i)]: 0, svgOrigin: FILLS[i].origin }),
      );
      gsap.set(texts, { opacity: 0, y: 24 });
      gsap.set(texts[0], { opacity: 1, y: 0 });
      // The header rises in with the draw-on (tween added at the head of the
      // master timeline below), then holds for every state — hidden here so it
      // isn't present before its beat.
      gsap.set(header, { opacity: 0, y: 24 });
      gsap.set(bars, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(bars[0], { scaleX: 1 });

      // Reduced motion / no-JS friendly: skip the choreography, drop the reader
      // straight into the finished composition with every step's copy stacked.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // outline fully drawn (it stays visible under the completed fill)
        gsap.set(letters, { strokeDashoffset: 0 });
        fills.forEach((el, i) => gsap.set(el, { [axisProp(i)]: FILLS[i].s2 }));
        gsap.set(texts, {
          opacity: 1,
          y: 0,
          gridColumnStart: "auto",
          gridRowStart: "auto",
          marginBottom: 40,
        });
        gsap.set(bars, { scaleX: 1 });
        gsap.set(header, { opacity: 1, y: 0 });
        return;
      }

      // One PAUSED master timeline holding the three settled states as labels
      // (s0 → s1 → s2). Scroll never scrubs it; instead we `tweenTo` a label so
      // each transition plays as one clean, self-paced beat and then rests.
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });

      // ── Entrance → S0 · Análisis: the outline draws itself letter by letter.
      // A bare wireframe — no corner nodes, no fill — so the mark reads as a
      // technical construction still being set out. This lives INSIDE the master
      // timeline, before the s0 label, so a reader who blasts past the entrance
      // simply has it fast-forwarded by the same tweenTo that carries them to
      // their zone — one playhead, no competing writers.
      tl.to(header, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0)
        .to(
          letters,
          {
            strokeDashoffset: 0,
            duration: 0.9,
            ease: "power2.inOut",
            stagger: 0.15,
          },
          0,
        )
        .addLabel("s0");

      // ── S0 → S1 · Desarrollo: each letter starts filling into the still-present
      // outline, but only PART-WAY — the z's wedge seeds it, the i fills to half,
      // the l fills its cap. These are the "blocks inside"; the fill grows along
      // each letter's own axis, staggered for a cascade. The z-rest holds at 0
      // (s1: 0) so it isn't tweened here — it waits for the completion. ─────────
      fills.forEach((el, i) => {
        if (FILLS[i].s1 === 0) return;
        tl.to(
          el,
          {
            [axisProp(i)]: FILLS[i].s1,
            duration: 0.55,
            // smooth decel, no overshoot — an overshoot would push the clipped
            // wedge past the Z diagonal and read as a momentary misalignment.
            ease: "power3.out",
          },
          `s0+=${i * 0.12}`,
        );
      });
      tl.to(texts[0], { opacity: 0, y: -24, duration: 0.35 }, "s0")
        .to(texts[1], { opacity: 1, y: 0, duration: 0.45 }, "s0+=0.2")
        .to(bars[1], { scaleX: 1, duration: 0.6 }, "s0")
        .addLabel("s1");

      // ── S1 → S2 · Aliado: each letter's fill COMPLETES from its block, growing
      // the rest of the way along the same axis — the z pours down from the wedge
      // through the diagonal to the base, the i rises to the top, the l drops to
      // the base — so the mark reads as physically finishing filling. The outline
      // stays put the whole time (it shares the fill colour, so it simply merges
      // into the completed shape rather than vanishing). Staggered per letter. ───
      fills.forEach((el, i) => {
        if (FILLS[i].s2 === FILLS[i].s1) return; // z-wedge already full — holds
        tl.to(
          el,
          {
            [axisProp(i)]: FILLS[i].s2,
            // the completion is the section's climax — a symmetric sine ease so
            // it glides the rest of the way in and settles without a snap.
            duration: 0.7,
            ease: "sine.inOut",
          },
          `s1+=${i * 0.1}`,
        );
      });
      tl.to(texts[1], { opacity: 0, y: -24, duration: 0.35 }, "s1")
        .to(texts[2], { opacity: 1, y: 0, duration: 0.45 }, "s1+=0.2")
        .to(bars[2], { scaleX: 1, duration: 0.6 }, "s1")
        .addLabel("s2");

      const LABELS = ["s0", "s1", "s2"] as const;
      // Fixed transition lengths, independent of scroll distance: `tweenTo` scrubs
      // the paused timeline to the label over exactly this many seconds, so no
      // switch inherits its authored duration. The step-to-step switch is snappy;
      // the state-3 fill is the section's widest visual change — the whole mark
      // floods with colour — so it gets a noticeably longer, softer scrub. At
      // 0.5s it still landed a touch abrupt; this lets it glide in and settle.
      const DUR = 0.5;
      const FILL_DUR = 1.1;
      // The playhead starts BEFORE s0 (the un-drawn mark); the entrance trigger
      // below carries it to s0. `active` still starts at 0 because state-wise
      // the section is in análisis — only the drawing hasn't happened yet.
      let active = 0;
      let trans: gsap.core.Tween | undefined;
      // Zone thresholds as fractions of the stuck distance (runway − stage =
      // 300svh). s0 and s1 keep their original ~50svh / ~100svh of scroll, but s2
      // now claims the whole second half — ~150svh of tail AFTER the fill fires —
      // so the completion (the slow ~1.1s FILL_DUR beat) always has room to finish
      // playing while the stage is still pinned, no matter how fast the reader
      // scrolls, before the section releases into normal flow.
      const zone = (p: number) => (p < 0.167 ? 0 : p < 0.5 ? 1 : 2);

      // The ONLY thing that moves the timeline. Recording `active` first means no
      // two callers ever drive the playhead at once (that was the entry flicker).
      // Runs both ways: scrolling back up walks the states back down.
      const goTo = (i: number) => {
        if (i === active) return;
        const prev = active;
        active = i;
        trans?.kill();
        // Any switch that crosses into the fill (or rewinds back out of it) is
        // the slow, soft one; the rest stay snappy. sine.inOut eases both ends,
        // so the flood starts gently instead of snapping on.
        const fill = i === 2 || prev === 2;
        trans = tl.tweenTo(LABELS[i], {
          duration: fill ? FILL_DUR : DUR,
          ease: fill ? "sine.inOut" : "power2.inOut",
        });
      };

      // Entrance: the draw-on plays at its authored pace as the stage settles
      // into place. The stage sits at the TOP of the 400svh runway and pins when
      // the runway's top reaches the viewport top, so the mark is only near the
      // centre of the viewport once the runway top is near 0 — an earlier start
      // (e.g. "top 85%") drew the whole logo while it was still below the fold,
      // finishing long before the reader scrolled it into view. "top 40%" fires
      // with the mark still low and rising, so it draws as it centres — early
      // enough that the reader catches the draw-on rather than arriving to a mark
      // that has already finished settling.
      // It shares the `trans` slot with goTo, so if a zone switch lands mid-draw
      // it is killed and the same playhead is carried straight on through s0 to
      // the target — never two writers.
      ScrollTrigger.create({
        trigger: runway,
        start: "top 40%",
        once: true,
        onEnter: () => {
          // A refresh that landed mid-section has already seeked past the
          // entrance; only play it from an untouched playhead.
          if (active === 0 && !trans && tl.time() === 0) {
            trans = tl.tweenTo("s0");
          }
        },
      });

      // READ-ONLY trigger: it reports progress and nothing else. The stage is held
      // at the top by CSS `position: sticky`, NOT by `pin: true`.
      //
      // That split is the whole point. A JS pin swaps the stage to `position:
      // fixed` and injects a spacer to replace its height, so anything that ends
      // the pin has to delete ~3 viewports of document and re-anchor the scroll
      // by hand — a write that iOS momentum scrolling silently overrides, landing
      // the reader ~3 viewports further down (in the contact form). Sticky is the
      // browser's own compositor doing the same job: no spacer, no document
      // resize, no scroll writes, nothing to lose a race against.
      //
      // Snapping is gone for the same reason. It tweened the scroll position
      // against the reader's finger, and it bought nothing here: the states are
      // discrete, so resting between two of them still shows a settled state.
      ScrollTrigger.create({
        trigger: runway,
        start: "top top",
        // Exactly the distance the stage stays stuck: the runway's height minus
        // the stage it carries. Both are svh-based, so unlike a viewport-relative
        // end this doesn't move when the mobile URL bar slides away.
        end: () => "+=" + (runway.offsetHeight - stage.offsetHeight),
        invalidateOnRefresh: true,
        onUpdate: (self) => goTo(zone(self.progress)),
        // Reload/rotate mid-section: land on the right state instantly, no replay.
        onRefresh: (self) => {
          if (!self.isActive) return;
          active = zone(self.progress);
          trans?.kill();
          tl.seek(LABELS[active]);
        },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* Scroll runway. Its only job is to be tall: the stage sticks to the top
          of the viewport until the runway has scrolled past, so the extra 300svh
          of stuck distance (400svh runway − 100svh stage) IS the length of the
          choreography. The final ~150svh of that is a deliberate tail after the
          state-3 fill fires, giving the slow completion room to finish playing
          while still pinned before the section releases into normal scroll.
          Under reduced motion nothing animates, so the runway collapses to the
          stage and the section scrolls like any other block. */}
      <div data-runway className="relative h-[400svh] motion-reduce:h-auto">
        <div
          data-stage
          // Mobile AND tablet: stacked, and centred in the band the chrome leaves
          // visible — pt-20 clears the 80px header (it hides on scroll-down but
          // returns on any scroll-up, so its slot must stay reserved) and pb-28
          // clears the ContactDrawer's 7rem peek pinned to the bottom at these
          // sizes; justify-center splits the leftover evenly so the composition
          // sits centred between the two. That band is only ~svh−192 on a phone,
          // so the whole mobile composition is deliberately compact — small logo,
          // tight gap-6, trimmed card padding — to keep BOTH the title and the
          // card clear of the drawer. Desktop is the two-column grid: the drawer
          // is gone there, so symmetric py-24 recentres against the raw viewport
          // (it clears the header on its own).
          className="sticky top-0 mx-auto flex min-h-[100svh] w-full max-w-8xl flex-col items-center justify-center gap-6 px-6 pb-28 motion-reduce:static tablet:gap-16 tablet:px-8 desktop:gap-20 desktop:px-12 desktop:pt-10 desktop:pb-24"
        >
          {/* ---- Section header ------------------------------------------------
              Sits above the animated exhibit and stays put while the runway
              scrolls (it lives inside the sticky stage), so the section keeps a
              stable title anchor through all three states. Its entrance is wired
              into the master timeline below — it rises in alongside the draw-on
              rather than being present from frame one, so it reads as part of the
              same choreography.

              It stays in the flow so the WHOLE composition (title + exhibit)
              centres as one block — `justify-center` on the stage then gives it
              equal space above the title and below the exhibit, which reads as
              balanced. (Floating the header to dead-centre the exhibit alone left
              the section top-loaded with an empty lower half.) */}
          <header
            data-section-head
            className="flex w-full flex-col items-start text-left desktop:w-auto desktop:items-center desktop:text-center"
          >
            <span className="inline-flex items-center rounded-md bg-primary-light px-4 py-2 text-p-sm font-bold tracking-wide text-primary-dark uppercase">
              Método Zil
            </span>
            <h2 className="mt-5 max-w-[16ch] text-h2 tracking-[-0.03em] text-balance">
              Cómo trabajamos
            </h2>
          </header>

          {/* ---- Exhibit card ------------------------------------------------
              A light-gray rounded panel that grounds the mark + copy so they
              don't float in whitespace. Same treatment as the contact/CTA card
              (rounded-3xl + p-8/12/16), on the muted surface token instead of the
              lilac, so the two sections read as one system. */}
          <div className="w-full p-6 tablet:p-12 desktop:p-16">
            <div className="flex w-full flex-col items-center gap-6 tablet:gap-10 desktop:grid desktop:grid-cols-[1fr_1fr] desktop:items-center desktop:gap-24">
              {/* ---- Logo stage --------------------------------------------------- */}
              <div className="flex w-full items-center">
                <svg
                  viewBox="-8 -8 318 186"
                  fill="none"
                  role="img"
                  aria-label="Método Zil"
                  shapeRendering="geometricPrecision"
                  className="w-full max-w-[160px] tablet:max-w-[300px] desktop:max-w-[440px]"
                >
                  <defs>
                    {/* clips the z wedge to the letter so its grow-in never spills
                  past the diagonal */}
                    <clipPath id="z-clip">
                      <path d={LETTERS[0]} />
                    </clipPath>
                    {/* clips the z-completion fill to the z-minus-wedge shape, so
                  it pours down cleanly inside the letter with no distortion */}
                    <clipPath id="z-rest-clip">
                      <path d={Z_REST} />
                    </clipPath>
                  </defs>

                  {/* Progressive fill layer — one growing shape per letter (the z
                    in two parts: wedge + completion). Each scales along its own
                    axis from an anchored origin (driven by GSAP), so the letters
                    physically fill up rather than being washed over. The clip
                    lives on a static wrapper so the shape's own scale doesn't drag
                    it along. Rendered UNDER the outline so the wireframe reads on
                    top through the whole fill. */}
                  <g>
                    {FILLS.map((f) => {
                      const shape =
                        "d" in f ? (
                          <path data-fill d={f.d} fill={FILL} />
                        ) : (
                          <rect
                            data-fill
                            x={f.rect.x}
                            y={f.rect.y}
                            width={f.rect.width}
                            height={f.rect.height}
                            fill={FILL}
                          />
                        );
                      return f.clip ? (
                        <g key={f.key} clipPath={`url(#${f.clip})`}>
                          {shape}
                        </g>
                      ) : (
                        <g key={f.key}>{shape}</g>
                      );
                    })}
                  </g>

                  {/* stroke outline that draws itself in state 1 — technical, sharp
                mitred corners, thin uniform weight */}
                  <g>
                    {STROKES.map((d, i) => (
                      <path
                        key={i}
                        data-stroke
                        d={d}
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        strokeLinejoin="miter"
                        strokeMiterlimit={8}
                      />
                    ))}
                  </g>
                </svg>
              </div>

              {/* ---- Text stage --------------------------------------------------- */}
              <div className="flex w-full flex-col">
                {/* crossfading step copy, stacked in one grid cell */}
                <div className="grid">
                  {STEPS.map((s) => (
                    <div
                      key={s.title}
                      data-text
                      className="col-start-1 row-start-1"
                    >
                      <h3 className="text-h3 tablet:whitespace-nowrap">
                        {s.title}
                      </h3>
                      <p className="mt-4 max-w-[46ch] text-p-lg text-muted">
                        {s.copy}
                      </p>
                    </div>
                  ))}
                </div>

                {/* progress rail — three segments fill as each state completes */}
                <div className="mt-6 flex gap-3 tablet:mt-10">
                  {STEPS.map((s) => (
                    <div
                      key={s.title}
                      className="h-[3px] flex-1 overflow-hidden rounded-full bg-border"
                    >
                      <div
                        data-bar-fill
                        className="h-full w-full origin-left rounded-full bg-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
