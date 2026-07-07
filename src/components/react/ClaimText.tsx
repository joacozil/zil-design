import { Fragment, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Props {
  /** The full claim. Split on spaces; each token animates independently. */
  text: string;
  /** Note: pass as `className` from Astro — `class` is reserved by the island wrapper. */
  className?: string;
}

/**
 * Scroll-scrubbed word-by-word reveal. Each word starts faded and fills to full
 * ink as the section scrolls through the viewport.
 *
 * The faded state is applied by JS (not CSS), so without JS — or under
 * prefers-reduced-motion — the text renders fully legible at full opacity.
 */
export default function ClaimText({ text, className = "" }: Props) {
  const root = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const section = root.current?.closest("section");
      if (!section) return;

      const spans = gsap.utils.toArray<HTMLElement>(
        "[data-word]",
        root.current,
      );
      gsap.set(spans, { opacity: 0.2 });
      gsap.to(spans, {
        opacity: 1,
        ease: "none",
        stagger: 0.5,
        scrollTrigger: {
          // Pin the section while the words fill in. Pinning holds the (centered)
          // text in view for the whole reveal, so the animation is actually seen
          // as you scroll — and it gets its own scroll distance regardless of what
          // sits above or below it.
          trigger: section,
          start: "top top",
          end: "+=80%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });
    },
    { scope: root },
  );

  return (
    <p ref={root} className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span data-word className="inline-block">
            {word}
          </span>{" "}
        </Fragment>
      ))}
    </p>
  );
}
