import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";

// Each service card renders in one of four themes — all built from our color
// tokens. The active service's variant themes the whole card (bg, kicker, body
// text and badges). The icon keeps its own colors.
const VARIANTS = {
  lilac: {
    card: "bg-primary-light",
    kicker: "text-primary-dark",
    text: "text-text",
    badge: "bg-primary-dark text-text-inverse",
  },
  dark: {
    card: "bg-primary-dark",
    kicker: "text-text-inverse",
    text: "text-text-inverse",
    badge: "bg-accent text-primary-dark",
  },
  lime: {
    card: "bg-accent",
    kicker: "text-primary",
    text: "text-text",
    badge: "bg-primary text-text-inverse",
  },
  primary: {
    card: "bg-primary",
    kicker: "text-text-inverse",
    text: "text-text-inverse",
    badge: "bg-surface text-primary-dark",
  },
} as const;

export type ServiceVariant = keyof typeof VARIANTS;

export interface Service {
  name: string;
  icon: string; // icon src, shown in its own colors
  text: string;
  badges: string[];
  variant: ServiceVariant;
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/** Slider arrow — same shape/treatment as the projects carousel controls. */
function Arrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Anterior" : "Siguiente"}
      className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-text transition-colors duration-200 hover:border-primary"
    >
      <Chevron className={direction === "prev" ? "rotate-180" : ""} />
    </button>
  );
}

/** Inner card content, shared by the desktop card and the slider cards. */
function CardBody({ service }: { service: Service }) {
  const v = VARIANTS[service.variant];
  return (
    <>
      <img
        src={service.icon}
        alt=""
        aria-hidden="true"
        className="h-30 w-auto shrink-0 object-contain object-left desktop:h-48"
      />
      <div>
        <h3 className={`text-h5 font-bold tracking-wide uppercase ${v.kicker}`}>
          {service.name}
        </h3>
        <p className={`mt-3 max-w-[38ch] text-p text-pretty ${v.text}`}>
          {service.text}
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {service.badges.map((badge) => (
            <li key={badge}>
              <span
                className={`inline-flex rounded-full px-4 py-2 text-p-sm font-bold tracking-wide uppercase ${v.badge}`}
              >
                {badge}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/**
 * Mobile / tablet: one card per slide, with the active service's name between
 * the prev / next controls. Slides sit in a single flex row, so every card
 * stretches to the tallest one — the height never jumps between services.
 */
function ServicesCarousel({ services }: { services: Service[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center", loop: true });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelected(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="flex items-stretch gap-4">
          {services.map((service) => (
            <li
              key={service.name}
              className="min-w-0 shrink-0 grow-0 basis-full"
            >
              <div
                className={`flex h-full flex-col justify-between gap-10 rounded-2xl p-8 ${VARIANTS[service.variant].card}`}
              >
                <CardBody service={service} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Controls: active service name on the left, arrows grouped on the right. */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <span
          aria-live="polite"
          className="min-w-0 truncate text-h3 font-medium text-text"
        >
          {services[selected]?.name}
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <Arrow direction="prev" onClick={() => emblaApi?.scrollPrev()} />
          <Arrow direction="next" onClick={() => emblaApi?.scrollNext()} />
        </div>
      </div>
    </div>
  );
}

/**
 * Services selector. On desktop: a list of services on the left and a themed
 * card describing the active one on the right (hover / focus / click all set the
 * active service). On mobile & tablet it becomes a card slider instead, since
 * the two-column layout has no room and there is no hover on touch.
 */
export default function ServicesSelector({
  services,
}: {
  services: Service[];
}) {
  const [active, setActive] = useState(0);
  const current = services[active];
  const v = VARIANTS[current.variant];

  return (
    <>
      {/* Mobile & tablet — slider */}
      <div className="desktop:hidden">
        <ServicesCarousel services={services} />
      </div>

      {/* Desktop — list + themed card */}
      <div className="hidden desktop:grid desktop:grid-cols-2 desktop:gap-12">
        {/* List — rows flex-grow so the list's total height matches the card. */}
        <ul className="flex flex-col border-t border-border/70">
          {services.map((service, i) => {
            const isActive = i === active;
            return (
              <li key={service.name} className="flex flex-1">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className={`flex w-full items-center justify-between border-b border-border/70 py-5 text-left text-h3 transition-colors duration-200 tablet:py-6 ${
                    isActive
                      ? "font-medium text-text"
                      : "text-muted hover:text-text"
                  }`}
                >
                  <span>{service.name}</span>
                  <Chevron
                    className={`shrink-0 transition-transform duration-200 ${
                      isActive ? "translate-x-1 text-primary" : "text-muted"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Card (themed by the active service's variant). ALL services render
            stacked in the same grid cell — inactive ones are invisible but still
            take up space, so the card is always as tall as the tallest content
            and never resizes (no layout shift / hover flicker) when switching. */}
        <div className={`grid rounded-2xl p-8 desktop:p-10 ${v.card}`}>
          {services.map((service, i) => {
            const isActive = i === active;
            return (
              <div
                // Key flips with active state so the fade-up replays on switch.
                key={`${service.name}-${isActive ? "on" : "off"}`}
                aria-hidden={!isActive}
                className={`col-start-1 row-start-1 flex w-full flex-col justify-between gap-12 ${
                  isActive
                    ? "animate-fade-up motion-reduce:animate-none"
                    : "invisible"
                }`}
              >
                <CardBody service={service} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
