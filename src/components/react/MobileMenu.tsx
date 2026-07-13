import { useEffect, useRef, useState } from "react";
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
  const [closing, setClosing] = useState(false);
  const closingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const linkCount = NAV_LINKS.length;
  const staggerMs = 60;
  const staggerBase = 120;
  const closeDuration = staggerBase + (linkCount - 1) * staggerMs + 300;

  function handleClose() {
    if (closing) return;
    setClosing(true);
    closingTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, closeDuration);
  }

  function handleToggle() {
    if (open && !closing) {
      handleClose();
    } else if (!open) {
      setOpen(true);
    }
  }

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      if (closingTimer.current) clearTimeout(closingTimer.current);
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
        onClick={handleToggle}
        className="relative z-50 -mr-2 flex h-10 w-10 items-center justify-center"
      >
        <span
          className={`absolute h-0.5 w-6 rounded-full bg-text transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open && !closing ? "rotate-45" : "-translate-y-[6px]"
          }`}
        />
        <span
          className={`absolute h-0.5 w-6 rounded-full bg-text transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            open && !closing ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute h-0.5 w-6 rounded-full bg-text transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open && !closing ? "-rotate-45" : "translate-y-[6px]"
          }`}
        />
      </button>

      {/* Full-screen overlay menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-surface transition-[opacity,transform] duration-[400ms] ease-out motion-reduce:transition-none ${
          open && !closing
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full opacity-0"
        }`}
        style={closing ? { transitionDelay: `${closeDuration - 400}ms` } : undefined}
      >
        <nav
          aria-label="Principal"
          className="flex h-full flex-col items-start justify-center gap-2 px-8"
        >
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleClose();
                const target = document.querySelector(link.href);
                if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), closeDuration);
              }}
              className={`text-h3 font-medium text-text transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
                open && !closing ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{
                transitionDelay: open && !closing
                  ? `${staggerBase + i * staggerMs}ms`
                  : `${(linkCount - 1 - i) * staggerMs}ms`,
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
