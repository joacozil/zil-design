/**
 * Scroll entrances — the site's shared motion vocabulary.
 *
 * CONCEPT · "dirección"
 * The page argues, in its own copy, that visual communication *con dirección
 * clara* impulsa el crecimiento and *sin dirección* dificulta el crecimiento.
 * The hero states that argument at load — its full-bleed photo SETTLES into
 * register while the copy rises over it (see `heroIntro`). So nothing on this
 * site is allowed to simply fade in. Elements ARRIVE: along an axis, in reading
 * order, settling into register — the same thing the agency claims to do for a
 * brand. That is the whole brief for this file.
 *
 * There is ONE base move (`rise`) doing almost all the work, because a house
 * style that reads as deliberate is a small vocabulary used consistently, not a
 * different trick per section. The two extra moves exist only where a section
 * makes an argument that motion can state better than it can decorate:
 *
 *   rise   the default. Type being set: a short, confident throw in reading
 *          order. Used for every heading, badge and paragraph on the site.
 *   rail   arrival along the horizontal, for the projects track — each card is
 *          one "punto de contacto", so they land in sequence along their rail.
 *   band   the marker stroke in Statement, which is the page's thesis sentence.
 *          See VARIANTS.band.
 *
 * MARKUP API — declarative, so a section still reads as markup:
 *
 *   data-reveal[="rise"|"rail"|"band"]   reveal this element; the value picks the
 *                                        move, omitted means `rise`
 *   data-reveal-group                    sequence this element's own [data-reveal]
 *                                        descendants off one trigger, in DOM order
 *   data-reveal-delay="0.45"             extra seconds on top of the slot the
 *                                        sequence would otherwise give it
 *
 * Groups nest: an element belongs to its CLOSEST [data-reveal-group] ancestor, so
 * a section can sequence its header off the header and its body off the body
 * without the outer group swallowing both.
 *
 * Every motion number lives here and nowhere else. global.css carries only the
 * pre-reveal `opacity: 0` (see the note there); the distances, durations and
 * eases below are the site's, and retuning the feel means editing this block.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Vertical throw for `rise`. Short on purpose — long travel reads as floaty
 *  decoration, and this brand is "considered and confident", not flashy. */
const RISE_Y = 14;

/** Horizontal throw for `rail`. Slightly longer than RISE_Y: it runs along the
 *  slider's own axis, where the eye already expects movement. */
const RAIL_X = 32;

const DURATION = 0.7;

/** Decelerating, no overshoot. A bounce would read as playful; the settle is the
 *  point — things arrive INTO alignment, they don't spring past it. */
const EASE = "power3.out";

/** Gap between consecutive items in a group. Tight enough to read as one beat
 *  in reading order rather than a queue of separate animations. */
const STAGGER = 0.09;

/* --- Statement's marker band (see VARIANTS.band) ------------------------- */

/** The marker stroke laid down in one confident pass. */
const BAND_STROKE = 0.55;
/** The lime words arriving inside the band. */
const BAND_INK = 0.3;

/** Fire when the trigger's top reaches 85% of the viewport — just inside the
 *  fold, so the move is finished by the time the element is properly being read. */
const START = "top 85%";

/* --- Hero background settle (see heroIntro) ------------------------------- */

/** The photo starts a touch overscaled and eases back to 1. Small — the settle
 *  should read as the image coming to rest, not a zoom. */
const HERO_SETTLE_FROM = 1.12;
/** Long and slow, so it is still easing under the copy as the copy finishes
 *  rising — the whole hero arrives as one unhurried gesture. */
const HERO_SETTLE_DURATION = 1.8;
const HERO_SETTLE_EASE = "power2.out";

/** The logo strip closes the hero intro. It rises like any other element, but is
 *  driven from heroIntro rather than its own ScrollTrigger: pinned at the foot of
 *  the hero it sits below the `top 85%` fire line, so a per-element trigger would
 *  never fire at load and the strip would only appear once the reader scrolled.
 *  A short lead lets the copy land first without making the reader wait. */
const HERO_LOGOS_DELAY = 0.3;

type Build = (tl: gsap.core.Timeline, el: HTMLElement, at: number) => void;

const VARIANTS: Record<string, Build> = {
  rise: (tl, el, at) => {
    tl.from(
      el,
      {
        y: RISE_Y,
        opacity: 0,
        duration: DURATION,
        ease: EASE,
        clearProps: "opacity,transform",
      },
      at,
    );
  },

  rail: (tl, el, at) => {
    tl.from(
      el,
      {
        x: RAIL_X,
        opacity: 0,
        duration: DURATION,
        ease: EASE,
        clearProps: "opacity,transform",
      },
      at,
    );
  },

  /**
   * The marker band in Statement — the one signature move on the page.
   *
   * The sentence is the site's thesis: "Una comunicación visual clara es
   * **diferenciación.**" The highlight IS the clarity. So the clause opens as
   * reserved white space, the band strokes across it left to right like a
   * marker, and the lime word lands inside as it arrives. The argument and the
   * animation are the same gesture.
   *
   * The band is painted by growing a `background-size`, NOT by scaling the span.
   * background-size touches no layout, so the stroke moves nothing at any width.
   * `transform` and `clip-path` would both fight that.
   *
   * No `clearProps` here, unlike rise/rail: the gradient paints the identical
   * colour as the `bg-primary-dark` class beneath it, so there is no seam.
   * (No-JS and reduced-motion readers get the finished band from the class.)
   */
  band: (tl, el, at) => {
    const text = el.querySelector<HTMLElement>("[data-band-text]");
    if (!text) return;

    gsap.set(el, {
      backgroundColor: "transparent",
      backgroundImage:
        "linear-gradient(var(--color-primary-dark), var(--color-primary-dark))",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
      backgroundSize: "0% 100%",
    });
    gsap.set(text, { opacity: 0 });

    tl.to(
      el,
      {
        backgroundSize: "100% 100%",
        duration: BAND_STROKE,
        ease: "power2.inOut",
      },
      at,
    ).to(
      text,
      { opacity: 1, duration: BAND_INK, ease: "power1.out" },
      at + BAND_STROKE - BAND_INK,
    );
  },
};

/**
 * Pick an element's move, defaulting to `rise`.
 *
 * The default has to be resolved by name rather than by trusting the attribute,
 * because a bare `data-reveal` in an .astro template is shorthand for
 * `data-reveal={true}` and reaches the DOM as the literal string "true" — which
 * is not a variant. Anything unrecognised falls back rather than throwing: a
 * typo'd move should still reveal its element, never leave it stuck at the
 * `opacity: 0` the CSS gate applied.
 */
function variantOf(el: HTMLElement): Build {
  return VARIANTS[el.dataset.reveal ?? ""] ?? VARIANTS.rise;
}

/**
 * The one load-time move on the page. Everything else ARRIVES on scroll, but the
 * hero is already in view at load, so instead of rising it SETTLES: the
 * full-bleed photo starts slightly overscaled and eases back into register while
 * the copy rises over it — the "dirección" idea stated by the image itself.
 *
 * Deliberately NOT routed through the `[data-reveal]` opacity gate: that gate
 * hides its element until revealed, and the hero photo must never blink to
 * transparent (its scrims would sit over the bare white page for a frame). So
 * this animates transform ONLY, and leans on the same `reveal-armed` decision as
 * its guard — it is called from init(), after that check, so no-JS and
 * reduced-motion readers get the photo already at rest.
 */
function heroIntro() {
  const img = document.querySelector<HTMLElement>("[data-hero-image]");
  if (img) {
    gsap.from(img, {
      scale: HERO_SETTLE_FROM,
      duration: HERO_SETTLE_DURATION,
      ease: HERO_SETTLE_EASE,
      clearProps: "transform",
    });
  }

  // The logo strip: stamp `data-revealed` first (releasing the CSS opacity gate,
  // exactly as the batch trigger does) then rise it in. Excluded from the batch
  // system via `[data-hero-logos]` so this is its only driver — see init().
  const logos = document.querySelector<HTMLElement>("[data-hero-logos]");
  if (logos) {
    logos.dataset.revealed = "";
    gsap.from(logos, {
      y: RISE_Y,
      opacity: 0,
      duration: DURATION,
      ease: EASE,
      delay: HERO_LOGOS_DELAY,
      clearProps: "opacity,transform",
    });
  }
}

function init() {
  // The inline head script in Layout.astro already decided whether entrances may
  // run (no-JS, reduced motion, or a document hidden at load — see the comment
  // there). Re-deriving those conditions here would be a second decision that
  // could disagree with the CSS, so this just obeys the one signal.
  //
  // Bailing is not merely an optimisation: `from()` writes its start state at
  // build time, so building anything here would hide elements with inline styles
  // regardless of what the CSS gate chose — exactly the blank page the gate
  // exists to prevent.
  if (!document.documentElement.classList.contains("reveal-armed")) return;

  heroIntro();

  const batches: { trigger: HTMLElement; items: HTMLElement[] }[] = [];
  const claimed = new Set<HTMLElement>();

  for (const group of document.querySelectorAll<HTMLElement>(
    "[data-reveal-group]",
  )) {
    // `closest` is what makes groups nestable: a descendant inside a nearer group
    // belongs to that one, not to this outer sweep.
    const items = Array.from(
      group.querySelectorAll<HTMLElement>("[data-reveal]:not([data-hero-logos])"),
    ).filter((el) => el.closest("[data-reveal-group]") === group);

    items.forEach((el) => claimed.add(el));
    if (items.length) batches.push({ trigger: group, items });
  }

  for (const el of document.querySelectorAll<HTMLElement>(
    "[data-reveal]:not([data-hero-logos])",
  )) {
    if (!claimed.has(el)) batches.push({ trigger: el, items: [el] });
  }

  for (const { trigger, items } of batches) {
    const tl = gsap.timeline({ paused: true });

    items.forEach((el, i) => {
      const delay = parseFloat(el.dataset.revealDelay || "0") || 0;
      variantOf(el)(tl, el, i * STAGGER + delay);
    });

    ScrollTrigger.create({
      trigger,
      start: START,
      once: true,
      onEnter: () => {
        // Stamp BEFORE playing. From here GSAP owns the inline opacity, which is
        // what lets each tween clearProps at the end without the CSS gate
        // re-hiding the element. See the note in global.css.
        items.forEach((el) => (el.dataset.revealed = ""));
        tl.play();
      },
    });
  }
}

init();
