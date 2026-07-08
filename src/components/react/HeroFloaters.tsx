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
  { x: 64, y: 72, s: 52, v: "primary" },
  { x: 90, y: 64, s: 60, v: "card" },
  { x: 46, y: 87, s: 60, v: "card" },
  { x: 76, y: 87, s: 56, v: "accent" },
]);

// Mobile / tablet: the stacked text spans nearly the full width in a vertical
// band roughly 30–68% down the hero, with no side margin to speak of. So this
// layout is confined to a top band and a bottom band instead of wrapping
// around a center column.
const COMPACT_FLOATERS = withDist([
  { x: 10, y: 14, s: 44, v: "card" },
  { x: 33, y: 20, s: 40, v: "accent" },
  { x: 58, y: 13, s: 48, v: "card" },
  { x: 80, y: 18, s: 44, v: "primary-dark" },
  { x: 93, y: 25, s: 40, v: "card" },
  { x: 6, y: 90, s: 40, v: "primary-dark" },
  { x: 27, y: 79, s: 48, v: "primary" },
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
 * Decorative floating squares around the hero content, on all three layouts —
 * a compact top/bottom-band field on mobile & tablet (where the stacked text
 * spans nearly the full width), and a wider field wrapping the text on desktop.
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
      <Field floaters={COMPACT_FLOATERS} className="desktop:hidden" />
      <Field floaters={DESKTOP_FLOATERS} className="hidden desktop:block" />
    </div>
  );
}
