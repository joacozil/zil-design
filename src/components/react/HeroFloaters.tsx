import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Variant = "accent" | "primary" | "primary-dark" | "primary-light" | "card";

interface Floater {
  x: number; // horizontal center, % of hero
  y: number; // vertical center, % of hero
  s: number; // size (square), px
  v: Variant;
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
  { x: 5, y: 20, s: 64, v: "card" },
  { x: 56, y: 17, s: 54, v: "card" },
  { x: 78, y: 22, s: 64, v: "primary-dark" },
  { x: 90, y: 27, s: 64, v: "primary-light" },
  { x: 85, y: 13, s: 54, v: "card" },
  { x: 25, y: 45, s: 56, v: "card" },
  { x: 20, y: 22, s: 46, v: "primary-light" },
  { x: 82, y: 44, s: 56, v: "card" },
  { x: 10, y: 50, s: 56, v: "card" },
  { x: 26, y: 73, s: 64, v: "primary" },
  { x: 5, y: 81, s: 52, v: "primary-dark" },
  { x: 68, y: 66, s: 52, v: "primary" },
  { x: 90, y: 64, s: 60, v: "card" },
  { x: 46, y: 87, s: 60, v: "card" },
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
  { x: 9, y: 15, s: 52, v: "card" },
  { x: 25, y: 22, s: 44, v: "primary-light" },
  { x: 40, y: 13, s: 48, v: "accent" },
  { x: 58, y: 21, s: 44, v: "card" },
  { x: 75, y: 14, s: 52, v: "primary-dark" },
  { x: 92, y: 22, s: 48, v: "card" },
  // side channels — level with the text, hence pinned to the edges
  { x: 9, y: 45, s: 48, v: "card" },
  { x: 92, y: 48, s: 48, v: "primary" },
  // bottom band — below the CTA. Deliberately nothing directly under it: the
  // centre of this band is the CTA's runout, and a floater there (especially a
  // `primary` one, reading as a second violet blob under the violet button)
  // crowds it.
  { x: 10, y: 85, s: 48, v: "primary-dark" },
  { x: 28, y: 93, s: 44, v: "primary" },
  { x: 63, y: 92, s: 44, v: "primary-light" },
  { x: 80, y: 83, s: 48, v: "card" },
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
  { x: 50, y: 17, s: 40, v: "card" },
  { x: 88, y: 20, s: 44, v: "primary-dark" },
  { x: 6, y: 90, s: 40, v: "primary-dark" },
  { x: 27, y: 84, s: 48, v: "primary" },
  { x: 50, y: 92, s: 40, v: "card" },
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

function Field({
  floaters,
  className = "",
}: {
  floaters: ReturnType<typeof withDist>;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {floaters.map((f, i) => (
        <div
          key={i}
          data-floater
          data-dist={f.dist.toFixed(3)}
          className={`absolute rounded-2xl ${VARIANT_CLASS[f.v]}`}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.s,
            height: f.s,
            translate: "-50% -50%",
          }}
        />
      ))}
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
 * Intro: the pieces compose outward from the center — scaling up and coming
 * into focus (blur → sharp) in a radial wave — as if the visual system is being
 * built around the core message. They then settle into a gentle, desynced float.
 * On scroll, the whole field parallaxes (scrolls slower than the page).
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
        const intro = gsap.from(items, {
          opacity: 0,
          scale: 0.4,
          filter: "blur(8px)",
          duration: 1,
          ease: "expo.out",
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
