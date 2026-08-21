import type { APIRoute } from "astro";
import { SERVICES } from "../data/services";
import { projects } from "../data/projects";

/**
 * El sitemap de Zil Design.
 *
 * Hasta ahora este sitio no tenía ninguno: zil-landing declaraba UNA sola URL
 * para todo /design (`scripts/generate-sitemap.js`, la línea del `pageUrls.push`
 * suelto), así que las cuatro páginas de proyecto no estaban listadas en ningún
 * lado. Search Console lo confirma: cero impresiones, nunca, para cualquier URL
 * de /design que no fuera la home. Sumar seis páginas más a un subárbol que
 * nadie declara habría repetido el mismo error a mayor escala.
 *
 * Se genera acá y no en zil-landing porque este repo es el único que sabe qué
 * páginas tiene. zil-landing ahora referencia este archivo desde su índice de
 * sitemaps, así que agregar una página no le pide un cambio del otro lado.
 *
 * Las URLs son las PÚBLICAS (zil.global/design/...), que no son las de este
 * proyecto: Astro sirve bajo `base` y el mundo nos ve detrás del proxy de
 * zil-landing. `Astro.site` + `BASE_URL` es la misma combinación con la que
 * Layout arma el canonical, y tienen que coincidir: declarar en el sitemap una
 * URL distinta de la canónica es pedirle a Google que elija por su cuenta.
 *
 * La barra final es obligatoria (`trailingSlash: "always"`). Sin ella el
 * upstream contesta 308 hacia una ruta que perdió el prefijo /design.
 */
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

// Los proyectos con página. Los que no tienen `slug` renderizan como tarjeta sin
// enlace y no existen como URL, así que tampoco van al sitemap.
const projectPaths = projects
  .filter((p) => p.slug)
  .map((p) => `${base}/proyectos/${p.slug}/`);

const paths = [
  `${base}/`,
  ...SERVICES.map((s) => `${base}/${s.slug}/`),
  ...projectPaths,
];

export const GET: APIRoute = ({ site }) => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url>\n    <loc>${new URL(p, site).href}</loc>\n  </url>`).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
