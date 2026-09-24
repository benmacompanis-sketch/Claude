/**
 * Íconos (Phosphor Icons, licencia MIT) en src/assets/icons/.
 *
 * En las plantillas: {% icono "phone" %} → <svg><use href="#i-phone"></use></svg>
 * Al generar cada página se inyecta un "sprite" SOLO con los íconos que esa página usa:
 * sin pedidos extra al servidor y sin repetir el dibujo de cada ícono.
 *
 * Para sumar un ícono: descargá el SVG desde phosphoricons.com (peso "Light" para los
 * ilustrativos, "Regular" para los de interfaz) y guardalo en src/assets/icons/ con un
 * nombre en minúsculas y guiones.
 */
import fs from 'node:fs';
import path from 'node:path';

export function crearIconos({ input }) {
  const DIR = path.join(input, 'assets/icons');
  const cache = new Map();

  function simbolo(nombre) {
    if (cache.has(nombre)) return cache.get(nombre);
    const archivo = path.join(DIR, `${nombre}.svg`);
    if (!fs.existsSync(archivo)) {
      throw new Error(`[íconos] No existe "${nombre}.svg" en src/assets/icons/. Revisá el nombre en los datos o plantillas.`);
    }
    const svg = fs.readFileSync(archivo, 'utf8');
    const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 256 256';
    const interior = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    const resultado = `<symbol id="i-${nombre}" viewBox="${viewBox}">${interior}</symbol>`;
    cache.set(nombre, resultado);
    return resultado;
  }

  function icono(nombre, clase = '') {
    simbolo(nombre);
    return `<svg class="icon${clase ? ` ${clase}` : ''}" aria-hidden="true" focusable="false"><use href="#i-${nombre}"></use></svg>`;
  }

  function sprite(contenido) {
    if (!this.page?.outputPath || !this.page.outputPath.endsWith('.html')) return contenido;
    const usados = new Set([...contenido.matchAll(/href="#i-([a-z0-9-]+)"/g)].map((m) => m[1]));
    if (!usados.size) return contenido;
    const simbolos = [...usados].sort().map(simbolo).join('');
    return contenido.replace(
      /<body([^>]*)>/,
      `<body$1>\n<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">${simbolos}</svg>`,
    );
  }

  return { icono, sprite, limpiarCache: () => cache.clear() };
}
