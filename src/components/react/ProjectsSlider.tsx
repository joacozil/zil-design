import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";

export interface Project {
  src: string;
  name: string;
  category: string;
}

function Arrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Anterior" : "Siguiente"}
      className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border text-text transition-colors duration-200 hover:border-primary disabled:pointer-events-none disabled:opacity-30"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={direction === "prev" ? "rotate-180" : ""}
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

/**
 * Projects carousel (Embla). Full-bleed: the track runs to the screen edge while
 * the first card and the controls stay aligned with the standard container.
 * Slides are sized by flex-basis so ~1.1 / 1.6 / 2.1 cards show across
 * mobile / tablet / desktop with a peek of the next.
 */
export default function ProjectsSlider({ projects }: { projects: Project[] }) {
  const firstSlide = useRef<HTMLLIElement>(null);

  // Every slide comes to rest at the container's content edge, so the active card
  // lines up with the section heading above it. `start` alignment can't do this:
  // it snaps each slide to the VIEWPORT edge, which on this full-bleed track is
  // the screen edge — leaving only slide 0 aligned (by its own margin) and every
  // later slide one gutter too far left. Offsetting each snap by the gutter fixes
  // all of them at once.
  //
  // The offset is read off slide 0's `ml-[var(--gutter)]` rather than re-deriving
  // the calc in JS: global.css stays the only definition of the gutter, and the
  // two can't drift, since `containScroll` pins the opening snap to the natural
  // scroll origin and therefore to exactly that margin. Re-runs on every reInit,
  // so it re-measures when the gutter steps at a breakpoint.
  const alignToGutter = useCallback(() => {
    const el = firstSlide.current;
    return el ? parseFloat(getComputedStyle(el).marginLeft) || 0 : 0;
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: alignToGutter,
    containScroll: "trimSnaps",
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  const onScroll = useCallback((api: EmblaCarouselType) => {
    setProgress(Math.min(1, Math.max(0, api.scrollProgress())));
  }, []);

  const onReInit = useCallback(
    (api: EmblaCarouselType) => {
      setSnapCount(api.scrollSnapList().length);
      onSelect(api);
      onScroll(api);
    },
    [onSelect, onScroll],
  );

  useEffect(() => {
    if (!emblaApi) return;
    onReInit(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onReInit);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi, onSelect, onScroll, onReInit]);

  const thumbWidth = snapCount > 0 ? 100 / snapCount : 100;
  const thumbLeft = progress * (100 - thumbWidth);

  return (
    <div>
      {/* Full-bleed track: starts aligned with content (left gutter) and runs to
          the screen edge; the last snap stops at the content edge (right gutter). */}
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="flex gap-4 tablet:gap-6">
          {projects.map((project, i) => (
            <li
              key={i}
              ref={i === 0 ? firstSlide : undefined}
              className={`min-w-0 shrink-0 grow-0 basis-[76%] tablet:basis-[48%] desktop:basis-[34%] ${i === 0 ? "ml-[var(--gutter)]" : ""} ${i === projects.length - 1 ? "mr-[var(--gutter)]" : ""}`}
            >
              <div className="aspect-[3/2] overflow-hidden rounded-lg bg-surface-inverse">
                <img
                  src={project.src}
                  alt={project.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <span className="text-p font-medium text-text">
                  {project.name}
                </span>
                <span className="text-p-sm text-muted">{project.category}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Controls stay within the standard container. */}
      <div className="mx-auto mt-10 flex w-full max-w-8xl items-center justify-between gap-6 px-6 tablet:px-8 desktop:px-12">
        <div className="relative h-[3px] w-full max-w-xs overflow-hidden rounded-full bg-border">
          <span
            className="absolute top-0 h-full rounded-full bg-text"
            style={{ width: `${thumbWidth}%`, left: `${thumbLeft}%` }}
          />
        </div>
        <div className="flex items-center gap-3">
          <Arrow
            direction="prev"
            disabled={!canPrev}
            onClick={() => emblaApi?.scrollPrev()}
          />
          <Arrow
            direction="next"
            disabled={!canNext}
            onClick={() => emblaApi?.scrollNext()}
          />
        </div>
      </div>
    </div>
  );
}
