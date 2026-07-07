export interface NavLink {
  label: string;
  href: string;
}

/**
 * Primary navigation. Placeholder internal links for the one-page landing —
 * TODO: confirm final labels/targets once sections are built.
 */
export const NAV_LINKS: NavLink[] = [
  { label: "Trabajo", href: "#work" },
  { label: "Servicios", href: "#servicios" },
  { label: "Filosofía", href: "#claim" },
  { label: "Contacto", href: "#cta" },
];
