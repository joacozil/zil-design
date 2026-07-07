import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

export interface ClientLogo {
  src: string;
  alt: string;
}

/**
 * Continuous, infinitely-looping logo marquee for mobile. Uses Embla + the
 * AutoScroll plugin. Auto-scroll is disabled under prefers-reduced-motion
 * (the row is still draggable). Tablet / desktop render a static row instead.
 */
export default function ClientsMarquee({ logos }: { logos: ClientLogo[] }) {
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
            className="flex shrink-0 grow-0 basis-auto items-center px-8"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-6 w-auto opacity-60"
              draggable={false}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
