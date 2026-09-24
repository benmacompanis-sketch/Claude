/**
 * Filtros de plantillas (Nunjucks).
 *
 * - texto:     escapa HTML, reemplaza {tokens}, aplica **negrita**, *itálica* y [enlaces](url),
 *              y marca los [textos provisorios] para que se vean de forma prolija.
 * - parrafos:  igual que "texto", separando párrafos por línea en blanco.
 * - plano:     versión sin HTML (para atributos alt, title, meta).
 * - whatsapp / telefono / email / mapa: arman enlaces a partir de site.yml.
 */
import nunjucks from 'nunjucks';

const { markSafe } = nunjucks.runtime;

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** ¿El texto todavía tiene un [placeholder]? */
export const esProvisorio = (value) => typeof value === 'string' && /\[[^\]]+\]/.test(value);

/** Valor real o undefined si todavía es un placeholder o está vacío. */
export const real = (value) => {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s && !esProvisorio(s) ? s : undefined;
};

/** Reemplaza {nombre}, {ciudad}, etc. por los datos de site.yml. */
export function tokens(value, site = {}) {
  const u = site.ubicacion ?? {};
  const map = {
    nombre: site.nombre,
    'nombre-corto': site.nombreCorto,
    ciudad: u.ciudad,
    provincia: u.provincia,
    direccion: u.direccion,
    telefono: site.contacto?.telefono?.visible,
    whatsapp: site.whatsapp?.visible,
    email: site.contacto?.email,
    anios: site.institucional?.anios,
    visitas: site.horarios?.visitas,
    atencion: site.horarios?.atencion,
  };
  return String(value ?? '').replace(/\{([a-z-]+)\}/g, (match, key) => (map[key] != null ? map[key] : match));
}

function inline(value, site) {
  let s = escapeHtml(tokens(value, site));
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(«“])\*(?!\s)(.+?)\*(?=$|[\s.,;:!?)»”])/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');
  return s;
}

export function texto(value) {
  if (value === null || value === undefined || value === '') return '';
  return markSafe(inline(value, this?.ctx?.site));
}

export function parrafos(value, clase = '') {
  if (!value) return '';
  const site = this?.ctx?.site;
  const attr = clase ? ` class="${escapeHtml(clase)}"` : '';
  return markSafe(
    String(value)
      .trim()
      .split(/\n\s*\n/)
      .map((p) => `<p${attr}>${inline(p.replace(/\s*\n\s*/g, ' '), site)}</p>`)
      .join('\n'),
  );
}

export function plano(value) {
  return tokens(value, this?.ctx?.site)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
}

/** Enlace de WhatsApp con mensaje prearmado. Uso: {{ site | whatsapp("visita") }} */
export function whatsapp(site = {}, clave = 'general') {
  const w = site.whatsapp ?? {};
  const numero = String(w.numero ?? '').replace(/\D/g, '');
  const mensaje = tokens(w.mensajes?.[clave] ?? w.mensajes?.general ?? '', site);
  const q = encodeURIComponent(mensaje);
  // Sin número cargado, WhatsApp abre igual con el mensaje listo para elegir contacto.
  return numero ? `https://wa.me/${numero}?text=${q}` : `https://wa.me/?text=${q}`;
}

/** Enlace tel:. Si todavía no hay número, lleva al formulario de contacto. Uso: {{ site | telefono }} */
export function telefono(site = {}) {
  const numero = String(site.contacto?.telefono?.numero ?? '').replace(/[^\d+]/g, '');
  return numero ? `tel:${numero}` : '/contacto/#formulario';
}

export function email(site = {}) {
  const mail = real(site.contacto?.email);
  return mail && mail.includes('@') ? `mailto:${mail}` : '/contacto/#formulario';
}

/** Enlace para abrir la dirección en Google Maps (o null si todavía no hay dirección). */
export function mapa(site = {}) {
  const u = site.ubicacion ?? {};
  if (real(u.mapa?.enlace)) return u.mapa.enlace;
  const partes = [real(u.direccion), real(u.ciudad), real(u.provincia)].filter(Boolean);
  if (!partes.length) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partes.join(', '))}`;
}

/** URL absoluta a partir de site.url. */
export function absoluta(path = '/') {
  const base = String(this?.ctx?.site?.url ?? '').replace(/\/$/, '');
  if (/^https?:\/\//.test(path)) return path;
  return base + (path.startsWith('/') ? path : `/${path}`);
}

/** Marca el enlace activo del menú. */
export function activo(url, pageUrl) {
  if (!url || !pageUrl) return false;
  const limpio = url.split('#')[0].split('?')[0];
  if (limpio === '/') return pageUrl === '/';
  return pageUrl.startsWith(limpio) && !url.includes('#');
}

/** Toma elementos de una lista por id, respetando el orden pedido. */
export function porIds(lista = [], ids = []) {
  return ids.map((id) => lista.find((item) => item.id === id)).filter(Boolean);
}

/** Aplana las preguntas de todos los grupos de faq.yml. */
export function todasLasPreguntas(grupos = []) {
  return grupos.flatMap((g) => g.preguntas ?? []);
}

/** Número de dos dígitos: 1 → "01". */
export const dosDigitos = (n) => String(n).padStart(2, '0');

/** Serializa JSON para <script type="application/ld+json"> sin romper el HTML. */
export const jsonSeguro = (obj) => markSafe(JSON.stringify(obj, null, 0).replace(/</g, '\\u003c'));

/** Marca los [textos provisorios] dentro de un bloque HTML ya renderizado (por ejemplo, Markdown). */
export function provisorios(html) {
  return markSafe(
    String(html ?? '').replace(/>([^<]+)</g, (m, contenido) => `>${contenido.replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>')}<`),
  );
}

/** Fecha en formato AAAA-MM-DD (para el sitemap). */
export const fechaIso = (fecha) => new Date(fecha).toISOString().slice(0, 10);
