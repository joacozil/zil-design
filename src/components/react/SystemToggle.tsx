import { useEffect, useRef, useState } from "react";

interface Bar {
  h: number;
  color: string;
  stat: string;
  label: string;
  statColor: string;
  labelColor: string;
  /** Supporting line under the label. Only the ON state argues its numbers. */
  phrase?: string;
}

const OFF = {
  bg: "#f3f3f5",
  title: "Sin sistema, el esfuerzo se diluye.",
  titleColor: "#6b6b6b",
  body: "Las piezas sueltas no acumulan: cada comunicación empieza de cero y el mercado no te recuerda.",
  bodyColor: "#a1a1a8",
  bars: [
    { h: 70, color: "#d4d4d8", stat: "2%", label: "Recordación", statColor: "#a1a1a8", labelColor: "#c7c7cc" },
    { h: 65, color: "#c7c7cc", stat: "0.8%", label: "Conversión", statColor: "#a1a1a8", labelColor: "#b0b0b5" },
    { h: 72, color: "#d4d4d8", stat: "3×", label: "Costo x lead", statColor: "#a1a1a8", labelColor: "#c7c7cc" },
  ] as Bar[],
};

const ON = {
  bg: "#4b256e",
  title: "El orden visual se mide en resultados.",
  titleColor: "#ffffff",
  body: "Cada pieza alineada al sistema deja de ser un gasto y pasa a construir valor percibido.",
  bodyColor: "#e7d5ff",
  bars: [
    {
      h: 55,
      color: "#9747ff",
      stat: "32%",
      label: "+ de ingresos",
      statColor: "#ffffff",
      labelColor: "rgba(255,255,255,0.6)",
      phrase:
        "El diseño personalizado y estratégico acelera tu crecimiento ante competidores que usan fórmulas genéricas.",
    },
    {
      h: 75,
      color: "#e7d5ff",
      stat: "65%",
      label: "+ de impacto",
      statColor: "#4b256e",
      labelColor: "rgba(75,37,110,0.5)",
      phrase:
        "El diseño estratégico transforma tu comunicación en un activo visual que eleva la retención de tu propuesta.",
    },
    {
      h: 100,
      color: "#c2fe2d",
      stat: "75%",
      label: "+ de credibilidad",
      statColor: "#4b256e",
      labelColor: "rgba(75,37,110,0.5)",
      phrase:
        "Los clientes juzgan la credibilidad y solidez de una empresa basándose en una identidad visual sólida.",
    },
  ] as Bar[],
};

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
        className="sticky top-0 flex h-svh flex-col overflow-hidden transition-[background-color] duration-500 ease-out motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-svh"
        style={{ backgroundColor: s.bg }}
      >
        {/* Text — compact, left-aligned */}
        <div className="mx-auto w-full max-w-8xl shrink-0 px-6 pt-24 pb-6 tablet:px-8 tablet:pt-28 tablet:pb-8 desktop:px-12">
          <h2
            className="max-w-[18ch] text-h1 text-balance transition-colors duration-400 ease-out"
            style={{ color: s.titleColor }}
          >
            {s.title}
          </h2>
          <p
            className="mt-4 max-w-[42rem] text-p text-balance transition-colors duration-400 ease-out tablet:text-p-lg"
            style={{ color: s.bodyColor }}
          >
            {s.body}
          </p>
        </div>

        {/* Brutalist bars — grow to fill the remaining viewport and run to the
            very bottom edge: no pb, so the chart is a plinth the section stands
            on rather than a floating figure. */}
        <div className="mx-auto flex w-full max-w-8xl flex-1 items-end gap-1.5 px-6 tablet:gap-3 tablet:px-8 desktop:gap-4 desktop:px-12">
          {s.bars.map((bar, i) => (
            <div
              key={i}
              className="relative flex-1 transition-all duration-[600ms] ease-out"
              style={{
                height: `${bar.h}%`,
                background: bar.color,
              }}
            >
              <div className="absolute inset-x-0 top-0 p-2.5 tablet:p-6 desktop:p-8">
                <span
                  className="block text-h2 leading-none transition-colors duration-400 ease-out"
                  style={{ color: bar.statColor }}
                >
                  {bar.stat}
                </span>
                {/* Chart axis label, not prose — deliberately OUTSIDE the type
                    scale. A mobile column is only ~86px of content, and at
                    text-p-sm "Recordación" splits mid-word across two lines;
                    11px keeps every label on one. */}
                <span
                  className="mt-1.5 block text-[0.6875rem] leading-tight font-bold tracking-[0.06em] uppercase transition-colors duration-400 ease-out tablet:mt-2 tablet:text-p-sm"
                  style={{ color: bar.labelColor }}
                >
                  {bar.label}
                </span>
                {/* The argument for the number — desktop only: a mobile/tablet
                    column is too narrow for prose, so those keep just
                    number + label. */}
                {bar.phrase && (
                  <p
                    className="mt-3 hidden text-p-sm leading-snug text-pretty transition-colors duration-400 ease-out desktop:block"
                    style={{ color: bar.statColor }}
                  >
                    {bar.phrase}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
