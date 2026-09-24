# Sitio web · Residencia para adultos mayores

Sitio institucional pensado para la familia que busca un lugar para su papá, su mamá o un ser querido. El objetivo es que transmita **tranquilidad, confianza y calidez** desde la primera pantalla, y que cargue rápido incluso en un celular económico con mala conexión.

El sitio está completo y funcionando, con **datos provisorios entre [corchetes]** e **ilustraciones provisionales** en lugar de fotos. Todo se reemplaza fácilmente, como se explica abajo.

---

## Índice

1. [Cómo verlo en tu computadora](#1-cómo-verlo-en-tu-computadora)
2. [Qué hay en cada carpeta](#2-qué-hay-en-cada-carpeta)
3. [Cargar los datos reales (lo primero)](#3-cargar-los-datos-reales-lo-primero)
4. [Cambiar textos](#4-cambiar-textos)
5. [Reemplazar las fotos](#5-reemplazar-las-fotos)
6. [WhatsApp, teléfono y mapa](#6-whatsapp-teléfono-y-mapa)
7. [Formulario de contacto](#7-formulario-de-contacto)
8. [Publicar el sitio](#8-publicar-el-sitio)
9. [Lista de control antes de publicar](#9-lista-de-control-antes-de-publicar)
10. [Decisiones de diseño y tecnología](#10-decisiones-de-diseño-y-tecnología)

---

## 1. Cómo verlo en tu computadora

Necesitás [Node.js](https://nodejs.org) 22 o superior.

```bash
cd residencia
npm install          # una sola vez
npm run dev          # abre el sitio en http://localhost:8080 y se actualiza al guardar
npm run build        # genera la versión final en la carpeta _site/
```

La primera vez, el armado tarda unos minutos porque optimiza todas las imágenes (AVIF y WebP en varios tamaños). Después solo procesa las que cambiaron.

---

## 2. Qué hay en cada carpeta

```
residencia/
├── src/
│   ├── _data/
│   │   ├── site.yml             ← DATOS DE LA RESIDENCIA (nombre, teléfono, WhatsApp, dirección…)
│   │   ├── navegacion.yml       ← menús
│   │   └── contenido/           ← textos de cada página y listas (servicios, preguntas, equipo…)
│   ├── _includes/
│   │   ├── layouts/             ← estructura general de las páginas
│   │   ├── partials/            ← encabezado, pie, logo, botón de WhatsApp…
│   │   ├── sections/            ← secciones reutilizables (día a día, testimonios, preguntas…)
│   │   └── macros/              ← botones, encabezados de sección y otras piezas chicas
│   ├── assets/
│   │   ├── css/                 ← estilos (variables de diseño en base/tokens.css)
│   │   ├── js/                  ← interacciones (menú, galería, formulario, mapa, buscador)
│   │   ├── img/                 ← FOTOS REALES (y _provisionales/ con las ilustraciones)
│   │   ├── icons/               ← íconos SVG
│   │   ├── fonts/               ← tipografías
│   │   ├── marca/               ← logo
│   │   └── og/                  ← imagen para compartir en redes
│   ├── estaticos/               ← favicon, íconos de la app y encabezados HTTP
│   ├── legales/                 ← política de privacidad, términos y aviso legal (Markdown)
│   └── *.njk                    ← una plantilla por página
├── config/                      ← funciones del armado (filtros, imágenes, íconos, SEO)
├── scripts/                     ← generadores de ilustraciones, logo e imagen para redes
├── eleventy.config.js
└── netlify.toml
```

**Páginas:** Inicio · Nosotros (con Equipo) · Servicios (con Alimentación) · Instalaciones · Actividades · Familias · Preguntas frecuentes · Contacto · Privacidad · Términos · Aviso legal · 404 · Gracias.

---

## 3. Cargar los datos reales (lo primero)

Abrí **`src/_data/site.yml`**. Es el archivo principal: el nombre, el teléfono, el WhatsApp, la dirección, los horarios y las redes se escriben **una sola vez** ahí y se actualizan en todo el sitio.

- Todo lo que está entre `[corchetes]` es provisorio. Reemplazalo **sin** los corchetes.
- Mientras un dato tenga corchetes, se ve con un **subrayado de puntos** (modo borrador) y **no se publica** en los datos para Google.
- Cuando termines, poné `resaltarProvisorios: false` en la sección `borrador`.

Para encontrar todo lo que falta completar:

```bash
grep -rn "\[" src/_data src/legales
```

---

## 4. Cambiar textos

Los textos de cada página están en **`src/_data/contenido/`** (un archivo por página, más listas como `servicios.yml`, `faq.yml`, `equipo.yml`, `actividades.yml`).

- `**negrita**`, `*itálica*` y `[enlace](/contacto/)` funcionan en cualquier texto.
- Estas palabras se completan solas con los datos de `site.yml`: `{nombre}`, `{ciudad}`, `{provincia}`, `{direccion}`, `{telefono}`, `{whatsapp}`, `{email}`, `{anios}`, `{visitas}`, `{atencion}`.
- **Agregar o quitar** un servicio, una actividad, una pregunta o una persona del equipo: copiá o borrá el bloque completo que empieza con `- `.
- Las preguntas con `destacada: true` también aparecen en el Inicio.
- Los **testimonios** actuales son ejemplos y se muestran marcados como tales. Al cargar testimonios reales (con autorización escrita de cada familia), poné `ejemplo: false`. Para ocultar la sección: `mostrar: false`.

> ⚠️ **Importante:** no publicar como servicios médicos prestaciones que no estén confirmadas, ni habilitaciones, títulos o matrículas sin verificar. El sitio ya está redactado con ese cuidado: donde hace falta un dato oficial, hay un `[placeholder]`.

---

## 5. Reemplazar las fotos

Las imágenes actuales son **ilustraciones provisionales** coherentes con el diseño. Para reemplazar cualquiera por una foto real:

1. Buscá el archivo en `src/assets/img/_provisionales/` (por ejemplo `instalaciones/habitacion-1.svg`).
2. Guardá tu foto con **el mismo nombre**, en la misma subcarpeta pero **fuera** de `_provisionales`:
   `src/assets/img/instalaciones/habitacion-1.jpg` (sirve `.jpg`, `.jpeg`, `.png` o `.webp`).
3. Listo. Al compilar, el sitio la detecta sola, la optimiza (AVIF/WebP en varios tamaños) y deja de usar la ilustración.

Después, revisá el texto alternativo (`alt`) de esa foto en el archivo de contenido correspondiente, para que describa la foto real.

Si una foto no existe (ni real ni provisional), el sitio muestra un recuadro prolijo de "Foto pendiente" en lugar de romperse.

### Qué foto va en cada lugar

| Archivo | Dónde se ve | Foto sugerida | Formato |
|---|---|---|---|
| `inicio/hero` | Portada | Residente con una cuidadora, charlando en la sala, luz natural. **La foto más importante del sitio.** | Vertical 4:5 |
| `inicio/nuestra-casa` | Inicio · Nuestra casa | Detalle cálido: mate, una mesa preparada, manos. | Vertical |
| `inicio/tranquilidad` | Inicio · Para las familias | Habitación ordenada y luminosa. | Vertical |
| `inicio/visita` | Inicio · Vení a conocernos | Fachada o entrada de la residencia. | Horizontal |
| `dia/manana`, `dia/mediodia`, `dia/tarde`, `dia/noche` | Un día en la residencia | Desayuno, almuerzo, merienda o actividad, y un momento de la noche. | 4:3 |
| `instalaciones/*` | Galería de instalaciones | Habitaciones, comedor, salas, jardín, patio, baños adaptados, accesos. | 4:3 horizontal |
| `actividades/*` | Actividades | Residentes haciendo cada actividad (con autorización). | 4:3 |
| `alimentacion/*` | Servicios · Alimentación | Platos reales del menú. | Cuadrada |
| `equipo/*` | Nosotros · Equipo | Retrato de cada persona, fondo neutro, luz suave. | Vertical 4:5 |
| `nosotros/hero`, `servicios/hero`, `actividades/hero`, `familias/hero` | Encabezado de cada página | Espacios amplios o momentos cotidianos. | Muy horizontal 21:9 |
| `nosotros/historia` | Nosotros · Historia | Foto antigua de la casa o de sus comienzos. | Vertical |
| `contacto/mapa` | Contacto (fondo del mapa) | Puede quedar la ilustración. | — |

**Recomendaciones para las fotos:** luz natural, ambientes ordenados, personas reales en situaciones cotidianas (siempre con **consentimiento escrito** de residentes y familias), sin filtros exagerados. Mínimo 1600 px de ancho. Las fotos reales generan mucha más confianza que las de bancos de imágenes.

Si preferís ver una etiqueta "Foto provisional" sobre cada ilustración mientras revisás el sitio, activá `marcarFotosProvisionales: true` en `site.yml`.

Para regenerar las ilustraciones o el logo: `npm run imagenes` y `node scripts/generar-marca.mjs`. Para la imagen que se ve al compartir el sitio (usa el nombre real y la foto de portada): `node scripts/generar-og.mjs`.

---

## 6. WhatsApp, teléfono y mapa

- **WhatsApp:** cargá el número **una sola vez** en `site.yml → whatsapp.numero`, en formato internacional y solo con números (por ejemplo `5493511234567`). Todos los botones del sitio lo usan, cada uno con su mensaje prearmado (`whatsapp.mensajes`). El botón flotante se activa o desactiva con `botonFlotante`.
- **Teléfono:** `contacto.telefono.visible` es cómo se muestra y `contacto.telefono.numero` es el que marca el botón "Llamar" (formato `+543511234567`).
- **Mapa:** en Google Maps, buscá la dirección → *Compartir* → *Insertar un mapa* → copiá **solo** la URL que está dentro de `src="…"` y pegala en `ubicacion.mapa.embedUrl`. El mapa se carga solo cuando la persona lo pide (más rápido y sin cookies de Google hasta ese momento).

---

## 7. Formulario de contacto

En `site.yml → formulario.modo` elegís cómo llegan las consultas:

| Modo | Qué hace | Qué hay que configurar |
|---|---|---|
| `demo` | No envía nada. Muestra un aviso de demostración. | Nada (solo para revisar el diseño). |
| `netlify` | Las consultas llegan al panel de Netlify y por email. | Publicar en Netlify y activar *Forms*. |
| `endpoint` | Envía a Formspree, Getform, Basin o un backend propio. | Pegar la URL en `formulario.endpoint`. |
| `whatsapp` | Arma un mensaje con los datos y abre WhatsApp. | Tener cargado `whatsapp.numero`. |

El formulario valida los datos con mensajes claros, muestra estados de "Enviando…", éxito y error, y tiene un campo trampa contra spam. Sin JavaScript, se envía igual (con los modos `netlify` o `endpoint`) y lleva a la página `/gracias/`.

---

## 8. Publicar el sitio

El resultado de `npm run build` es la carpeta **`_site/`**: HTML, CSS, JS e imágenes estáticos. Funciona en cualquier hosting.

- **Netlify** (recomendado, incluye formularios): conectá el repositorio. *Build command:* `npm run build` · *Publish directory:* `_site` · si el proyecto está dentro de otro repositorio, *Base directory:* `residencia`.
- **Vercel / Cloudflare Pages:** mismos datos (comando `npm run build`, carpeta `_site`, Node 22).
- **GitHub Pages en una subcarpeta:** `npx @11ty/eleventy --pathprefix=/nombre-del-repo/`.
- **Hosting tradicional (cPanel, FTP):** corré `npm run build` y subí el **contenido** de `_site/` a `public_html`.

Después de publicar, cambiá `url` en `site.yml` por el dominio definitivo (se usa para Google y para compartir en redes), y cargá el sitio en [Google Search Console](https://search.google.com/search-console) con el sitemap: `https://tu-dominio/sitemap.xml`.

---

## 9. Lista de control antes de publicar

- [ ] `site.yml` completo, sin `[corchetes]`, con `url` del dominio real.
- [ ] Número de WhatsApp y teléfono cargados y probados desde un celular.
- [ ] `formulario.modo` configurado (no `demo`) y una consulta de prueba recibida.
- [ ] Mapa de Google cargado en `ubicacion.mapa.embedUrl`.
- [ ] Fotos reales en las secciones principales (como mínimo: portada, habitaciones, comedor, jardín, equipo) y sus textos `alt` revisados.
- [ ] Testimonios de ejemplo reemplazados por reales (con autorización) u ocultos (`mostrar: false`).
- [ ] Servicios, actividades, menú y horarios revisados con la residencia: solo información confirmada.
- [ ] Textos legales revisados por un profesional y fechas actualizadas.
- [ ] `borrador.resaltarProvisorios: false`.
- [ ] Imagen para compartir regenerada con el nombre real (`node scripts/generar-og.mjs`).
- [ ] Si las respuestas de preguntas frecuentes son definitivas: `seo.faqSchema: true`.

---

## 10. Decisiones de diseño y tecnología

**Identidad visual.** Paleta cálida y sobria (blanco cálido, arena, verde salvia, verde profundo y un acento terracota), tipografía serif editorial (*Newsreader*) para títulos y una sans muy legible (*Figtree*) para textos, con cuerpo de 17–19 px pensado para personas mayores. El isologo es una puerta-ventana en arco con el sol saliendo: *un nuevo día, en casa*. El arco se repite en la portada y en pequeños detalles.

**Experiencia.** Cada sección tiene un propósito para la familia que está decidiendo: emoción (portada y carta de la dirección), cómo es un día (una secuencia que va de la mañana clara a la noche azul), pruebas visuales (instalaciones), información concreta (servicios, ingreso paso a paso, preguntas) y un siguiente paso claro y sin presión (visitar, escribir por WhatsApp). Los llamados a la acción cambian según el contexto.

**Navegación.** Menú principal con Inicio, Nosotros, Servicios, Instalaciones, Actividades, Equipo y Contacto, más "Consultar disponibilidad". *Familias* y *Preguntas frecuentes* están en la franja superior (computadoras), en el menú del celular, en el pie y dentro de las páginas. En el celular, el botón dice "Menú" (más claro que un ícono solo) y hay un botón directo para llamar.

**Rendimiento.**
- HTML estático generado con [Eleventy](https://www.11ty.dev): no hay framework en el navegador.
- ~6 KB de JavaScript inicial (comprimido); galería, formulario, mapa y buscador se descargan solo en las páginas que los usan.
- Un solo CSS minificado; tipografías propias recortadas (≈ 90 KB en total) con métricas de respaldo para evitar saltos.
- Imágenes AVIF/WebP responsivas con ancho y alto explícitos y carga diferida; la de portada tiene prioridad alta.
- Mapa de Google solo a pedido. Sin cookies de terceros al cargar.

**Accesibilidad.** HTML semántico, un solo `h1` por página y títulos en orden, enlace "Saltar al contenido", foco visible, contraste AA, botones de al menos 44 px, formularios con etiquetas y errores anunciados, preguntas desplegables nativas, visor de fotos con teclado, menú que funciona sin JavaScript y respeto por "reducir movimiento".

**SEO.** Títulos y descripciones por página, URLs limpias, sitemap, robots.txt, Open Graph, datos estructurados Schema.org (`LocalBusiness`, `WebSite`, `BreadcrumbList` y, opcionalmente, `FAQPage`) que **omiten automáticamente cualquier dato provisorio**.

**Dependencias (todas solo para el armado, ninguna llega al navegador):**

| Paquete | Para qué |
|---|---|
| `@11ty/eleventy` | Genera el HTML a partir de plantillas y datos. |
| `@11ty/eleventy-img` | Optimiza las fotos (AVIF/WebP, tamaños, ancho y alto). |
| `js-yaml`, `nunjucks` | Datos editables en YAML y plantillas. |
| `lightningcss`, `browserslist` | Une y minifica el CSS con compatibilidad para navegadores comunes. |
| `esbuild` | Empaqueta y minifica el JavaScript. |

**Licencias de terceros:** tipografías Newsreader y Figtree (SIL Open Font License), íconos [Phosphor](https://phosphoricons.com) (MIT, ver `src/assets/icons/LICENSE-phosphor.txt`).
