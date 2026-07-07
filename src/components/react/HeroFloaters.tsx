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

// Distributed around the perimeter, leaving the center clear for the content.
// The top band starts below ~13% so nothing hides behind the fixed header.
// Empty for now — the graphic elements inside get filled in later.
const RAW: Floater[] = [
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
];

const maxDist = Math.max(...RAW.map((f) => Math.hypot(f.x - 50, f.y - 50)));
const FLOATERS = RAW.map((f) => ({
  ...f,
  // 0 at the center, 1 at the outermost element — drives the radial stagger.
  dist: Math.hypot(f.x - 50, f.y - 50) / maxDist,
}));

const VARIANT_CLASS: Record<Variant, string> = {
  accent: "bg-accent",
  primary: "bg-primary",
  "primary-dark": "bg-primary-dark",
  "primary-light": "bg-primary-light",
  card: "border border-border/70 bg-surface shadow-md",
};

/**
 * Decorative floating squares around the hero content (desktop only).
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
      className="pointer-events-none absolute inset-0 hidden desktop:block"
    >
      {FLOATERS.map((f, i) => (
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
