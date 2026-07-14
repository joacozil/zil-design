/**
 * Scroll entrances — the site's shared motion vocabulary.
 *
 * CONCEPT · "dirección"
 * The page argues, in its own copy, that visual communication *con dirección
 * clara* impulsa el crecimiento and *sin dirección* dificulta el crecimiento.
 * HeroFloaters already stages that argument — its field composes around the core
 * message. So nothing on this site is allowed to simply fade in. Elements ARRIVE:
 * along an axis, in reading order, settling into register — the same thing the
 * agency claims to do for a brand. That is the whole brief for this file.
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

/** Fire when the trigger's top reaches 85% of the viewport — just inside the
 *  fold, so the move is finished by the time the element is properly being read. */
const START = "top 85%";

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
   * The sentence is the site's thesis: "Una comunicación visual con dirección
   * clara **impulsa el crecimiento.**" The highlight IS the direction. So the
   * clause opens as reserved white space, the band strokes across it left to
   * right like a marker, and the lime words land inside as it arrives. The
   * argument and the animation are the same gesture.
   *
   * It is painted by growing a `background-size`, NOT by scaling the span, and
   * that is load-bearing. Statement.astro documents that this clause is measured
   * to the pixel: `whitespace-nowrap` makes it an atomic box, its width against a
   * 320px screen is what pins the mobile type size, and the inline background
   * needs the relaxed leading to clear the line above. `transform` and
   * `clip-path` both want the span to stop being inline to behave, which puts all
   * of that back in play. background-size touches no layout at all — so this
   * moves nothing, at any width.
   *
   * `bg-primary-dark` stays on the span in the markup, so no-JS and reduced-motion
   * readers get the finished band from the class alone. The gradient swapped in
   * here paints the identical colour, which is why `clearProps` can hand the band
   * back to the class at the end without a seam.
   */
  band: (tl, el, at) => {
    const text = el.querySelector<HTMLElement>("[data-band-text]");

    // Eager, outside the timeline: a `set()` positioned inside a paused timeline
    // is ambiguous about when it renders, and the band must be collapsed from
    // build time — it is on screen (behind the CSS opacity gate) long before the
    // timeline plays.
    gsap.set(el, {
      backgroundColor: "transparent",
      backgroundImage:
        "linear-gradient(var(--color-primary-dark), var(--color-primary-dark))",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
      backgroundSize: "0% 100%",
    });
    gsap.set(text, { opacity: 0 });

    const stroke = 0.55;
    const ink = 0.3;

    tl.to(
      el,
      {
        backgroundSize: "100% 100%",
        duration: stroke,
        // Accelerate then settle: a stroke laid down in one confident pass.
        ease: "power2.inOut",
        clearProps: "background",
      },
      at,
    ).to(
      text,
      { opacity: 1, duration: ink, ease: "power1.out", clearProps: "opacity" },
      // Overlap the tail of the stroke, so the words read as carried in by the
      // band rather than typed on after it lands.
      at + stroke - ink,
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

  const batches: { trigger: HTMLElement; items: HTMLElement[] }[] = [];
  const claimed = new Set<HTMLElement>();

  for (const group of document.querySelectorAll<HTMLElement>(
    "[data-reveal-group]",
  )) {
    // `closest` is what makes groups nestable: a descendant inside a nearer group
    // belongs to that one, not to this outer sweep.
    const items = Array.from(
      group.querySelectorAll<HTMLElement>("[data-reveal]"),
    ).filter((el) => el.closest("[data-reveal-group]") === group);

    items.forEach((el) => claimed.add(el));
    if (items.length) batches.push({ trigger: group, items });
  }

  for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
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
