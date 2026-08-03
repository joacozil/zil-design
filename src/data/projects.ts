import type { ImageMetadata } from "astro";
import mmg from "../assets/img/mmg.jpg";
import quantia from "../assets/img/quantia.jpg";
import clojure from "../assets/img/clojure.jpg";
import gelato from "../assets/img/gelato.jpg";
import advantia from "../assets/img/advantia.jpg";
import netValue from "../assets/img/net-value.jpg";

/**
 * The project roster — the single source of truth shared by the homepage slider
 * (`sections/Projects.astro`) and the "Otros proyectos" closer that ends every
 * project page (`project/ProjectEnd.astro`). Add a project once here and it shows
 * up in both. `slug` is set only for projects that have a case-study page under
 * `/proyectos/`; the rest render as non-clickable cards until their page exists.
 */
export interface ProjectEntry {
  img: ImageMetadata;
  name: string;
  category: string;
  /** URL slug under /proyectos/. Omit for projects without a page yet. */
  slug?: string;
}

// TODO: confirm final categories from Figma.
export const projects: ProjectEntry[] = [
  { img: clojure, name: "Clojure", category: "Branding", slug: "clojure" },
  { img: quantia, name: "Quantia", category: "Producto Digital" },
  { img: mmg, name: "MMG Bank", category: "Institucional" },
  { img: advantia, name: "Advantia", category: "Institucional" },
  { img: netValue, name: "Net Value", category: "Branding" },
  { img: gelato, name: "Gelato", category: "Branding", slug: "gelato" },
];
