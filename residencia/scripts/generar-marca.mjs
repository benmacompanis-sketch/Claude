#!/usr/bin/env node
/**
 * Genera los archivos de marca a partir del isologo (ventana en arco con el sol saliendo):
 *   src/assets/marca/isologo.svg      → versión de línea (se usa en el sitio)
 *   src/assets/marca/logo.png         → 512 × 512 (datos estructurados)
 *   src/estaticos/icon.svg            → favicon vectorial
 *   src/estaticos/favicon.ico         → 32 × 32
 *   src/estaticos/apple-touch-icon.png, icon-192.png, icon-512.png
 *
 * Si la residencia ya tiene logo propio, reemplazá estos archivos por los reales
 * (mismos nombres) y ajustá src/_includes/partials/logo.njk.
 *
 * Uso: node scripts/generar-marca.mjs
 */
import fs from 'node:fs';
import sharp from 'sharp';

const VERDE = '#2C4A42';
const ARCILLA = '#C07A52';
const CREMA = '#F7F2EA';

// Isologo de línea: puerta-ventana en arco con un "abanico" de luz (el sol que sale).
// Usa currentColor para heredar el color del texto.
const rayos = (cx, cy, r1, r2, ancho, color) =>
  [30, 60, 90, 120, 150]
    .map((grados) => {
      const a = (grados * Math.PI) / 180;
      const p = (r) => `${(cx + Math.cos(a) * r).toFixed(2)} ${(cy - Math.sin(a) * r).toFixed(2)}`;
      return `<path d="M${p(r1)}L${p(r2)}" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round"/>`;
    })
    .join('');

const isologo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" fill="none">
  <path d="M6 45V20a14 14 0 0 1 28 0v25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M2.5 45h35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M6 20h28M20 20v25" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>
  <path d="M13.5 20a6.5 6.5 0 0 1 13 0Z" fill="${ARCILLA}"/>
  ${rayos(20, 20, 8.6, 11.4, 1.2, ARCILLA)}
</svg>
`;

// Versión para íconos pequeños (se lee bien a 16–32 px).
const solido = (fondo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  ${fondo ? `<rect width="64" height="64" rx="14" fill="${CREMA}"/>` : ''}
  <path d="M15 55V29a17 17 0 0 1 34 0v26" fill="none" stroke="${VERDE}" stroke-width="4" stroke-linecap="round"/>
  <path d="M9 55h46" stroke="${VERDE}" stroke-width="4" stroke-linecap="round"/>
  <path d="M15 29h34M32 29v26" stroke="${VERDE}" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>
  <path d="M23 29a9 9 0 0 1 18 0Z" fill="${ARCILLA}"/>
  ${rayos(32, 29, 11.5, 14.2, 2.2, ARCILLA)}
</svg>
`;

// Favicon SVG con soporte de modo oscuro del navegador.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <style>.l{stroke:${VERDE}}@media (prefers-color-scheme:dark){.l{stroke:#DCE5DC}}</style>
  <path class="l" d="M15 55V29a17 17 0 0 1 34 0v26" fill="none" stroke-width="4.5" stroke-linecap="round"/>
  <path class="l" d="M9 55h46" stroke-width="4.5" stroke-linecap="round"/>
  <path class="l" d="M15 29h34M32 29v26" stroke-width="3" stroke-linecap="round" opacity=".7"/>
  <path d="M23 29a9 9 0 0 1 18 0Z" fill="${ARCILLA}"/>
</svg>
`;

/** Crea un .ico que contiene un PNG (formato soportado por todos los navegadores actuales). */
function ico(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0);
  entry.writeUInt8(32, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

fs.mkdirSync('src/assets/marca', { recursive: true });
fs.mkdirSync('src/estaticos', { recursive: true });
fs.writeFileSync('src/assets/marca/isologo.svg', isologo);
fs.writeFileSync('src/estaticos/icon.svg', favicon);

const png = (svg, size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

fs.writeFileSync('src/assets/marca/logo.png', await png(solido(true), 512));
fs.writeFileSync('src/estaticos/apple-touch-icon.png', await png(solido(true), 180));
fs.writeFileSync('src/estaticos/icon-192.png', await png(solido(true), 192));
fs.writeFileSync('src/estaticos/icon-512.png', await png(solido(true), 512));
fs.writeFileSync('src/estaticos/favicon.ico', ico(await png(solido(false), 32)));

console.log('✓ Marca e íconos generados.');
