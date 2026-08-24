/**
 * Clicks: `cta_click` y `outbound_click`, a la par del sitio principal.
 *
 * ── POR QUÉ EXISTE ──────────────────────────────────────────────────────────
 * zil-landing mide los dos desde `src/lib/analytics.js` y este sitio no medía
 * ninguno: cero atributos `data-track` en todo el repo. En GA4 eso se ve como
 * 1.322 `cta_click` del sitio Next contra 0 acá.
 *
 * La consecuencia práctica, ahora que las páginas de servicio empiezan a recibir
 * tráfico: se podía saber quién EMPEZÓ el formulario y quién lo MANDÓ, pero no
 * quién apretó el botón del hero. Sin ese escalón, un mes malo no distingue
 * "el CTA no se clickea" de "se clickea y el formulario espanta", que son dos
 * problemas distintos con dos arreglos distintos.
 *
 * ── DELEGADO, NO POR COMPONENTE ─────────────────────────────────────────────
 * Un solo listener en `document`, igual que allá. La alternativa era agregarle
 * un handler a cada botón, que es la forma más segura de que el próximo botón
 * nazca sin medición.
 *
 * Los enlaces salientes se miden SIN atributo: si hay que acordarse de taggear
 * cada uno, la mitad queda afuera. `mailto:` y `tel:` no cuentan como salientes,
 * son contacto y ya los mide el formulario por otro lado.
 *
 * ── NOMBRES ─────────────────────────────────────────────────────────────────
 * Los mismos que el sitio principal (`cta_click`, `outbound_click`) y los mismos
 * parámetros (`location`, `label`, `href`), para que los informes de los dos
 * sitios se sumen en vez de convivir. Se agrega `page`, que allá no hace falta
 * porque este sitio vive entero bajo /design.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Medir nunca puede romper una navegación: gtag es un global de terceros. */
const send = (event: string, params: Record<string, unknown>) => {
  try {
    window.gtag?.("event", event, {
      page: window.location.pathname,
      ...params,
    });
  } catch {
    // una medición perdida es más barata que un click que no navega
  }
};

const labelOf = (el: HTMLElement) =>
  (el.innerText || "").trim().slice(0, 100) ||
  el.getAttribute("aria-label") ||
  undefined;

document.addEventListener(
  "click",
  (event) => {
    const start = event.target as HTMLElement | null;
    if (!start) return;

    // `closest` sube sola por el árbol: el click real casi siempre cae en un
    // <span> adentro del botón, no en el botón.
    const tagged = start.closest<HTMLElement>("[data-track]");
    if (tagged) {
      send(tagged.getAttribute("data-track") || "cta_click", {
        location: tagged.getAttribute("data-track-location") || undefined,
        label: tagged.getAttribute("data-track-label") || labelOf(tagged),
        tag_name: tagged.tagName.toLowerCase(),
        href: tagged.getAttribute("href") || undefined,
      });
      return; // no se cuenta dos veces si además es saliente
    }

    const link = start.closest<HTMLAnchorElement>("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (/^(mailto:|tel:|#)/i.test(href)) return;

    try {
      const url = new URL(link.href, window.location.origin);
      if (url.hostname && url.hostname !== window.location.hostname) {
        send("outbound_click", { href: link.href, label: labelOf(link) });
      }
    } catch {
      // href que no parsea: no es saliente para nosotros
    }
  },
  true,
);

export {};
