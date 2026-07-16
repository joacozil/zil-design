import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * How long the field holds before composing, so the hero copy can set first.
 *
 * This field's whole idea is that it builds AROUND the core message, which only
 * reads if the message is already on screen — start them together and it is just
 * decoration moving at the same time as the headline. Hero.astro reveals its copy
 * at t=0 with a 0.09 stagger over three items, so the headline has landed and the
 * paragraph is well under way by the time this starts; the field then composes
 * outward beneath the settling CTA.
 *
 * The two halves are timed against each other by hand, so retuning either means
 * retuning both. The counterpart is the `data-reveal-group` in Hero.astro.
 */
const HERO_TEXT_LEAD = 0.05;

type Variant = "accent" | "primary" | "primary-dark" | "primary-light" | "card";

// A graphic element some cards carry, so the field reads as design tooling
// composing itself rather than plain blocks. Only `card` (white) floaters take
// content — the solid colour chips stay bare so the field keeps its rhythm.
type Content =
  | "bulb" // a lightbulb — an idea
  | "wire" // the zil wordmark as an outline — a mark under construction
  | "type" // "Aa", type specimen
  | "frame" // a selection bounding-box
  | "node" // three connected nodes — a system / graph
  | "crop" // crop marks
  | `word:${string}`; // an uppercase brand attribute

interface Floater {
  x: number; // horizontal center, % of hero
  y: number; // vertical center, % of hero
  s: number; // size (square), px
  v: Variant;
  c?: Content; // optional graphic content (cards only)
}

function withDist(raw: Floater[]) {
  const maxDist = Math.max(...raw.map((f) => Math.hypot(f.x - 50, f.y - 50)));
  return raw.map((f) => ({
    ...f,
    // 0 at the center, 1 at the outermost element — drives the radial stagger.
    dist: Math.hypot(f.x - 50, f.y - 50) / maxDist,
  }));
}

// Desktop: the hero text sits in a narrow center column, so the field can wrap
// around it on all sides. The top band starts below ~13% so nothing hides
// behind the fixed header.
const DESKTOP_FLOATERS = withDist([
  { x: 31, y: 14, s: 60, v: "accent" },
  { x: 5, y: 20, s: 64, v: "card", c: "bulb" },
  { x: 56, y: 17, s: 54, v: "primary-dark" },
  { x: 78, y: 22, s: 64, v: "card", c: "crop" },
  { x: 90, y: 27, s: 64, v: "primary-light" },
  { x: 25, y: 45, s: 56, v: "card", c: "frame" },
  { x: 20, y: 22, s: 46, v: "primary-light" },
  { x: 82, y: 44, s: 56, v: "card", c: "word:IDENTIDAD" },
  { x: 10, y: 50, s: 56, v: "card", c: "word:ESTRATEGIA" },
  { x: 26, y: 73, s: 64, v: "primary" },
  { x: 5, y: 81, s: 52, v: "primary-dark" },
  { x: 68, y: 66, s: 52, v: "primary" },
  { x: 90, y: 64, s: 60, v: "card", c: "type" },
  { x: 46, y: 87, s: 60, v: "card", c: "node" },
  { x: 76, y: 87, s: 56, v: "accent" },
]);

// Tablet: the text is a centre column again (x 24–76 at 820px wide), so this
// field wraps it like desktop's rather than banding like mobile's — but it can't
// simply reuse the desktop set. 640px is the binding width: the column widens to
// x 17–83 there, leaving side channels of only ~17% against desktop's ~34%, so
// anything level with the text has to hug the edge (x ≤ 10 / ≥ 90). What tablet
// gives back is height — the text band is only y 30–69 vs desktop's 25–73 — so
// the top and bottom bands carry most of the count.
const TABLET_FLOATERS = withDist([
  // top band — clears the 80px header (≈8% of the hero here) and stops above the
  // headline at 30%
  { x: 9, y: 15, s: 52, v: "card", c: "bulb" },
  { x: 25, y: 22, s: 44, v: "primary-light" },
  { x: 40, y: 13, s: 48, v: "accent" },
  { x: 58, y: 21, s: 44, v: "card", c: "frame" },
  { x: 75, y: 14, s: 52, v: "primary-dark" },
  // side channels — level with the text, hence pinned to the edges
  { x: 9, y: 45, s: 48, v: "card", c: "type" },
  { x: 92, y: 48, s: 48, v: "primary" },
  // bottom band — below the CTA. Deliberately nothing directly under it: the
  // centre of this band is the CTA's runout, and a floater there (especially a
  // `primary` one, reading as a second violet blob under the violet button)
  // crowds it.
  { x: 10, y: 85, s: 48, v: "primary-dark" },
  { x: 28, y: 93, s: 44, v: "primary" },
  { x: 63, y: 92, s: 44, v: "primary-light" },
  { x: 80, y: 83, s: 48, v: "card", c: "word:SEGURO" },
  { x: 93, y: 92, s: 44, v: "accent" },
]);

// Mobile: the stacked text spans nearly the full width in a vertical band
// roughly 30–68% down the hero, with no side margin to speak of. So this layout
// is confined to a top band and a bottom band instead of wrapping around a
// centre column.
//
// `y` is a % of hero height but the header is a fixed 80px, so the top band's
// clearance shrinks as the viewport does: at 100svh = 653px (Safari with its
// chrome shown) 80px is 12.3% of the hero, vs 9.5% at 844px. That short hero is
// the binding case — it leaves only ~86px between the header (80) and the
// headline (~166), so the whole top band has to fit in that strip: y ≥ 18 to
// clear the header, and low enough not to collide with the h1. Anything at
// x 17–83 sits over the headline and has no room to escape downward.
const MOBILE_FLOATERS = withDist([
  { x: 12, y: 19, s: 44, v: "accent" },
  { x: 50, y: 17, s: 40, v: "card", c: "bulb" },
  { x: 88, y: 20, s: 44, v: "primary-dark" },
  { x: 6, y: 90, s: 40, v: "primary-dark" },
  { x: 27, y: 84, s: 48, v: "primary" },
  { x: 50, y: 92, s: 40, v: "card", c: "type" },
  { x: 71, y: 82, s: 44, v: "primary-light" },
  { x: 91, y: 90, s: 44, v: "accent" },
]);

const VARIANT_CLASS: Record<Variant, string> = {
  accent: "bg-accent",
  primary: "bg-primary",
  "primary-dark": "bg-primary-dark",
  "primary-light": "bg-primary-light",
  card: "border border-border/70 bg-surface shadow-md",
};

// The zil wordmark, stroked as an outline for the `wire` "under construction" mark.
const ZIL_PATH =
  "M300.001 168.417H232.065V0H300.001V168.417ZM67.8174 100.485H112.961V168.415H0L53.3311 100.485H8.83398V32.5547H121.148L67.8174 100.485ZM205.646 168.415H137.712V32.5547H205.646V168.415Z";

/**
 * The graphic inside a card floater. Everything is sized as a fraction of the
 * square (via width %), so it tracks the per-breakpoint floater sizes without
 * its own responsive rules. Strokes read as design-tool chrome (muted), the
 * type specimen reads as brand (solid).
 */
function FloaterContent({ c }: { c: Content }) {
  if (c === "wire") {
    return (
      <svg
        viewBox="0 0 300 169"
        style={{ width: "56%" }}
        fill="none"
        stroke="var(--color-text)"
        strokeWidth={5}
      >
        <path d={ZIL_PATH} />
      </svg>
    );
  }

  if (c === "bulb") {
    return (
      <svg
        viewBox="0 0 24 24"
        style={{ width: "52%" }}
        fill="none"
        stroke="var(--color-text)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    );
  }

  if (c === "type") {
    return (
      <span
        className="font-bold leading-none text-text"
        style={{ fontSize: "0.42em" }}
      >
        Aa
      </span>
    );
  }

  if (c.startsWith("word:")) {
    return (
      <span
        className="whitespace-nowrap font-bold uppercase leading-none text-text"
        style={{ fontSize: "0.26em", letterSpacing: "0.04em" }}
      >
        {c.slice(5)}
      </span>
    );
  }

  // Vector tool marks — one shared 24-unit box, muted stroke.
  const icon: Record<"frame" | "node" | "crop", React.ReactNode> = {
    // Lucide "layers-2" — stacked sheets.
    frame: (
      <g
        fill="none"
        stroke="var(--color-text)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z" />
        <path d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845" />
      </g>
    ),
    // Lucide "share-2" — three nodes linked into a small network.
    node: (
      <g
        fill="var(--color-surface)"
        stroke="var(--color-text)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </g>
    ),
    crop: (
      <g
        fill="none"
        stroke="var(--color-text)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6.5 2 L6.5 15.5 A2 2 0 0 0 8.5 17.5 L22 17.5" />
        <path d="M2 6.5 L15.5 6.5 A2 2 0 0 1 17.5 8.5 L17.5 22" />
      </g>
    ),
  };

  // The frame reads as the crop/canvas the whole field lives on, so it sits a
  // step larger than the other tool marks; the node graph and crop marks are
  // close behind.
  const size =
    c === "frame" ? "62%" : c === "node" || c === "crop" ? "58%" : "48%";
  return (
    <svg viewBox="0 0 24 24" style={{ width: size }}>
      {icon[c]}
    </svg>
  );
}

function Field({
  floaters,
  className = "",
}: {
  floaters: ReturnType<typeof withDist>;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {floaters.map((f, i) => {
        // Word chips are tags: they keep the square's height but let their width
        // hug the label, so a longer word simply reads as a wider rectangle.
        const isWord = f.c?.startsWith("word:");
        return (
          <div
            key={i}
            data-floater
            data-dist={f.dist.toFixed(3)}
            data-x={f.x}
            data-y={f.y}
            className={`absolute flex items-center justify-center rounded-2xl ${VARIANT_CLASS[f.v]}`}
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: isWord ? "auto" : f.s,
              height: f.s,
              paddingInline: isWord ? f.s * 0.36 : undefined,
              // Anchor font-size to the square so content can size in `em`.
              fontSize: f.s,
              translate: "-50% -50%",
            }}
          >
            {f.c && <FloaterContent c={f.c} />}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Decorative floating squares around the hero content — one field per layout,
 * because the shape of the hole they have to wrap around differs at each. Mobile
 * bands them above and below text that runs nearly edge to edge; tablet and
 * desktop both wrap a centre column, but tablet's is far wider (see each set).
 * Counts scale with the room available: 8 / 13 / 16.
 *
 * Intro: the hero copy sets first (see HERO_TEXT_LEAD), then the pieces travel
 * OUT from the center to their positions — starting stacked at the middle, small
 * and blurred, they fan outward in a radial wave (inner first, outer last) and
 * sharpen as they arrive. It reads as the visual system being composed around
 * the core message. They then settle into a gentle, desynced float. On scroll,
 * the whole field parallaxes (scrolls slower than the page).
 *
 * Robustness: the field is visible by default; the intro only hard-hides then
 * reveals when the document is actually visible, since time-based tweens pause
 * on hidden tabs / headless renderers (which would otherwise leave it blank).
 * All motion is skipped under prefers-reduced-motion.
 */
export default function HeroFloaters() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(
        "[data-floater]",
        root.current,
      );
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Parallax: the whole field scrolls slower than the page.
      const hero = root.current?.closest("section");
      if (hero) {
        gsap.to(root.current, {
          y: () => window.innerHeight * 0.3,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }

      // Gentle perpetual float — desynced per item. Safe to always run: it only
      // nudges `y` from 0, so a paused tween just leaves items at rest (visible).
      const startFloat = () =>
        items.forEach((el, i) => {
          gsap.to(el, {
            y: `+=${8 + (i % 3) * 4}`,
            duration: 3 + (i % 4) * 0.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: (i % 5) * 0.2,
          });
        });

      if (document.visibilityState === "visible") {
        // Each item begins at the hero's center: its start offset is the vector
        // from its resting spot back to 50%/50%, in px. Measured off the field
        // rect so it tracks the live viewport (invalidateOnRefresh not needed —
        // this fires once at mount).
        const rect = root.current!.getBoundingClientRect();
        const toCenter = (el: HTMLElement, axis: "x" | "y") => {
          const pct = Number(el.dataset[axis]);
          const span = axis === "x" ? rect.width : rect.height;
          return ((50 - pct) / 100) * span;
        };

        const intro = gsap.from(items, {
          x: (_i, el: HTMLElement) => toCenter(el, "x"),
          y: (_i, el: HTMLElement) => toCenter(el, "y"),
          opacity: 0,
          scale: 0.35,
          filter: "blur(6px)",
          duration: 1.2,
          ease: "expo.out",
          delay: HERO_TEXT_LEAD,
          stagger: (_i, t) => Number(t.dataset.dist) * 0.5,
        });
        intro.eventCallback("onComplete", startFloat);
      } else {
        // Hidden at load — leave the field visible, just float it.
        startFloat();
      }
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      <Field floaters={MOBILE_FLOATERS} className="tablet:hidden" />
      <Field
        floaters={TABLET_FLOATERS}
        className="hidden tablet:block desktop:hidden"
      />
      <Field floaters={DESKTOP_FLOATERS} className="hidden desktop:block" />
    </div>
  );
}
