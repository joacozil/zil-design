import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    // The live Lenis instance, or undefined under reduced motion (no Lenis).
    // Anchor handlers (Layout.astro, MobileMenu) MUST scroll through this when it
    // exists: Lenis owns the scroll position on its own rAF loop, and a native
    // `scrollIntoView` fights that loop — the two animations race and the jump
    // intermittently stalls, which is the "click twice to go up" bug.
    lenis?: Lenis;
  }
}

gsap.registerPlugin(ScrollTrigger);

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5,
  });

  window.lenis = lenis;

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}
