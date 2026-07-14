import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

// The violet "primary blocks" that overlay each glyph in the final state, each
// with the SVG-space origin it grows from (so it reads as sliding into place).
const ACCENTS = [
  // z wedge — wipes in from the right point; clipped to the Z so the scaling
  // triangle never spills past the diagonal into the white.
  {
    d: "M68 34 L122 34 L68 102 Z",
    axis: "x",
    origin: "122 68",
    clip: "z-clip",
  },
  { d: "M138 102 H206 V170 H138 Z", axis: "y", origin: "172 170", clip: null }, // i lower half — rises from the base
  { d: "M234 0 H302 V34 H234 Z", axis: "y", origin: "268 0", clip: null }, // l cap — drops from the top
] as const;

// Solid square nodes for the vectoring look — placed on the outer corners only.
// The z's two diagonal-junction points (54,102)/(68,102) are deliberately left
// bare so the diagonal reads as one clean line through the midline.
const ANCHORS = [
  [8, 34],
  [122, 34],
  [114, 102],
  [114, 170],
  [0, 170],
  [8, 102], // z
  [138, 34],
  [206, 34],
  [206, 170],
  [138, 170], // i
  [234, 0],
  [302, 0],
  [302, 170],
  [234, 170], // l
];

// Node square size (user units); half-extent used to centre each node on its vertex.
const NODE = 9;

interface Step {
  title: string;
  lead: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: "Análisis Estratégico",
    lead: "Diagnóstico inicial para proyectar el potencial de su marca.",
    body: "Un formulario breve y una llamada con nuestro equipo nos permiten entender sus objetivos y trazar la estrategia.",
  },
  {
    title: "Desarrollo Criterioso",
    lead: "Rigurosidad metodológica orientada a la diferenciación.",
    body: "Fusionamos pensamiento estratégico y comunicación visual, con un enfoque analítico y una curaduría cuidada en cada etapa.",
  },
  {
    title: "Aliado Comprometido",
    lead: "Acompañamiento corporativo enfocado en el crecimiento y resultados.",
    body: "Un compromiso integral con su negocio, de principio a fin, con soluciones de alto impacto que impulsan su crecimiento.",
  },
];

export default function MetodoZil() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      const letters = q("[data-stroke]");
      const gradient = q("[data-gradient]");
      const solid = q("[data-solid]");
      const accents = q("[data-accent]");
      const anchors = q("[data-anchor]");
      const texts = q("[data-text]");
      const bars = q("[data-bar-fill]");
      const stage = root.current!.querySelector("[data-stage]") as HTMLElement;

      // Baseline IS state 0 — the outline and its nodes simply shown, nothing
      // filled. No draw-on reveal, so the mark reads immediately on approach.
      gsap.set(letters, { opacity: 1 });
      gsap.set(anchors, { opacity: 1, scale: 1, transformOrigin: "center" });
      gsap.set(gradient, { opacity: 0 });
      gsap.set(solid, { opacity: 0 });
      accents.forEach((el, i) =>
        gsap.set(el, {
          [ACCENTS[i].axis === "x" ? "scaleX" : "scaleY"]: 0,
          svgOrigin: ACCENTS[i].origin,
        }),
      );
      gsap.set(texts, { opacity: 0, y: 24 });
      gsap.set(texts[0], { opacity: 1, y: 0 });
      gsap.set(bars, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(bars[0], { scaleX: 1 });

      // Reduced motion / no-JS friendly: skip the choreography, drop the reader
      // straight into the finished composition with every step's copy stacked.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(letters, { opacity: 0 });
        gsap.set(solid, { opacity: 1 });
        gsap.set(accents, { scaleX: 1, scaleY: 1 });
        gsap.set(texts, {
          opacity: 1,
          y: 0,
          gridColumnStart: "auto",
          gridRowStart: "auto",
          marginBottom: 40,
        });
        gsap.set(bars, { scaleX: 1 });
        return;
      }

      // One PAUSED master timeline holding the three settled states as labels
      // (s0 → s1 → s2). Scroll never scrubs it; instead we `tweenTo` a label so
      // each transition plays as one clean, self-paced beat and then rests.
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });

      // ── S0 · Análisis — the resting outline, already established at time 0 ──
      tl.addLabel("s0");

      // ── S0 → S1 · Desarrollo: outline gives way to the gradient fill ──────
      tl.to(anchors, { opacity: 0, scale: 0.4, duration: 0.35 }, "s0")
        .to(letters, { opacity: 0, duration: 0.4 }, "s0+=0.1")
        .to(gradient, { opacity: 1, duration: 0.6 }, "s0")
        .to(texts[0], { opacity: 0, y: -24, duration: 0.35 }, "s0")
        .to(texts[1], { opacity: 1, y: 0, duration: 0.45 }, "s0+=0.2")
        .to(bars[1], { scaleX: 1, duration: 0.6 }, "s0")
        .addLabel("s1");

      // ── S1 → S2 · Aliado: gradient hardens to solid, accent blocks slide in ─
      tl.to(solid, { opacity: 1, duration: 0.5, ease: "power2.inOut" }, "s1")
        .to(gradient, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "s1")
        .to(texts[1], { opacity: 0, y: -24, duration: 0.35 }, "s1")
        .to(texts[2], { opacity: 1, y: 0, duration: 0.45 }, "s1+=0.2")
        .to(bars[2], { scaleX: 1, duration: 0.6 }, "s1");

      // Each accent reveals along its own axis (z wipes in from the right, the
      // i/l blocks grow vertically), staggered for a cascade.
      accents.forEach((el, i) =>
        tl.to(
          el,
          {
            [ACCENTS[i].axis === "x" ? "scaleX" : "scaleY"]: 1,
            duration: 0.55,
            // smooth decel, no overshoot — an overshoot would push the clipped
            // wedge past the Z diagonal and read as a momentary misalignment.
            ease: "power3.out",
          },
          `s1+=${0.1 + i * 0.12}`,
        ),
      );

      tl.addLabel("s2");

      const LABELS = ["s0", "s1", "s2"] as const;
      // One fixed transition length for every switch, regardless of scroll
      // distance: `tweenTo` scrubs the paused timeline to the label over exactly
      // this many seconds, so no switch inherits its authored duration.
      const DUR = 0.5;
      // Baseline already renders s0, so we start settled in state 0.
      let active = 0;
      let trans: gsap.core.Tween | undefined;
      let pinST: ScrollTrigger | undefined;
      const zone = (p: number) => (p < 0.25 ? 0 : p < 0.75 ? 1 : 2);

      // Once the last state has landed there is nothing left to animate, so drop
      // the pin: the section then scrolls like any other block instead of holding
      // the reader for three more viewports on the way back up.
      const release = () => {
        if (!pinST) return;
        const { start, end } = pinST;
        const dist = end - start; // the scroll length the spacer was occupying
        const y = window.scrollY;
        pinST.kill(true); // revert → removes the pin-spacer, restores the stage
        pinST = undefined;

        // Removing the spacer shortens the page, so re-anchor to keep the exact
        // same frame across the un-pin:
        //   inside the range → the stage was fixed at the viewport top, which is
        //                      its document top (`start`) once it's free again
        //   past the range   → everything below shifts up by the removed `dist`
        //   above the range  → nothing above it moved, so leave the scroll alone
        const y2 = y > end ? y - dist : y >= start ? start : y;
        // `behavior: instant` is required: html has `scroll-behavior: smooth`,
        // which would otherwise animate this correction and make it visible.
        if (y2 !== y) window.scrollTo({ top: y2, left: 0, behavior: "instant" });
        ScrollTrigger.refresh(); // other triggers' offsets just moved
      };

      // The ONLY thing that moves the timeline. Always records `active` so no two
      // callers ever drive the playhead at once (that was the entry flicker).
      // FORWARD-ONLY: the choreography plays once. Scrolling back up holds the
      // furthest state reached instead of rewinding it.
      const goTo = (i: number) => {
        if (i <= active) return;
        active = i;
        trans?.kill();
        trans = tl.tweenTo(LABELS[i], {
          duration: DUR,
          ease: "power2.inOut",
          onComplete: i === LABELS.length - 1 ? release : undefined,
        });
      };

      // Pin the stage and split its scroll range into three plateaus. The snap
      // points [0, ½, 1] have their basins at exactly 0.25 / 0.75 — the same
      // thresholds `zone()` uses — so settling never nudges you into a
      // neighbouring state.
      pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: "+=300%",
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: [0, 0.5, 1],
          duration: { min: 0.2, max: 0.5 },
          delay: 0.05,
          ease: "power2.inOut",
        },
        id: "metodo-pin",
        onUpdate: (self) => goTo(zone(self.progress)),
        // Reload/resize mid-section: land on the right state instantly, no replay.
        // Clamped to `active` so a refresh while scrolled back up can't rewind
        // past the furthest state already reached.
        onRefresh: (self) => {
          if (!self.isActive) return;
          const i = Math.max(active, zone(self.progress));
          active = i;
          trans?.kill();
          tl.seek(LABELS[i]);
        },
      });

      Object.assign(window as unknown as Record<string, unknown>, {
        __release: release,
        __ST: ScrollTrigger,
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div
        data-stage
        // Mobile only: stacked, and centred in the area BELOW the fixed 80px
        // header rather than the raw viewport — hence pt exceeding pb by exactly
        // that 80px (96 − 16), with justify-center splitting the rest evenly, so
        // nothing slides under the header while pinned. From tablet up it's the
        // two-column grid, where the symmetric py-24 already clears the header.
        className="mx-auto flex min-h-[100svh] w-full max-w-8xl flex-col items-center justify-center gap-10 px-6 pt-24 pb-4 tablet:grid tablet:grid-cols-[1fr_1fr] tablet:gap-16 tablet:px-8 tablet:py-24 desktop:gap-24 desktop:px-12"
      >
        {/* ---- Logo stage --------------------------------------------------- */}
        <div className="flex w-full items-center">
          <svg
            viewBox="-8 -8 318 186"
            fill="none"
            role="img"
            aria-label="Método Zil"
            shapeRendering="geometricPrecision"
            className="w-full max-w-[200px] tablet:max-w-[440px]"
          >
            <defs>
              <linearGradient
                id="zil-grad"
                x1="8"
                y1="34"
                x2="302"
                y2="170"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#9747FF" />
                <stop offset="1" stopColor="#E7D5FF" />
              </linearGradient>
              {/* clips the z accent to the letter so its slide-in never spills
                  outside the diagonal */}
              <clipPath id="z-clip">
                <path d={LETTERS[0]} />
              </clipPath>
            </defs>

            {/* gradient fill layer */}
            <g data-gradient>
              {LETTERS.map((d, i) => (
                <path key={i} d={d} fill="url(#zil-grad)" />
              ))}
            </g>

            {/* solid dark fill layer (fades over the gradient in state 3) */}
            <g data-solid>
              {LETTERS.map((d, i) => (
                <path key={i} d={d} fill="#4B256E" />
              ))}
            </g>

            {/* violet accent blocks that slide in over the dark letters. The
                clip lives on a static wrapper so the accent's own scale doesn't
                drag it along. */}
            <g>
              {ACCENTS.map((a, i) => {
                const block = <path data-accent d={a.d} fill="#9747FF" />;
                return a.clip ? (
                  <g key={i} clipPath={`url(#${a.clip})`}>
                    {block}
                  </g>
                ) : (
                  <g key={i}>{block}</g>
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
                  stroke="#4B256E"
                  strokeWidth={2}
                  strokeLinejoin="miter"
                  strokeMiterlimit={8}
                />
              ))}
            </g>

            {/* solid square nodes on every vertex, centred exactly */}
            <g>
              {ANCHORS.map(([x, y], i) => (
                <rect
                  key={i}
                  data-anchor
                  x={x - NODE / 2}
                  y={y - NODE / 2}
                  width={NODE}
                  height={NODE}
                  fill="#9747FF"
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
              <div key={s.title} data-text className="col-start-1 row-start-1">
                {/* Full column width so the title holds one line; the reading
                    measure belongs on the paragraph, not the whole block. */}
                <h3 className="text-h4 font-bold tracking-wide text-balance uppercase desktop:text-h3">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-[46ch] text-p-lg text-text">
                  <strong className="font-bold">{s.lead}</strong> {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* progress rail — three segments fill as each state completes */}
          <div className="mt-10 flex gap-3">
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
  );
}
