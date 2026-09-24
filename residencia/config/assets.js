/**
 * CSS y JavaScript.
 *
 * - CSS: src/assets/css/main.css importa el resto de los archivos en orden. Lightning CSS
 *   los une en un solo archivo, lo minifica y agrega compatibilidad según "browserslist"
 *   (package.json).
 * - JS: src/assets/js/main.js es el punto de entrada. esbuild lo empaqueta y minifica.
 *   Los módulos que solo usan algunas páginas (galería, formulario, mapa) se cargan bajo
 *   demanda, en archivos aparte.
 *
 * Los nombres llevan un hash del contenido (main-3fa2c1b0.css) para que el navegador
 * pueda guardarlos en caché por mucho tiempo sin quedar desactualizado.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import browserslist from 'browserslist';
import * as esbuild from 'esbuild';
import { bundleAsync, browserslistToTargets } from 'lightningcss';

export const assets = { css: '/assets/css/main.css', js: '/assets/js/main.js' };

const hash = (contenido) => crypto.createHash('sha1').update(contenido).digest('hex').slice(0, 8);

export async function construirCss({ input, output }) {
  const targets = browserslistToTargets(browserslist());
  const { code } = await bundleAsync({
    filename: path.join(input, 'assets/css/main.css'),
    minify: true,
    sourceMap: false,
    targets,
  });
  const dir = path.join(output, 'assets/css');
  fs.mkdirSync(dir, { recursive: true });
  for (const archivo of fs.readdirSync(dir)) if (/^main-[a-f0-9]+\.css$/.test(archivo)) fs.rmSync(path.join(dir, archivo));
  const nombre = `main-${hash(code)}.css`;
  fs.writeFileSync(path.join(dir, nombre), code);
  assets.css = `/assets/css/${nombre}`;
}

export async function construirJs({ input, output }) {
  const outdir = path.join(output, 'assets/js');
  fs.rmSync(outdir, { recursive: true, force: true });
  const resultado = await esbuild.build({
    entryPoints: [path.join(input, 'assets/js/main.js')],
    bundle: true,
    splitting: true,
    format: 'esm',
    minify: true,
    target: ['es2020', 'safari14.1'],
    outdir,
    entryNames: '[name]-[hash]',
    chunkNames: 'modulos/[name]-[hash]',
    metafile: true,
    legalComments: 'none',
    logLevel: 'warning',
  });
  const [salida] = Object.entries(resultado.metafile.outputs).find(([, info]) => info.entryPoint?.endsWith('main.js'));
  assets.js = `/${path.relative(output, salida).split(path.sep).join('/')}`;
}
