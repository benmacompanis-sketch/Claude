#!/usr/bin/env node
/**
 * Genera la imagen que se ve al compartir el sitio (WhatsApp, Facebook, etc.):
 *   src/assets/og/residencia.jpg (1200 × 630)
 *
 * Usa el nombre y la ciudad de src/_data/site.yml, las tipografías del sitio y la
 * foto del inicio (la real si ya está cargada; si no, la ilustración provisional).
 *
 * Requiere Playwright (npx playwright install chromium, o una instalación global).
 * Uso: node scripts/generar-og.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { load } from 'js-yaml';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs').catch(() => {
    console.error('Instalá Playwright para generar la imagen: npm i -D playwright && npx playwright install chromium');
    process.exit(1);
  }));
}

const site = load(fs.readFileSync('src/_data/site.yml', 'utf8'));
const fuentes = path.resolve('src/assets/fonts');
// Las tipografías se incrustan en base64 para que el navegador las use sin pedir archivos.
const url = (archivo) => `data:font/woff2;base64,${fs.readFileSync(path.join(fuentes, archivo)).toString('base64')}`;

const candidatas = ['jpg', 'jpeg', 'png', 'webp'].map((ext) => `src/assets/img/inicio/hero.${ext}`);
const foto = candidatas.find((f) => fs.existsSync(f)) ?? 'src/assets/img/_provisionales/inicio/hero.svg';
const fotoPng = await sharp(foto).resize(620, 760, { fit: 'cover' }).png().toBuffer();
const fotoData = `data:image/png;base64,${fotoPng.toString('base64')}`;
const escapar = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{font-family:"ND";src:url(${url('newsreader-display.woff2')})}
@font-face{font-family:"NI";src:url(${url('newsreader-italic.woff2')})}
@font-face{font-family:"F";src:url(${url('figtree.woff2')});font-weight:400 700}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#f9f5ee;font-family:F;color:#1d2824;display:grid;grid-template-columns:1fr 440px;overflow:hidden}
.t{padding:70px 40px 60px 76px;display:flex;flex-direction:column}
.b{display:flex;align-items:center;gap:16px}
.b svg{width:40px;height:48px;color:#2c4a42}
.n{font-family:ND;font-size:34px;line-height:1}
.d{font-size:14px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#5f5b53;margin-top:6px}
h1{font-family:ND;font-weight:400;font-size:60px;line-height:1.05;letter-spacing:-.02em;margin-top:auto;max-width:14ch}
h1 em{font-family:NI;font-style:italic;color:#36594f}
.l{margin-top:28px;display:flex;align-items:center;gap:12px;font-size:18px;color:#5f5b53}
.l::before{content:"";width:28px;height:1px;background:#8f4e2d}
.f{position:relative;margin:48px 60px 0 0}
.f img{width:380px;height:582px;object-fit:cover;border-radius:190px 190px 0 0;display:block}
.f::before{content:"";position:absolute;inset:-14px 14px 0 -14px;border:1.5px solid #c9b89c;border-radius:204px 204px 0 0}
</style></head><body>
<div class="t">
  <div class="b"><svg viewBox="0 0 40 48" fill="none"><path d="M6 45V20a14 14 0 0 1 28 0v25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M2.5 45h35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6 20h28M20 20v25" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".6"/><path d="M13.5 20a6.5 6.5 0 0 1 13 0Z" fill="#C07A52"/><path d="M27.45 15.7L29.87 14.3M24.3 12.55L25.7 10.13M20 11.4V8.6M15.7 12.55L14.3 10.13M12.55 15.7L10.13 14.3" stroke="#C07A52" stroke-width="1.2" stroke-linecap="round"/></svg>
  <div><div class="n">${escapar(site.nombre)}</div><div class="d">${escapar(site.descriptor)}</div></div></div>
  <h1>Acá cada persona se siente <em>en casa</em>, y cada familia, acompañada.</h1>
  <p class="l">${escapar(site.ubicacion.ciudad)}, ${escapar(site.ubicacion.provincia)} · Coordiná una visita</p>
</div>
<div class="f"><img src="${fotoData}" alt=""></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

fs.mkdirSync('src/assets/og', { recursive: true });
await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile('src/assets/og/residencia.jpg');
console.log('✓ Imagen para compartir generada: src/assets/og/residencia.jpg');
