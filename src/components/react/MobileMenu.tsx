import { useEffect, useState } from "react";
import { NAV_LINKS } from "../../config/nav";

/**
 * Mobile / tablet navigation: an animated hamburger that toggles a full-screen
 * slide-in menu. Hidden on desktop (the inline nav takes over there).
 *
 * Interactive, so it lives as a React island. Motion is CSS-transition based
 * (transform + opacity) and fully disabled under prefers-reduced-motion.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Lock body scroll + close on Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="desktop:hidden">
      {/* Hamburger → X */}
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 -mr-2 flex h-10 w-10 items-center justify-center"
      >
        <span
          className={`absolute h-0.5 w-6 rounded-full bg-text transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "rotate-45" : "-translate-y-[6px]"
          }`}
        />
        <span
          className={`absolute h-0.5 w-6 rounded-full bg-text transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute h-0.5 w-6 rounded-full bg-text transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "-rotate-45" : "translate-y-[6px]"
          }`}
        />
      </button>

      {/* Full-screen overlay menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-surface transition-[opacity,transform] duration-[400ms] ease-out motion-reduce:transition-none ${
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full opacity-0"
        }`}
      >
        <nav
          aria-label="Principal"
          className="flex h-full flex-col items-start justify-center gap-2 px-8"
        >
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-h3 font-medium text-text transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
