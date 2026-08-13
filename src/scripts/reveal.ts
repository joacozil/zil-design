/**
 * Scroll entrances — the site's shared motion vocabulary.
 *
 * CONCEPT · "dirección"
 * The page argues, in its own copy, that visual communication *con dirección
 * clara* impulsa el crecimiento and *sin dirección* dificulta el crecimiento.
 * The hero states that argument at load — the brand's Z DRAWS ITSELF and the
 * copy rises out of the line it lays down (see `heroIntro`). So nothing on this
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
 *                                        sequence would otherwise give it. On a
 *                                        GROUP it holds the whole sequence back
 *                                        instead, each item keeping its slot —
 *                                        the hero waits on its Z that way
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

/* --- Hero: the Z draws itself (see heroIntro) ----------------------------- */

/** The horizon, laid down as ONE stroke, left to right — the direction the
 *  letter is written and the direction the page is read. This is the hero's
 *  master clock: both arms and both fills are timed off it, so retiming the
 *  whole intro means changing this one number. */
const Z_STROKE = 0.95;
/** Eased at BOTH ends, unlike the site's usual `power3.out`. The stroke is the
 *  only move here that starts from rest rather than branching off something
 *  already moving, and an ease-in is what makes it read as a drawn line
 *  accelerating away from its start rather than a wipe that was already going. */
const Z_STROKE_EASE = "power2.inOut";

/** Each diagonal arm, drawn outward from the junction the stroke just passed. */
const Z_ARM = 0.8;
const Z_ARM_EASE = "power2.out";

/** The counter-spaces flooding the drawn outline. Slowest of the three, so the
 *  colour is still settling under the copy as the copy finishes rising and the
 *  hero resolves as one gesture rather than a queue of finished animations. */
const Z_FILL = 1;
const Z_FILL_EASE = "power3.out";
/** How far each panel travels along the Z's own diagonal before landing in
 *  register. Small: this is a plane settling into place, not a slide-in. */
const Z_FILL_SHIFT = 28;
/** A fill trails ITS OWN arm, not the whole outline — the ink follows the pen
 *  down each stroke rather than waiting for the drawing to finish. */
const Z_FILL_LAG = 0.18;

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
 * Invert an ease: the time at which it has covered `progress` of its distance.
 *
 * GSAP eases map time → progress, and the hero needs the opposite — "when does
 * the stroke reach x?" — so this binary-searches the curve. Eases are monotonic,
 * which is what makes the search valid; 24 steps resolves well past a frame.
 */
function timeAtProgress(ease: (p: number) => number, progress: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < progress) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * The one load-time move on the page. Everything else ARRIVES on scroll, but the
 * hero is already in view at load — so rather than arriving, THE BRAND'S Z DRAWS
 * ITSELF, and the copy rises out of the line it just laid down.
 *
 * WHY THIS AND NOT A FADE. The page's own argument is "dirección": communication
 * with a clear direction is what moves a brand. A hero whose elements fade in
 * has no direction to state. Here the whole composition is one gesture with a
 * single origin and a single reading order:
 *
 *   1. the HORIZON strokes left to right, the way a Z is written
 *   2. each ARM springs from the horizon AT THE MOMENT THE STROKE PASSES ITS
 *      OWN JUNCTION — the lower arm first, the upper one a beat later, because
 *      that is the order the stroke reaches them
 *   3. each COUNTER-SPACE floods in behind its own arm, arriving along the Z's
 *      diagonal and landing in register
 *   4. the copy rises last, out of the line (its lead lives in the markup, as
 *      `data-reveal-delay` on the hero's reveal group)
 *
 * Outline before fill is not decoration either: it is the order the work itself
 * happens in — structure drawn, then the surface it carries.
 *
 * THE JUNCTIONS ARE READ FROM THE DOM, NOT HARD-CODED. `--z-gap` in Hero.astro
 * holds the Z's stroke at a constant drawn width, so the junctions sit at ~44%
 * on a desktop but ~27% on a phone. Measuring them is what keeps each arm
 * springing from the stroke instead of from a remembered position — hard-code
 * 44% here and on mobile the arms would appear out of empty violet.
 *
 * Deliberately NOT routed through the `[data-reveal]` opacity gate, exactly as
 * the settle it replaces was not: that gate hides its element until revealed,
 * and it keys off attributes these decorative nodes do not carry. The start
 * states below are written by `gsap.set` at init instead, which runs only after
 * init()'s `reveal-armed` check — so no-JS and reduced-motion readers get the
 * finished Z, never a half-drawn one.
 */
function heroIntro() {
  const layer = document.querySelector<HTMLElement>("[data-hero-image]");
  const line = layer?.querySelector<HTMLElement>(".hero-line");
  const armUp = layer?.querySelector<HTMLElement>(".hero-diag-top");
  const armDown = layer?.querySelector<HTMLElement>(".hero-diag-bottom");
  const fillUp = layer?.querySelector<HTMLElement>(".hero-glow-top");
  const fillDown = layer?.querySelector<HTMLElement>(".hero-glow-bottom");

  if (layer && line && armUp && armDown && fillUp && fillDown) {
    const stage = layer.getBoundingClientRect();
    const up = armUp.getBoundingClientRect();
    const down = armDown.getBoundingClientRect();

    // Each arm's junction with the horizon, as a fraction of the stage width.
    // The upper arm's box runs up-RIGHT from its junction and the lower one
    // down-LEFT from its own, hence left vs right — but neither box STOPS
    // there: both overshoot every end by --z-over of their run so the stroke
    // does not taper into the seam (see the diagonal block in Hero.astro). The
    // junction is that overshoot back in from the box's inner edge, and taking
    // the fraction from the CSS keeps this the same number the geometry uses.
    const over =
      parseFloat(getComputedStyle(layer).getPropertyValue("--z-over")) || 0;
    const overX = (up.width * over) / (1 + 2 * over);
    const upJoin = (up.left + overX - stage.left) / stage.width;
    const downJoin = (down.right - overX - stage.left) / stage.width;

    // Unit vector up the diagonal, taken from the arm's own box so the panels
    // travel along the Z's actual angle at this viewport rather than a guess.
    const len = Math.hypot(up.width, up.height) || 1;
    const ux = up.width / len;
    const uy = -up.height / len;

    const curve = gsap.parseEase(Z_STROKE_EASE);
    const strokeReaches = (x: number) => timeAtProgress(curve, x) * Z_STROKE;
    const downAt = strokeReaches(downJoin);
    const upAt = strokeReaches(upJoin);

    // An arm is DRAWN, not scaled: scaling its box would swing the diagonal's
    // angle through the tween and it would read as a hinge. Insetting the clip
    // from the far end uncovers the line at a fixed angle, from the junction
    // outward — the upper arm rises out of the horizon, the lower one falls
    // away from it, so each is inset from the opposite edge.
    gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(armUp, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(armDown, { clipPath: "inset(0% 0% 100% 0%)" });
    gsap.set(fillUp, {
      opacity: 0,
      x: ux * Z_FILL_SHIFT,
      y: uy * Z_FILL_SHIFT,
    });
    gsap.set(fillDown, {
      opacity: 0,
      x: -ux * Z_FILL_SHIFT,
      y: -uy * Z_FILL_SHIFT,
    });

    const tl = gsap.timeline();
    tl.to(line, { scaleX: 1, duration: Z_STROKE, ease: Z_STROKE_EASE }, 0)
      .to(
        armDown,
        { clipPath: "inset(0% 0% 0% 0%)", duration: Z_ARM, ease: Z_ARM_EASE },
        downAt,
      )
      .to(
        armUp,
        { clipPath: "inset(0% 0% 0% 0%)", duration: Z_ARM, ease: Z_ARM_EASE },
        upAt,
      )
      .to(
        fillDown,
        { opacity: 1, x: 0, y: 0, duration: Z_FILL, ease: Z_FILL_EASE },
        downAt + Z_FILL_LAG,
      )
      .to(
        fillUp,
        { opacity: 1, x: 0, y: 0, duration: Z_FILL, ease: Z_FILL_EASE },
        upAt + Z_FILL_LAG,
      );

    // Hand the geometry back to CSS. Without this the panels keep an inline
    // transform, which makes them a containing block for nothing and pins a
    // compositor layer for the life of the page. `transformOrigin` is listed
    // separately on purpose — `transform` does NOT clear it, and the strokes
    // would keep a stray inline origin for the life of the page.
    tl.set([line, armUp, armDown, fillUp, fillDown], {
      clearProps: "transform,transformOrigin,clipPath,opacity",
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

  const batches: { trigger: HTMLElement; items: HTMLElement[]; lead: number }[] =
    [];
  const claimed = new Set<HTMLElement>();

  for (const group of document.querySelectorAll<HTMLElement>(
    "[data-reveal-group]",
  )) {
    // `closest` is what makes groups nestable: a descendant inside a nearer group
    // belongs to that one, not to this outer sweep.
    const items = Array.from(
      group.querySelectorAll<HTMLElement>("[data-reveal]:not([data-hero-logos])"),
    ).filter((el) => el.closest("[data-reveal-group]") === group);

    // `data-reveal-delay` on the GROUP holds the whole sequence back without
    // flattening it — every item keeps its own slot, the run just starts later.
    // The hero uses it to let the Z finish drawing before the copy rises; per
    // item it would have to be repeated on each one, and the moment anybody
    // added a line the numbers would drift out of step.
    const lead = parseFloat(group.dataset.revealDelay || "0") || 0;

    items.forEach((el) => claimed.add(el));
    if (items.length) batches.push({ trigger: group, items, lead });
  }

  for (const el of document.querySelectorAll<HTMLElement>(
    "[data-reveal]:not([data-hero-logos])",
  )) {
    if (!claimed.has(el)) batches.push({ trigger: el, items: [el], lead: 0 });
  }

  for (const { trigger, items, lead } of batches) {
    const tl = gsap.timeline({ paused: true });

    items.forEach((el, i) => {
      const delay = parseFloat(el.dataset.revealDelay || "0") || 0;
      variantOf(el)(tl, el, lead + i * STAGGER + delay);
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
