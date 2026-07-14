import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../../config/nav";

export default function MobileMenu({ logoSrc }: { logoSrc: string }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const linkCount = NAV_LINKS.length;
  const stagger = 60;
  const baseDelay = 100;
  const linksFadeOut = (linkCount - 1) * stagger + 300;
  const overlayFade = 350;

  const doOpen = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const doClose = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
    timer.current = setTimeout(
      () => setOpen(false),
      linksFadeOut + overlayFade,
    );
  }, [linksFadeOut, overlayFade]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") doClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [open, doClose]);

  if (!open) {
    return (
      <div className="desktop:hidden">
        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={false}
          aria-controls="mobile-menu"
          onClick={doOpen}
          className="relative z-50 -mr-2 flex h-10 w-10 items-center justify-center"
        >
          <span className="absolute h-0.5 w-6 -translate-y-[6px] rounded-full bg-text transition-transform duration-300 ease-out motion-reduce:transition-none" />
          <span className="absolute h-0.5 w-6 rounded-full bg-text opacity-100 transition-opacity duration-300 ease-out motion-reduce:transition-none" />
          <span className="absolute h-0.5 w-6 translate-y-[6px] rounded-full bg-text transition-transform duration-300 ease-out motion-reduce:transition-none" />
        </button>
      </div>
    );
  }

  return (
    <div className="desktop:hidden">
      <button
        type="button"
        aria-label="Cerrar menú"
        aria-expanded={true}
        aria-controls="mobile-menu"
        onClick={doClose}
        className="relative z-50 -mr-2 flex h-10 w-10 items-center justify-center"
      >
        <span
          className={`absolute h-0.5 w-6 rounded-full bg-text transition-transform duration-300 ease-out motion-reduce:transition-none ${visible ? "rotate-45" : "-translate-y-[6px]"}`}
        />
        <span
          className={`absolute h-0.5 w-6 rounded-full bg-text transition-opacity duration-300 ease-out motion-reduce:transition-none ${visible ? "opacity-0" : "opacity-100"}`}
        />
        <span
          className={`absolute h-0.5 w-6 rounded-full bg-text transition-transform duration-300 ease-out motion-reduce:transition-none ${visible ? "-rotate-45" : "translate-y-[6px]"}`}
        />
      </button>

      <div
        id="mobile-menu"
        className="fixed inset-0 z-40 motion-reduce:transition-none"
        style={{
          backgroundColor: "var(--color-surface)",
          opacity: visible ? 1 : 0,
          transition: `opacity ${overlayFade}ms ease-out`,
          transitionDelay: visible ? "0ms" : `${linksFadeOut}ms`,
        }}
      >
        <nav
          aria-label="Principal"
          className="flex h-full flex-col items-start justify-center gap-8 px-8"
        >
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                doClose();
                const href = link.href;
                setTimeout(() => {
                  const target = document.querySelector(href);
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }, linksFadeOut + overlayFade);
              }}
              className="text-h3 font-medium text-text motion-reduce:transition-none"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(1rem)",
                transition: "opacity 300ms ease-out, transform 300ms ease-out",
                transitionDelay: visible
                  ? `${baseDelay + i * stagger}ms`
                  : `${(linkCount - 1 - i) * stagger}ms`,
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div
          className="absolute bottom-10 left-8 motion-reduce:transition-none"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(1rem)",
            transition: "opacity 300ms ease-out, transform 300ms ease-out",
            transitionDelay: visible
              ? `${baseDelay + linkCount * stagger}ms`
              : "0ms",
          }}
        >
          <img src={logoSrc} alt="Zil Design" className="h-8 w-auto" />
        </div>
      </div>
    </div>
  );
}
