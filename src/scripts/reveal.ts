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

/* --- Statement's marker band (see VARIANTS.band) ------------------------- */

/** The marker stroke laid down in one confident pass. */
const BAND_STROKE = 0.55;
/** The lime words arriving inside the band. */
const BAND_INK = 0.3;
/** Retracting is quicker than stroking: undoing a mark is not the statement,
 *  making it is. */
const BAND_RETRACT = 0.35;
/** How long a word holds before the band moves on. Long enough to read the
 *  whole sentence and land on the word, not so long the reader has left. */
const BAND_HOLD = 1.1;

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
   * The sentence is the site's thesis: "Una comunicación visual clara es
   * **crecimiento.**" The highlight IS the clarity. So the clause opens as
   * reserved white space, the band strokes across it left to right like a
   * marker, and the lime word lands inside as it arrives. The argument and the
   * animation are the same gesture.
   *
   * The band is painted by growing a `background-size`, NOT by scaling the span.
   * background-size touches no layout, so the stroke moves nothing at any width
   * — which is what lets the clause stay measured to the pixel (see the note in
   * Statement.astro). `transform` and `clip-path` would both fight that.
   *
   * If the span carries `data-band-words`, the word then ROTATES: the band
   * retracts, the text swaps while collapsed, and the band strokes back in.
   * Same gesture, replayed — the site's vocabulary is deliberately tiny (see
   * the header), so a rotating word reuses the band rather than earning a new
   * move. The span is pinned to the widest word so the line never shifts.
   *
   * No `clearProps` here, unlike rise/rail: this element's background and its
   * word's opacity are animated for as long as the page lives, so handing them
   * back to the class mid-flight would fight the rotation. The gradient paints
   * the identical colour as the `bg-primary-dark` class beneath it, so there is
   * no seam either way. (No-JS and reduced-motion readers never reach this code
   * at all — they get the finished band from the class, holding the first word.)
   */
  band: (tl, el, at) => {
    const text = el.querySelector<HTMLElement>("[data-band-text]");
    if (!text) return;

    let words: string[] = [];
    try {
      words = JSON.parse(el.dataset.bandWords || "[]");
    } catch {
      words = [];
    }

    // Multi-word: pin the span to the widest word so the line never re-centres,
    // then stroke only to the FIRST word's ratio so the purple fits the word.
    let maxWidth = 0;
    const wordWidths: number[] = [];

    if (words.length > 1) {
      const original = text.textContent;
      for (const w of words) {
        text.textContent = w;
        const ww = el.getBoundingClientRect().width;
        wordWidths.push(ww);
        maxWidth = Math.max(maxWidth, ww);
      }
      text.textContent = original;
      gsap.set(el, { width: maxWidth });
    }

    const firstPct =
      maxWidth > 0 ? `${(wordWidths[0] / maxWidth) * 100}% 100%` : "100% 100%";

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

    tl.to(
      el,
      {
        backgroundSize: firstPct,
        duration: BAND_STROKE,
        ease: "power2.inOut",
      },
      at,
    ).to(
      text,
      { opacity: 1, duration: BAND_INK, ease: "power1.out" },
      at + BAND_STROKE - BAND_INK,
    );

    if (words.length > 1) {
      tl.call(
        () => rotate(el, text, words, maxWidth, wordWidths),
        undefined,
        at + BAND_STROKE,
      );
    }
  },
};

/**
 * Rotate the banded word forever, replaying the band move for each one.
 *
 * The span is pinned to the widest word so the h2 never re-centres, but the
 * purple `backgroundSize` adapts to each word — it strokes only as far as the
 * word's ratio of the pinned width. A resize listener re-measures so
 * breakpoint steps are picked up live.
 */
function rotate(
  el: HTMLElement,
  text: HTMLElement,
  words: string[],
  maxWidth: number,
  wordWidths: number[],
) {
  let i = 0;

  const remeasure = () => {
    const original = text.textContent;
    gsap.set(el, { width: "auto" });
    maxWidth = 0;
    wordWidths.length = 0;
    for (const w of words) {
      text.textContent = w;
      const ww = el.getBoundingClientRect().width;
      wordWidths.push(ww);
      maxWidth = Math.max(maxWidth, ww);
    }
    text.textContent = original;
    gsap.set(el, { width: maxWidth });
  };

  window.addEventListener("resize", remeasure);

  const cycle = () => {
    const nextIdx = (i + 1) % words.length;
    const next = words[nextIdx];
    const pct = `${(wordWidths[nextIdx] / maxWidth) * 100}% 100%`;

    gsap
      .timeline({
        onComplete: () => {
          i = nextIdx;
          cycle();
        },
      })
      .to(text, {
        opacity: 0,
        duration: BAND_INK * 0.6,
        ease: "power1.in",
        delay: BAND_HOLD,
      })
      .to(el, {
        backgroundSize: "0% 100%",
        duration: BAND_RETRACT,
        ease: "power2.inOut",
      })
      .add(() => {
        text.textContent = next;
      })
      .to(el, {
        backgroundSize: pct,
        duration: BAND_STROKE,
        ease: "power2.inOut",
      })
      .to(
        text,
        { opacity: 1, duration: BAND_INK, ease: "power1.out" },
        `-=${BAND_INK}`,
      );
  };

  cycle();
}

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
