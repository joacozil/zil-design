/**
 * El roster de servicios: una entrada por página de servicio, y la única fuente
 * de verdad para las tres cosas que tienen que coincidir entre sí — el nav del
 * footer (`components/astro/Footer.astro`), el `serviceType` / `hasPart` del
 * JSON-LD (`layouts/Layout.astro`) y la lista de URLs del sitemap
 * (`pages/sitemap.xml.ts`). Agregar un servicio acá lo suma a los tres.
 *
 * Mismo criterio que `data/projects.ts`, y por la misma razón: cuando la lista
 * vive repetida en cada consumidor, el día que se agrega una página aparece en
 * el footer y no en el sitemap, o al revés, y nadie se entera hasta que Google
 * deja de traerla.
 *
 * ── POR QUÉ ESTAS PÁGINAS Y NO OTRAS ─────────────────────────────────────────
 * Salen del mapa de keywords (Argentina, español, Keyword Planner + Search
 * Console): 5.286 ideas filtradas a las 294 desde las que se contrata a un
 * estudio, agrupadas por intención. `winnable` es el volumen mensual de esa
 * página que está en competencia ≤45, que es lo que un sitio chico puede pelear.
 *
 * Deliberadamente NO hay página de social media: es el cluster más grande del
 * mapa (46.980/mes) y el que menos sirve — sólo 1,3% es ganable y sus términos
 * baratos son "busco community manager" y "se busca community manager", o sea
 * gente buscando EMPLEO, no gente contratando un estudio. Social media se queda
 * como servicio en la home y no tiene página propia.
 */

/**
 * Una pregunta del acordeón. Vive acá y no en `sections/FAQ.astro` porque la
 * MISMA lista alimenta dos cosas que no pueden divergir: lo que el lector ve y
 * el `FAQPage` del structured data. Declararle a Google una pregunta que no está
 * en la página es de las pocas cosas que penaliza de forma explícita.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export interface ServiceEntry {
  /** Slug bajo /design/. */
  slug: string;
  /** Etiqueta en el nav del footer. Corta: la columna es angosta. */
  navLabel: string;
  /** El `serviceType` que declara el JSON-LD de la home. */
  schemaType: string;
  /** Keyword principal, la que manda en el <title> y en el H1. */
  primaryKeyword: string;
  /** Búsquedas/mes en competencia ≤45 que cubre la página. */
  winnable: number;
}

export const SERVICES: ServiceEntry[] = [
  {
    slug: "identidad-de-marca",
    navLabel: "Identidad de marca",
    schemaType: "Diseño de identidad de marca",
    primaryKeyword: "identidad visual",
    winnable: 1400,
  },
  {
    // La keyword más ganable de todo el mapa, y hasta ahora era una SECCIÓN
    // adentro de identidad de marca en vez de una página. "Manual de marca" son
    // 2.400 búsquedas/mes en competencia 30, y su cola (brandguide, manual de
    // identidad corporativa, manual de identidad visual) suma ~600 más, toda
    // por debajo de 45. Una sola página no puede pelear a la vez "identidad de
    // marca", que es un servicio, y "manual de marca", que es un entregable:
    // son búsquedas distintas con intenciones distintas.
    slug: "manual-de-marca",
    navLabel: "Manual de marca",
    schemaType: "Manual de marca",
    primaryKeyword: "manual de marca",
    winnable: 3860,
  },
  {
    // El cluster más grande del mapa, y estuvo mal medido hasta la cuarta
    // pasada: el filtro descartaba "tipos de" sin límite de palabra y eso
    // matchea dentro de "logoTIPOS DE empresas". Se perdían 51 keywords y
    // 2.780 búsquedas/mes, las de menor competencia de todo el relevamiento.
    slug: "diseno-de-logo",
    navLabel: "Diseño de logo",
    schemaType: "Diseño de logotipos",
    primaryKeyword: "logotipos de empresas",
    winnable: 4610,
  },
  {
    slug: "editorial-y-packaging",
    navLabel: "Editorial y packaging",
    schemaType: "Diseño editorial y packaging",
    primaryKeyword: "diseño editorial",
    winnable: 1300,
  },
  {
    slug: "diseno-ux-ui",
    navLabel: "Diseño UX/UI",
    schemaType: "Diseño UX/UI",
    primaryKeyword: "experiencia de usuario",
    winnable: 1210,
  },
  {
    slug: "diseno-web",
    navLabel: "Diseño web",
    schemaType: "Diseño y desarrollo web",
    primaryKeyword: "diseño y desarrollo web",
    winnable: 710,
  },
];

/**
 * La URL de una página de servicio. Construir SIEMPRE por acá y nunca escribir
 * `/identidad-de-marca/` en el markup: el sitio se sirve bajo el base `/design`
 * (ver astro.config.mjs), así que una ruta root-relative resuelve contra la raíz
 * de zil.global, donde contesta el 404 de la app Next. Es exactamente el bug que
 * dejó inalcanzable toda la sección de casos de estudio.
 *
 * La BARRA FINAL es obligatoria, no prolijidad — ver `trailingSlash` en
 * astro.config.mjs. Sin ella el upstream contesta 308 hacia una ruta que perdió
 * el prefijo /design, y el proxy le pasa ese redirect al browser tal cual.
 */
export function serviceHref(slug: string): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${slug}/`;
}
