export interface NavLink {
  label: string;
  href: string;
}

/**
 * Primary navigation. Placeholder internal links for the one-page landing —
 * TODO: confirm final labels/targets once sections are built.
 */
export const NAV_LINKS: NavLink[] = [
  { label: "Proyectos", href: "#work" },
  { label: "Cómo trabajamos", href: "#how-we-work" },
  { label: "Servicios", href: "#servicios" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#cta" },
];
