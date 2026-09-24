/**
 * Configuración de Eleventy (generador de sitio estático).
 * El resultado es HTML, CSS y JS listos para cualquier hosting, en la carpeta _site/.
 */
import { load as leerYaml } from 'js-yaml';
import { HtmlBasePlugin } from '@11ty/eleventy';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';

import * as filtros from './config/filtros.js';
import { crearFotos } from './config/imagenes.js';
import { crearIconos } from './config/iconos.js';
import { assets, construirCss, construirJs } from './config/assets.js';
import { schemaSitio } from './config/schema.js';

const DIRS = { input: 'src', output: '_site' };

export default function (eleventyConfig) {
  /* Datos en YAML (src/_data/*.yml): fáciles de editar y con comentarios. */
  eleventyConfig.addDataExtension('yml,yaml', (contenido) => leerYaml(contenido));

  /* Archivos que se copian tal cual. */
  eleventyConfig.addPassthroughCopy({
    'src/assets/fonts': 'assets/fonts',
    'src/assets/marca': 'assets/marca',
    'src/assets/og': 'assets/og',
    'src/estaticos': '/',
  });
  eleventyConfig.ignores.add('src/**/LEEME.md');

  /* CSS y JS: se compilan antes de cada build. */
  eleventyConfig.addWatchTarget('./src/assets/css/');
  eleventyConfig.addWatchTarget('./src/assets/js/');
  eleventyConfig.on('eleventy.before', async () => {
    await Promise.all([construirCss(DIRS), construirJs(DIRS)]);
  });
  eleventyConfig.addShortcode('asset', (tipo) => assets[tipo]);

  /* Filtros de texto y enlaces. */
  for (const nombre of ['texto', 'parrafos', 'plano', 'whatsapp', 'telefono', 'email', 'mapa', 'absoluta', 'porIds', 'todasLasPreguntas', 'dosDigitos', 'jsonSeguro', 'activo']) {
    eleventyConfig.addFilter(nombre, filtros[nombre]);
  }
  eleventyConfig.addFilter('esProvisorio', filtros.esProvisorio);
  eleventyConfig.addFilter('schema', function (site, pagina) {
    return filtros.jsonSeguro(schemaSitio(site, pagina));
  });
  eleventyConfig.addFilter('anio', () => new Date().getFullYear());

  /* Fotos con reemplazo automático de las provisionales. */
  const { foto, resolver } = crearFotos(DIRS);
  eleventyConfig.addShortcode('foto', foto);
  eleventyConfig.addFilter('fotoExiste', (nombre) => Boolean(resolver(nombre)));
  eleventyConfig.addFilter('fotoProvisional', (nombre) => Boolean(resolver(nombre)?.provisional));

  /* Íconos. */
  const { icono, sprite, limpiarCache } = crearIconos(DIRS);
  eleventyConfig.addShortcode('icono', icono);
  eleventyConfig.addTransform('sprite-iconos', sprite);
  eleventyConfig.on('eleventy.beforeWatch', limpiarCache);

  /* Optimización de imágenes: AVIF + WebP en varios tamaños, con ancho y alto. */
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ['avif', 'webp'],
    widths: [480, 800, 1200, 1600],
    urlPath: '/assets/img/',
    outputDir: `${DIRS.output}/assets/img/`,
    sharpAvifOptions: { quality: 55, effort: 4 },
    sharpWebpOptions: { quality: 78 },
    filenameFormat: (id, src, width, format) => {
      const nombre = src.split('/').pop().replace(/\.[^.]+$/, '');
      return `${nombre}-${id.slice(0, 6)}-${width}.${format}`;
    },
    htmlOptions: {
      imgAttributes: { loading: 'lazy', decoding: 'async' },
      fallback: 'largest',
    },
  });

  /* Permite publicar el sitio en una subcarpeta (por ejemplo GitHub Pages) con --pathprefix. */
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.setServerOptions({ showAllHosts: false, domDiff: true });
}

export const config = {
  dir: { input: DIRS.input, output: DIRS.output, includes: '_includes', data: '_data' },
  templateFormats: ['njk', 'md'],
  htmlTemplateEngine: 'njk',
  markdownTemplateEngine: 'njk',
};
