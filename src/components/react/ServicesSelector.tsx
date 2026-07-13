import { useState } from "react";

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

/**
 * Services selector. Left: a list of services; right: a themed card describing
 * the active one. Hover / focus / click all set the active service (hover for
 * pointer devices, tap + keyboard for everyone else). On mobile the two stack.
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
    <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2 desktop:gap-12">
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

      {/* Card (themed by the active service's variant) */}
      <div className={`flex rounded-2xl p-8 desktop:p-10 ${v.card}`}>
        <div
          key={active}
          className="flex w-full animate-fade-up flex-col justify-between gap-12 motion-reduce:animate-none"
        >
          <img
            src={current.icon}
            alt=""
            aria-hidden="true"
            className="h-30 w-auto shrink-0 object-contain object-left desktop:h-48"
          />
          <div>
            <h3
              className={`text-h5 font-bold tracking-wide uppercase ${v.kicker}`}
            >
              {current.name}
            </h3>
            <p className={`mt-3 max-w-[38ch] text-p text-pretty ${v.text}`}>
              {current.text}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {current.badges.map((badge) => (
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
        </div>
      </div>
    </div>
  );
}
