import { useEffect, useRef, useState } from "react";

const OFF = {
  bg: "#f3f3f5",
  kicker: "Sin dirección visual",
  kickerColor: "#a1a1a8",
  title: "Sin sistema, el esfuerzo se diluye.",
  titleColor: "#6b6b6b",
  body: "Las piezas sueltas no acumulan: cada comunicación empieza de cero y el mercado no te recuerda.",
  bodyColor: "#a1a1a8",
  bars: [
    { h: 72, color: "#d4d4d8" },
    { h: 60, color: "#c7c7cc" },
    { h: 68, color: "#d4d4d8" },
    { h: 52, color: "#b9b9bf" },
    { h: 64, color: "#c7c7cc" },
    { h: 54, color: "#d4d4d8" },
    { h: 58, color: "#b9b9bf" },
  ],
  divider: "#e5e5e5",
  icon: "#a1a1a8",
  label: "Impacto disperso",
  labelColor: "#a1a1a8",
};

const ON = {
  bg: "#4b256e",
  kicker: "Diseño que rinde",
  kickerColor: "#c2fe2d",
  title: "El orden visual se mide en resultados.",
  titleColor: "#ffffff",
  body: "Cada pieza alineada al sistema deja de ser un gasto y pasa a construir valor percibido.",
  bodyColor: "#e7d5ff",
  bars: [
    { h: 28, color: "rgba(231,213,255,0.2)" },
    { h: 52, color: "rgba(231,213,255,0.35)" },
    { h: 80, color: "rgba(231,213,255,0.5)" },
    { h: 110, color: "#e7d5ff" },
    { h: 140, color: "#9747ff" },
    { h: 172, color: "#9747ff" },
    { h: 200, color: "#c2fe2d" },
  ],
  divider: "rgba(231,213,255,0.25)",
  icon: "#c2fe2d",
  label: "Valor percibido de tu marca",
  labelColor: "#e7d5ff",
};

/**
 * Scroll-driven one-way switch. The runway is 2 viewports tall; the stage
 * sticks to the top for the first viewport of scroll (same sticky pattern as
 * MetodoZil — the browser pins, no JS scroll writes). Halfway through the
 * pinned stretch the section flips from "sin sistema" to "con sistema" and
 * LATCHES: the listener detaches on fire, so scrolling back up never replays
 * the argument backwards. Reduced-motion readers land directly on the final
 * state — the ordered system — with no choreography.
 */
export default function SystemToggle() {
  const [on, setOn] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }

    const onScroll = () => {
      const runway = el.offsetHeight - window.innerHeight;
      const progress = -el.getBoundingClientRect().top / runway;
      if (progress >= 0.5) {
        setOn(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const s = on ? ON : OFF;

  return (
    <div ref={root} className="relative h-[200svh] motion-reduce:h-auto">
      <div
        className="sticky top-0 flex min-h-svh flex-col justify-center transition-[background-color] duration-500 ease-out motion-reduce:static"
        style={{ backgroundColor: s.bg }}
      >
        {/* Mobile: pb exceeds pt by ~the ContactDrawer's collapsed height, so the
            centred composition sits in the area the drawer leaves visible. From
            tablet up the drawer is gone and the padding is symmetric again. */}
        <div className="mx-auto flex w-full max-w-8xl flex-col gap-8 px-6 pt-12 pb-32 tablet:gap-16 tablet:px-8 tablet:py-16 desktop:px-12">
          {/* Text */}
          <div className="flex flex-col items-center gap-5 text-center tablet:gap-7">
            <span
              className="text-[0.8125rem] font-bold tracking-[0.08em] uppercase transition-colors duration-400 ease-out"
              style={{ color: s.kickerColor }}
            >
              {s.kicker}
            </span>
            <h2
              className="max-w-[18ch] text-h1 text-balance transition-colors duration-400 ease-out"
              style={{ color: s.titleColor }}
            >
              {s.title}
            </h2>
            <p
              className="max-w-[42rem] text-p text-balance transition-colors duration-400 ease-out tablet:text-p-lg"
              style={{ color: s.bodyColor }}
            >
              {s.body}
            </p>
          </div>

          {/* Bar chart */}
          <div className="mx-auto w-full max-w-[600px]">
            <div className="flex flex-col gap-5">
              {/* Bar heights are fractions of the track so the chart can shrink
                  on mobile (where the ContactDrawer eats viewport) without
                  retuning every bar. 200px is the design height; the mobile
                  track is just a smaller multiple of the same ratios. */}
              <div className="flex h-[120px] items-end justify-center gap-3 tablet:h-[200px] tablet:gap-5">
                {s.bars.map((bar, i) => (
                  <div
                    key={i}
                    className="max-w-[72px] flex-1 transition-all duration-[550ms] ease-out"
                    style={{
                      height: `${(bar.h / 200) * 100}%`,
                      background: bar.color,
                    }}
                  />
                ))}
              </div>
              <div
                className="flex items-center justify-center gap-2.5 border-t pt-4 transition-[border-color] duration-400 ease-out"
                style={{ borderColor: s.divider }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="transition-colors duration-400 ease-out"
                  style={{ color: s.icon }}
                >
                  <path
                    d="M3 17l6-6 4 4 8-8M15 7h6v6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="text-[0.8125rem] font-bold tracking-[0.08em] uppercase transition-colors duration-400 ease-out"
                  style={{ color: s.labelColor }}
                >
                  {s.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
