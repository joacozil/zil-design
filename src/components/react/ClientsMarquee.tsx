import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

export interface ClientLogo {
  src: string;
  alt: string;
  /** Per-logo height class, e.g. "h-7". May be a breakpoint chain
   *  ("h-5 tablet:h-7") where the mark needs to step — see Hero's `logos`. */
  h: string;
  /** Intrinsic width/height ratio. Required by the `violet` tone, which draws
   *  the mark as a masked box instead of an <img> and so cannot read the
   *  ratio from the file itself. */
  ratio?: number;
}

/** How the (dark) source marks are rendered, named for the surface they sit on.
 *  Every value is a full class string rather than a boolean, so a tone can step
 *  at a breakpoint if a surface ever changes across one (a `tone` prop is
 *  resolved on the server and cannot step on its own). */
const TONES = {
  /** Muted grey, for light surfaces. */
  dark: "opacity-60",
  /** Flattened to white, for dark surfaces. */
  light: "opacity-75 brightness-0 invert",
  /** Solid brand light-violet, for the Hero's deep violet stage. Not a filter:
   *  no filter chain can target `--color-primary-light` without hard-coding the
   *  colour, so this tone renders each mark as a mask-clipped box painted with
   *  the token itself (see the render below) and stays themable from
   *  global.css alone. Logos need `ratio` for this tone. */
  violet: "bg-primary-light",
} as const;

export type ClientsMarqueeTone = keyof typeof TONES;

/**
 * Continuous, infinitely-looping logo marquee (all breakpoints). Uses Embla +
 * the AutoScroll plugin. Auto-scroll is disabled under prefers-reduced-motion
 * (the row is still draggable).
 */
export default function ClientsMarquee({
  logos,
  tone = "dark",
}: {
  logos: ClientLogo[];
  tone?: ClientsMarqueeTone;
}) {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({
      playOnInit: !reduceMotion,
      speed: 1,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    }),
  ]);

  // Duplicate so the track always overflows the viewport and loops seamlessly.
  const items = [...logos, ...logos, ...logos];

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <ul className="flex items-center">
        {items.map((logo, i) => (
          <li
            key={i}
            className="flex shrink-0 grow-0 basis-auto items-center px-6 tablet:px-8 desktop:px-12"
          >
            {tone === "violet" ? (
              <span
                role="img"
                aria-label={logo.alt}
                className={`block ${logo.h} ${TONES[tone]}`}
                style={{
                  aspectRatio: `${logo.ratio ?? 1}`,
                  WebkitMaskImage: `url(${logo.src})`,
                  maskImage: `url(${logo.src})`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            ) : (
              <img
                src={logo.src}
                alt={logo.alt}
                className={`${logo.h} w-auto ${TONES[tone]}`}
                draggable={false}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
