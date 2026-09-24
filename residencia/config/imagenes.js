/**
 * Fotos del sitio.
 *
 * Cada foto se referencia por su nombre, sin extensión: "instalaciones/habitacion-1".
 * El sitio busca primero la foto REAL en src/assets/img/ (jpg, jpeg, png, webp o avif).
 * Si no existe, usa la ilustración provisional de src/assets/img/_provisionales/.
 * Si tampoco existe, muestra un recuadro prolijo de "Foto pendiente".
 *
 * Después, el plugin de Eleventy Image genera versiones AVIF/WebP en varios tamaños,
 * con ancho y alto explícitos para evitar saltos de diseño.
 */
import fs from 'node:fs';
import path from 'node:path';
import { escapeHtml, tokens } from './filtros.js';

const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

export function crearFotos({ input }) {
  const IMG = path.join(input, 'assets/img');
  const PROV = path.join(IMG, '_provisionales');

  function resolver(nombre) {
    const base = String(nombre ?? '')
      .trim()
      .replace(/^\/+/, '')
      .replace(/^assets\/img\//, '')
      .replace(/\.(jpe?g|png|webp|avif|svg)$/i, '');
    if (!base) return null;
    for (const ext of EXTENSIONES) {
      if (fs.existsSync(path.join(IMG, base + ext))) return { src: `/assets/img/${base}${ext}`, provisional: false };
    }
    if (fs.existsSync(path.join(PROV, `${base}.svg`))) {
      return { src: `/assets/img/_provisionales/${base}.svg`, provisional: true };
    }
    return null;
  }

  /**
   * Uso: {% foto "instalaciones/habitacion-1", "Texto alternativo", { sizes: "(min-width: 64em) 50vw, 100vw" } %}
   * Opciones: sizes, clase, carga ("lazy" | "eager"), prioridad ("high"), foco ("50% 40%"), anchos ("400,800").
   */
  function foto(nombre, alt = '', opciones = {}) {
    const site = this?.ctx?.site ?? {};
    const altTexto = escapeHtml(tokens(alt ?? '', site));
    const encontrada = resolver(nombre);
    const clase = opciones.clase ? ` ${escapeHtml(opciones.clase)}` : '';

    if (!encontrada) {
      return `<span class="foto-pendiente${clase}" role="img" aria-label="${altTexto || 'Foto pendiente'}"><svg class="icon" aria-hidden="true" focusable="false"><use href="#i-image"></use></svg><span>Foto pendiente</span></span>`;
    }

    const eager = opciones.carga === 'eager';
    const attrs = [
      `src="${encontrada.src}"`,
      `alt="${altTexto}"`,
      `sizes="${escapeHtml(opciones.sizes ?? '100vw')}"`,
      `class="foto${clase}"`,
      `loading="${eager ? 'eager' : 'lazy'}"`,
      `decoding="${eager ? 'sync' : 'async'}"`,
    ];
    if (opciones.prioridad) attrs.push(`fetchpriority="${escapeHtml(opciones.prioridad)}"`);
    if (opciones.foco) attrs.push(`style="object-position: ${escapeHtml(opciones.foco)}"`);
    if (opciones.anchos) attrs.push(`eleventy:widths="${escapeHtml(opciones.anchos)}"`);
    if (encontrada.provisional) attrs.push('data-provisional');

    let html = `<img ${attrs.join(' ')}>`;
    if (encontrada.provisional && site.borrador?.marcarFotosProvisionales) {
      html += '<span class="foto-etiqueta" aria-hidden="true">Foto provisional</span>';
    }
    return html;
  }

  return { resolver, foto };
}
