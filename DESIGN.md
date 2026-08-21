---
name: Zil Design
description: Landing de la agencia Zil Design — violeta saturado, Circular, y movimiento que siempre llega por un eje.
colors:
  violet: "#9747ff"
  violet-dark: "#4b256e"
  violet-light: "#e7d5ff"
  lime: "#c2fe2d"
  seam: "#a763ff"
  white: "#ffffff"
  black: "#000000"
  surface-muted: "#f3f3f5"
  muted: "#6b6b6b"
  border: "#e5e5e5"
typography:
  display:
    fontFamily: "Circular, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(4.85rem, 7.6vw, 7.75rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Circular, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Circular, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Circular, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Circular, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.025em"
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "16px"
  full: "9999px"
spacing:
  gutter-mobile: "24px"
  gutter-tablet: "32px"
  gutter-desktop: "48px"
  section: "128px"
  section-tight: "64px"
components:
  button-pill:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.black}"
    rounded: "{rounded.full}"
    padding: "16px 36px"
    typography: "{typography.body}"
  button-pill-hover:
    padding: "16px 72px 16px 36px"
  button-pill-dark:
    backgroundColor: "{colors.violet-dark}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "16px 36px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "12px 32px"
  badge:
    backgroundColor: "{colors.violet-light}"
    textColor: "{colors.violet-dark}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    typography: "{typography.label}"
  input-surface:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.lg}"
    padding: "14px 20px"
  input-lilac:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.lg}"
    padding: "16px 24px"
  card-cta:
    backgroundColor: "{colors.violet-light}"
    textColor: "{colors.black}"
    rounded: "{rounded.none}"
    padding: "64px"
  header-bar:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
---

# Design System: Zil Design

## 1. Overview

**Creative North Star: "La Dirección Trazada"**

El sistema entero descansa sobre una sola idea que la propia página argumenta en su copy: una comunicación visual *con dirección clara* impulsa el crecimiento. Eso no es un eslogan aplicado encima del diseño, es la mecánica del diseño. La Z de la marca no aparece: se dibuja sola, de izquierda a derecha, y la tipografía del hero se levanta de la línea que esa Z acaba de trazar. La tesis de la página no se resalta con un color: una banda violeta la *pinta* de un pase, como un marcador, y la palabra lima aterriza adentro. Nada en este sitio hace fade-in; todo llega por un eje y se asienta en registro.

La superficie es blanca y el tipo es negro, pero el sistema no es neutro: el violeta saturado toma secciones enteras (el hero es `#4b256e` de borde a borde) y el lima existe únicamente para cortar sobre ese violeta. La densidad es amplia y medida — un ritmo de sección único (128px de desktop, mitad en móvil) que ninguna sección tiene permiso de redefinir — con una sola excepción declarada: las dos secciones ancladas al viewport (Hero, Método Zil) centran su contenido y dejan que el centrado defina el espacio.

Lo que este sistema rechaza explícitamente: la web de la matriz Zil. Comparten familia tipográfica y una versión recoloreada del logo, nada más. Layout, estructura, paleta, espaciado y componentes son propios y salen del Figma de Zil Design.

**Key Characteristics:**

- Una sola familia tipográfica (Circular) en cuatro pesos; el contraste viene de escala y peso, nunca de una segunda familia.
- Violeta comprometido: no es un acento del 10%, carga superficies completas.
- Esquinas: píldoras completamente redondas para acción, cuadrado duro para paneles. Nada intermedio.
- Movimiento direccional obligatorio; el fade solo no está permitido como entrada.
- Dos breakpoints, y solo dos: 640px y 1024px.

## 2. Colors

Paleta comprometida: violeta que ocupa superficie, lima que corta, y neutros que son literalmente blanco y negro puros — sin tintes cálidos ni fríos.

### Primary

- **Violeta Zil** (`#9747ff`): el violeta de marca. Vive en el logo, en los iconos de estado (el `+` del FAQ), en los círculos de flecha de las píldoras y en el borde de foco de todo campo interactivo.
- **Violeta Profundo** (`#4b256e`): el fondo del hero de borde a borde y el fondo del botón de envío del formulario. Es el violeta que se lee como superficie, no como acento.
- **Lila** (`#e7d5ff`): el panel de conversión (la card del CTA) y el fondo de todo badge. La versión respirable del violeta, para bloques grandes que no deben gritar.
- **Costura** (`#a763ff`): mezcla de violeta con 20% de lila, usada como línea de 1.5px exactamente donde el violeta de marca toca otro fondo — el contorno de la Z del hero y el canto superior de la sección de sistema. Compartida a propósito: esos dos bordes se tocan, y dos tonos distintos se leerían como error justo en la junta.

### Secondary

- **Lima** (`#c2fe2d`): el acento, y el único color que no es violeta ni neutro. Dos usos: la píldora CTA del hero y la palabra que aterriza dentro de la banda del Statement. Nunca es fondo de una sección.

### Neutral

- **Blanco** (`#ffffff`): fondo por defecto de página, superficie de los campos de formulario, y texto sobre violeta.
- **Negro** (`#000000`): texto por defecto. Negro puro, no gris-carbón.
- **Panel Suave** (`#f3f3f5`): superficie de panel/card sutil sobre blanco.
- **Gris Texto** (`#6b6b6b`): párrafos secundarios y respuestas del FAQ. Nunca para texto principal.
- **Borde** (`#e5e5e5`): hairline de listas, filas de FAQ y contorno de campos. Se usa casi siempre al 60–70% de opacidad.

### Named Rules

**The Semantic-Only Rule.** Los componentes usan exclusivamente los alias semánticos (`primary`, `primary-dark`, `primary-light`, `accent`, `surface`, `text`, `muted`, `border`). Escribir `violet` o `lime` directo en un componente está prohibido: el sitio debe poder re-tematizarse editando solo `global.css`.

**The Lime Scarcity Rule.** El lima aparece dos veces en toda la página. Su rareza es el efecto. Un tercer uso lo degrada a color decorativo y hay que justificarlo, no asumirlo.

**The Seam Rule.** Donde el violeta de marca toca otro fondo se dibuja una hairline de `--color-seam` a `--seam-w` (1.5px), y ambos valores son compartidos. No se declara un tono ni un grosor local para una junta.

## 3. Typography

**Display Font:** Circular (self-hosted, woff2 + woff; fallback `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`)
**Body Font:** Circular — la misma familia.
**Label/Mono Font:** ninguna. No hay monoespaciada en el sistema.

**Character:** Una geométrica de agencia, cargada en cuatro pesos (400 / 500 / 700 / 900). El contraste jerárquico lo hacen la escala y el tracking negativo, no un segundo tipo. Los títulos van a −0.03em y bajan a −0.04em en el Statement; los párrafos quedan neutros. Es la decisión que mantiene la página leyéndose como estudio gráfico y no como landing de plantilla.

### Hierarchy

- **Display** (500, `clamp(2.5rem, 12vw, 7.75rem)` encadenado en tres tramos, LH 1.04, −0.03em): exclusivo del titular del hero, que va a peso 700. **El cap de desktop está medido y ajustado**: la línea más larga renderiza 1291px contra los 1312px disponibles. Subirlo, engordar el peso o alargar esa línea exige re-medir.
- **Headline / h1** (500, 40 → 52 → 68px, LH 1.05): títulos de página.
- **Title / h2** (500, 32 → 40 → 52px, LH 1.1): todo encabezado de sección.
- **h3–h5** (500, de 24→36px a 17→20px): subtítulos y encabezados de card.
- **Body** (400, 15 → 16 → 17px, LH 1.6): párrafo por defecto. Los anchos se cierran con `max-w-[36ch]` / `max-w-190`, nunca a ancho completo.
- **Body Large** (400, 16 → 18 → 20px, LH 1.55): copy de apoyo del hero y etiquetas de píldora.
- **Label** (700, 14 → 15px, uppercase, tracking amplio): solo el componente Badge.

### Named Rules

**The One-Class Rule.** Un rol, una clase: `text-h1`…`text-h5`, `text-p-lg`, `text-p`, `text-p-sm`. Cada una ya escalona en los dos breakpoints. Escribir cadenas como `text-2xl tablet:text-3xl` está prohibido; para re-afinar la escala se edita la base móvil en `@theme` y los dos bloques de media query al final de `global.css`.

**The Balance Rule.** Todo h1–h3 lleva `text-balance`; todo párrafo largo lleva `text-pretty`.

## 4. Elevation

El sistema es **plano por decisión**. Casi ninguna superficie proyecta sombra: la profundidad se comunica por cambio de fondo (blanco → lila → violeta profundo) y por hairlines de 1px, no por elevación. Los tokens `--shadow-sm/md/lg` existen y solo dos cosas los usan: la barra flotante del header (`shadow-lg`, que es el efecto entero de ese componente — se despega del borde del viewport y viaja como isla sobre el contenido) y el hover de los botones genéricos `primary` (`shadow-md`).

### Shadow Vocabulary

- **`--shadow-sm`** (`0 1px 2px rgb(0 0 0 / 0.06)`): reservada; sin uso actual.
- **`--shadow-md`** (`0 4px 12px rgb(0 0 0 / 0.08)`): respuesta a hover en botones genéricos, junto con un `-translate-y-0.5`.
- **`--shadow-lg`** (`0 12px 32px rgb(0 0 0 / 0.12)`): exclusiva de la barra del header.

### Named Rules

**The Flat-Surface Rule.** Los paneles (card del CTA, cards de servicio, filas del FAQ) no llevan sombra en ningún estado. Si una superficie necesita separarse, cambia de fondo o gana una hairline — no gana sombra. Prueba de auditoría: si una card levita, está mal.

## 5. Components

### Buttons

Una sola definición para todo el sitio (`Button.astro`); una segunda píldora hecha a mano es exactamente como se rompe la coreografía.

- **Shape:** píldora completa (`9999px`). Sin excepción, en todas las variantes.
- **Primary / `pill`:** fondo lima, texto negro, `16px 36px`. Al hover en desktop el padding derecho crece a 72px y un círculo violeta de 48px con flecha blanca entra desde fuera. El círculo es violeta y no blanco porque sobre lima el blanco se lava.
- **`pill-dark`:** fondo violeta profundo, texto blanco, círculo blanco con flecha violeta; además la etiqueta se desplaza 8px a la izquierda. Es el submit del formulario.
- **`outline`:** borde de 2px violeta sobre fondo oscuro, texto blanco. Crece hacia la derecha consumiendo su propio `mr-5`, para que crezca igual aun estando fijado a la derecha en un flex.
- **Hover / Focus:** todo lo que *mueve o revela* está detrás de `desktop:` — el deslizamiento de la etiqueta, la aparición del círculo y el crecimiento del padding. En touch no existe hover y una píldora que crece sola es un bug. El foco es un anillo de 2px en `primary` con offset de 2px contra la superficie propia de cada variante.

### Badges

- **Style:** fondo lila, texto violeta profundo, radio de 8px, `8px 16px`, 14–15px en peso 700, uppercase con tracking amplio.
- **Uso:** una etiqueta por sección, encima del encabezado. Pasa atributos hacia el span, que es cómo se suma a la entrada de su sección sin un wrapper que rompería el espaciado hacia el título.

### Cards / Containers

- **Corner Style:** cuadrado (0px). El panel del CTA, las cards de servicio y las filas del FAQ no redondean. La curva pertenece a la acción, no al contenedor.
- **Background:** lila para el panel de conversión; blanco o `surface-muted` para el resto.
- **Shadow Strategy:** ninguna (ver Elevation).
- **Border:** hairline `border/60–70` en listas y separadores de FAQ.
- **Internal Padding:** `32 → 48 → 64px` en el panel del CTA, escalonado en los dos breakpoints.

### Inputs / Fields

Definición única en `LeadForm.astro`, compartida por las tres superficies que piden un lead (sección CTA, drawer móvil, modal del hero). Sus dos únicos knobs describen el fondo sobre el que se apoya el formulario, jamás el layout.

- **Style:** radio de 16px, texto de 17px. Sobre lila: blanco plano, sin borde, `16px 24px`. Sobre blanco: borde `border`, `14px 20px` — sin borde no se leerían como campos.
- **Focus:** anillo de 2px `primary` con offset de 2px contra el fondo correspondiente.
- **Error:** una línea de 14px en violeta profundo, con `role="alert"`.

### Navigation

- **Style:** barra-isla flotante — blanca sólida en todo scroll, borde `border/60`, `shadow-lg`, esquinas rectas, flotando 16px por debajo del borde superior dentro del contenedor estándar.
- **Typography:** 14–15px peso 500 en `text/70`, a `text` pleno en hover. Solo color: sin subrayado ni desplazamiento.
- **Behavior:** se oculta al hacer scroll hacia abajo y vuelve con cualquier scroll hacia arriba, con una zona muerta de 4px contra el jitter. Entra al cargar deslizándose desde arriba en 0.7s con `cubic-bezier(0.33, 1, 0.68, 1)`, sincronizada con las entradas de scroll.
- **Mobile:** sin botón de Contacto en la barra — el ContactDrawer persistente es la invitación en esos tamaños, y dos pedidos compitiendo en un viewport es uno de más.

### La Z del hero (componente firma)

Composición construida íntegramente en CSS a partir de dos variables: `--z-gap` (el tramo horizontal de la barra) y `--z-run` (el recorrido horizontal de cada diagonal). Las junturas se **derivan**, no se escriben. Las diagonales llevan un overshoot de `--z-over` en cada extremo para que el trazo no se afine en la costura, y los contraespacios se rellenan con un degradado más una capa de ruido `feTurbulence` en SVG inline. Al cargar se dibuja sola, y sus junturas se leen del DOM en tiempo real: hardcodear el 44% de desktop haría que en móvil los brazos nacieran del violeta vacío.

### Motion (transversal a los componentes)

`src/scripts/reveal.ts` es la única fuente de verdad: cada distancia, duración, ease y stagger vive ahí, y las secciones se suscriben de forma declarativa con `data-reveal`, `data-reveal-group` y `data-reveal-delay`. El vocabulario es deliberadamente mínimo — `rise` (14px, 0.7s, `power3.out`, stagger 0.09s) hace casi todo; `rail` (32px horizontal) es solo para el track de proyectos; `band` es solo para la tesis del Statement.

**Este sitio anima aunque el sistema operativo pida movimiento reducido.** Es una decisión de producto tomada a conciencia, contra el default de accesibilidad, y vive en exactamente dos lugares: la redefinición de la variante `motion-reduce` en `global.css` y el shim de `matchMedia` en el `<head>` de `Layout.astro`. Se cambian los dos o ninguno.

## 6. Do's and Don'ts

### Do:

- **Do** usar los alias semánticos de color (`primary`, `accent`, `surface`, `text`, `muted`, `border`) para que el sitio siga siendo re-tematizable desde `global.css` solo.
- **Do** aplicar `py-section` a toda sección de flujo — una clase sin prefijo. Cada sección posee la MITAD del hueco; dos secciones estándar quedan a 160/224/256px.
- **Do** usar una única clase semántica de tipo por rol (`text-h2`, `text-p`), que ya escalona sola en los dos breakpoints.
- **Do** poner detrás de `desktop:` todo hover que **mueva o revele** algo. El feedback puro de color o borde queda sin puerta.
- **Do** declarar el movimiento con `data-reveal` en el markup renderizado en servidor y dejar que `reveal.ts` lo maneje; dentro de una isla `client:visible`, un `useGSAP` no toca el DOM hasta la hidratación, que ocurre justo cuando el lector ya vio la sección.
- **Do** mantener la hairline de costura (`--color-seam` a `--seam-w`) allí donde el violeta de marca toca otro fondo.

### Don't:

- **Don't** copiar layout, estructura, paleta, espaciado o componentes de la web de la matriz Zil. Lo único compartido es la familia tipográfica y el logo recoloreado.
- **Don't** escribir cadenas de padding responsive en una sección (`py-20 tablet:py-28 desktop:py-32`). Así fue exactamente como el ritmo derivó a un rango de 96–160px antes de que existieran los tokens.
- **Don't** escribir cadenas de tipo inline (`text-2xl tablet:text-3xl`). Se re-afina la escala en `global.css`.
- **Don't** agregar un tercer breakpoint. Existen dos: 640px y 1024px, y los defaults de Tailwind están borrados a propósito.
- **Don't** aplicar `py-section` a Hero ni a Método Zil: están ancladas al viewport y el centrado ya define el espacio de sus vecinas.
- **Don't** poner márgenes entre secciones. El ritmo es solo padding.
- **Don't** dar sombra a las cards ni redondear los paneles. Redondo es acción; cuadrado es contenedor.
- **Don't** codificar un estado oculto en el markup o en el CSS. Solo `html.reveal-armed [data-reveal]:not([data-revealed])` puede ocultar algo, y el script inline del `<head>` de `Layout.astro` es el ÚNICO que decide si esa clase se aplica. Decidirlo dos veces es como la página queda en blanco.
- **Don't** agregar entradas de scroll a Clients ni al Footer. Clients ya es una marquesina perpetua, y el Footer llega asentado a propósito.
- **Don't** inventar una cuarta variante de movimiento porque una sección "quiere sentirse distinta". `rise` / `rail` / `band` existen por un argumento que el movimiento enuncia; querer variedad no es uno.
- **Don't** hacer una segunda píldora a mano en lugar de usar `Button.astro`. Así arranca la deriva de la coreografía de hover.
- **Don't** usar un tercer color de acento ni sumar una segunda familia tipográfica.
