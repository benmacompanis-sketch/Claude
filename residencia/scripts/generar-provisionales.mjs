#!/usr/bin/env node
/**
 * GENERADOR DE IMÁGENES PROVISIONALES
 * ===================================
 * Crea ilustraciones en SVG (luz natural, texturas y objetos cotidianos) que respetan la
 * estética del sitio mientras no haya fotos reales de la residencia.
 *
 * No hace falta volver a correrlo: los SVG ya están en src/assets/img/_provisionales/.
 *
 * ¿Cómo se reemplaza una imagen provisional por una foto real?
 *   Guardá la foto con el MISMO nombre (sin importar la extensión: .jpg, .jpeg, .png, .webp)
 *   en la carpeta equivalente fuera de "_provisionales". Por ejemplo:
 *     provisional: src/assets/img/_provisionales/instalaciones/habitacion-1.svg
 *     foto real:   src/assets/img/instalaciones/habitacion-1.jpg
 *   El sitio la detecta sola al compilar y genera las versiones optimizadas (AVIF/WebP).
 *
 * Uso (opcional, solo si querés regenerarlas): node scripts/generar-provisionales.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  Scene, P, f, mix, lighten, darken, leafD, foliage, windowLight, wall, linen, woodSurface,
  plate, cup, glass, mate, termo, medialuna, napkin, fork, knife, spoon, bowl, lunchPlate, fruitBowl,
  book, glasses, card, checkers, domino, puzzlePiece, yarn, needle, plantTop, flower, cake, confetti,
  cookie, vinyl, sheetMusic, watercolorPalette, brush, paintingPaper, crossword, pencil, ball, band,
  towel, teapot, floor, armchair, sideTable, lamp, monstera, potFront, frame,
  notebook, pen, stethoscope, woodenSpoon, board, herbs, wrench, screwdriver, tape, agenda, knitSwatch,
} from './provisionales/lib.mjs';

const OUT = path.resolve('src/assets/img/_provisionales');

/* ======================================================================
   Escenas frontales adicionales
   ====================================================================== */


function nightstand(s, cx, baseY, w, { color = P.woodLight } = {}) {
  const h = w * 0.85;
  const g = s.linear([[0, lighten(color, 0.1)], [1, darken(color, 0.12)]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  return `<ellipse cx="${f(cx + 10)}" cy="${f(baseY + 3)}" rx="${f(w * 0.6)}" ry="${f(w * 0.05)}" fill="${P.shadow}" opacity="0.35" filter="url(#${s.blur(10)})"/>
<rect x="${f(cx - w / 2)}" y="${f(baseY - h)}" width="${f(w)}" height="${f(h - w * 0.1)}" rx="4" fill="${g}" filter="url(#${s.shadow(6, 0.6)})"/>
<rect x="${f(cx - w * 0.44)}" y="${f(baseY - h + w * 0.12)}" width="${f(w * 0.88)}" height="${f(h * 0.3)}" rx="3" fill="none" stroke="${darken(color, 0.25)}" stroke-width="2" opacity="0.5"/>
<circle cx="${f(cx)}" cy="${f(baseY - h + w * 0.12 + h * 0.15)}" r="${f(w * 0.03)}" fill="${P.gold}"/>
<rect x="${f(cx - w * 0.44)}" y="${f(baseY - w * 0.1)}" width="${f(w * 0.05)}" height="${f(w * 0.1)}" fill="${darken(color, 0.3)}"/><rect x="${f(cx + w * 0.39)}" y="${f(baseY - w * 0.1)}" width="${f(w * 0.05)}" height="${f(w * 0.1)}" fill="${darken(color, 0.3)}"/>`;
}

/** Cama vista desde los pies, contra la pared: cabecera tapizada, almohadas y manta. */
function bedFront(s, cx, baseY, w, { head = '#A7B3A0', duvet = '#F8F4EC', throwColor = P.clay, dim = 0 } = {}) {
  const d = (c) => (dim ? mix(c, '#1b2a2c', dim) : c);
  const headTop = baseY - w * 0.6;
  const headW = w * 0.94;
  const back = baseY - w * 0.36;
  const front = baseY - w * 0.26;
  const bottom = baseY - w * 0.07;
  const headG = s.linear([[0, lighten(d(head), 0.1)], [1, darken(d(head), 0.12)]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  const topG = s.linear([[0, d('#FFFFFF')], [1, d(duvet)]]);
  const faceG = s.linear([[0, d(darken(duvet, 0.03))], [1, d(darken(duvet, 0.12))]]);
  const pil = s.radial([[0, d('#FFFFFF')], [0.75, d('#F2EDE3')], [1, d('#D9D0C0')]], { cx: 0.42, cy: 0.38, r: 0.72 });
  const throwG = s.linear([[0, d(lighten(throwColor, 0.1))], [1, d(darken(throwColor, 0.18))]]);
  const knit = s.noise({ fx: 0.3, fy: 0.9, octaves: 2, color: darken(throwColor, 0.55), alpha: 0.2, seed: 83 });
  const clip = s.id('cth');
  const throwTop = front - w * 0.05;
  const throwBot = front + w * 0.1;
  const throwPath = `M${f(cx - w * 0.47)},${f(throwTop)} L${f(cx + w * 0.47)},${f(throwTop)} L${f(cx + w * 0.505)},${f(front)} L${f(cx + w * 0.5)},${f(throwBot)} L${f(cx - w * 0.5)},${f(throwBot)} L${f(cx - w * 0.505)},${f(front)}Z`;
  s.def(`<clipPath id="${clip}"><path d="${throwPath}"/></clipPath>`);
  let out = `<ellipse cx="${f(cx + 20)}" cy="${f(baseY + 4)}" rx="${f(w * 0.56)}" ry="${f(w * 0.03)}" fill="${P.shadow}" opacity="0.45" filter="url(#${s.blur(16)})"/>`;
  out += `<rect x="${f(cx - headW / 2)}" y="${f(headTop)}" width="${f(headW)}" height="${f(back - headTop + 20)}" rx="${f(w * 0.035)}" fill="${headG}" filter="url(#${s.shadow(10, 0.7)})"/>`;
  for (let i = 1; i < 9; i++) out += `<rect x="${f(cx - headW / 2 + (i * headW) / 9 - 1)}" y="${f(headTop + 14)}" width="2" height="${f(back - headTop - 20)}" fill="${darken(d(head), 0.2)}" opacity="0.35"/>`;
  out += `<rect x="${f(cx - w * 0.49)}" y="${f(bottom)}" width="${f(w * 0.98)}" height="${f(w * 0.035)}" rx="4" fill="${d(P.woodDark)}"/>`;
  out += `<rect x="${f(cx - w * 0.46)}" y="${f(bottom + w * 0.03)}" width="${f(w * 0.03)}" height="${f(w * 0.04)}" fill="${d(darken(P.woodDark, 0.2))}"/><rect x="${f(cx + w * 0.43)}" y="${f(bottom + w * 0.03)}" width="${f(w * 0.03)}" height="${f(w * 0.04)}" fill="${d(darken(P.woodDark, 0.2))}"/>`;
  out += `<polygon points="${f(cx - w * 0.44)},${f(back)} ${f(cx + w * 0.44)},${f(back)} ${f(cx + w * 0.5)},${f(front)} ${f(cx - w * 0.5)},${f(front)}" fill="${topG}"/>`;
  out += `<path d="M${f(cx - w * 0.5)},${f(front)} L${f(cx + w * 0.5)},${f(front)} L${f(cx + w * 0.5)},${f(bottom + 4)} Q${f(cx)},${f(bottom + 12)} ${f(cx - w * 0.5)},${f(bottom + 4)}Z" fill="${faceG}" filter="url(#${s.shadow(6, 0.6)})"/>`;
  for (let i = 0; i < 7; i++) {
    const x = cx - w * 0.42 + i * w * 0.14;
    out += `<path d="M${f(x)},${f(front + 8)} Q${f(x + 10)},${f((front + bottom) / 2)} ${f(x - 4)},${f(bottom)}" stroke="${d('#CFC5B3')}" stroke-width="4" fill="none" opacity="0.45" filter="url(#${s.blur(2)})"/>`;
  }
  out += `<g filter="url(#${s.shadow(8, 0.7)})"><rect x="${f(cx - w * 0.43)}" y="${f(back - w * 0.15)}" width="${f(w * 0.4)}" height="${f(w * 0.17)}" rx="${f(w * 0.06)}" fill="${pil}" transform="rotate(-2 ${f(cx - w * 0.23)} ${f(back)})"/>
<rect x="${f(cx + w * 0.03)}" y="${f(back - w * 0.15)}" width="${f(w * 0.4)}" height="${f(w * 0.17)}" rx="${f(w * 0.06)}" fill="${pil}" transform="rotate(2 ${f(cx + w * 0.23)} ${f(back)})"/></g>`;
  out += `<g filter="url(#${s.shadow(6, 0.7)})"><rect x="${f(cx - w * 0.3)}" y="${f(back - w * 0.08)}" width="${f(w * 0.24)}" height="${f(w * 0.12)}" rx="${f(w * 0.04)}" fill="${s.linear([[0, d(lighten(P.sage, 0.2))], [1, d(P.sageDark)]])}" transform="rotate(-4 ${f(cx - w * 0.18)} ${f(back)})"/>
<rect x="${f(cx + w * 0.06)}" y="${f(back - w * 0.075)}" width="${f(w * 0.22)}" height="${f(w * 0.115)}" rx="${f(w * 0.04)}" fill="${s.linear([[0, d(P.clayLight)], [1, d(P.clay)]])}" transform="rotate(3 ${f(cx + w * 0.17)} ${f(back)})"/></g>`;
  out += `<path d="${throwPath}" fill="${throwG}"/><rect x="${f(cx - w * 0.52)}" y="${f(throwTop)}" width="${f(w * 1.04)}" height="${f(throwBot - throwTop)}" clip-path="url(#${clip})" filter="url(#${knit})"/>`;
  out += `<rect x="${f(cx - w * 0.5)}" y="${f(throwBot - 6)}" width="${f(w)}" height="6" fill="${d(darken(throwColor, 0.3))}" opacity="0.5"/>`;
  return out;
}

/** Baño adaptado: barras de apoyo, asiento rebatible y ducha de mano. */
function accessibleBath(s) {
  const { w, h } = s;
  let out = `<rect width="${w}" height="${h}" fill="#D9DDD5"/>`;
  const tw = 150;
  const th = 72;
  const colors = ['#EEF0EA', '#E9ECE5', '#F2F3EE', '#E6EAE3'];
  for (let row = 0; row * th < h + th; row++) {
    const off = row % 2 ? -tw / 2 : 0;
    for (let col = -1; col * tw < w + tw; col++) out += `<rect x="${f(col * tw + off + 2)}" y="${f(row * th + 2)}" width="${tw - 4}" height="${th - 4}" rx="3" fill="${s.pick(colors)}"/>`;
  }
  out += `<rect width="${w}" height="${h}" fill="${s.linear([[0, '#fff', 0.35], [0.6, '#fff', 0], [1, '#3a3a30', 0.14]], { x1: 0, y1: 0, x2: 1, y2: 1 })}"/>`;
  out += windowLight(s, { x: w * 0.05, y: -h * 0.15, paneW: 260, paneH: 400, cols: 2, rows: 2, gap: 24, shear: [0.1, -0.5], soft: 20, opacity: 0.42, color: '#FFFDF4' });
  const metal = s.linear([[0, '#FAFAF7'], [0.35, '#C9C8C2'], [0.55, '#8F8D86'], [0.75, '#D8D7D1'], [1, '#76746D']]);
  const metalV = s.linear([[0, '#FAFAF7'], [0.35, '#C9C8C2'], [0.55, '#8F8D86'], [0.75, '#D8D7D1'], [1, '#76746D']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const flange = s.radial([[0, '#FFFFFF'], [0.6, '#CFCDC6'], [1, '#8E8C85']], { cx: 0.38, cy: 0.35 });
  // barra horizontal
  const by = h * 0.4;
  out += `<rect x="${f(w * 0.1)}" y="${f(by + 26)}" width="${f(w * 0.5)}" height="28" rx="14" fill="${P.shadow}" opacity="0.18" filter="url(#${s.blur(12)})"/>`;
  out += `<rect x="${f(w * 0.08)}" y="${f(by)}" width="${f(w * 0.5)}" height="32" rx="16" fill="${metal}"/>`;
  for (const x of [w * 0.1, w * 0.56]) out += `<circle cx="${f(x)}" cy="${f(by + 16)}" r="30" fill="${flange}" filter="url(#${s.shadow(6, 0.6)})"/>`;
  // barra vertical
  const vx = w * 0.68;
  out += `<rect x="${f(vx + 24)}" y="${f(h * 0.2)}" width="26" height="${f(h * 0.36)}" rx="13" fill="${P.shadow}" opacity="0.16" filter="url(#${s.blur(12)})"/>`;
  out += `<rect x="${f(vx)}" y="${f(h * 0.18)}" width="32" height="${f(h * 0.36)}" rx="16" fill="${metalV}"/>`;
  for (const y of [h * 0.2, h * 0.52]) out += `<circle cx="${f(vx + 16)}" cy="${f(y)}" r="30" fill="${flange}" filter="url(#${s.shadow(6, 0.6)})"/>`;
  // asiento rebatible de listones
  const sx0 = w * 0.14;
  const sx1 = w * 0.52;
  const sy = h * 0.66;
  const teak = s.linear([[0, '#C99A6B'], [1, '#9E7147']]);
  out += `<ellipse cx="${f((sx0 + sx1) / 2 + 30)}" cy="${f(sy + 150)}" rx="${f((sx1 - sx0) * 0.6)}" ry="40" fill="${P.shadow}" opacity="0.2" filter="url(#${s.blur(22)})"/>`;
  for (const x of [sx0 + 30, sx1 - 50]) out += `<path d="M${f(x)},${f(sy - 40)} L${f(x + 20)},${f(sy - 40)} L${f(x + 20)},${f(sy + 110)} L${f(x + 8)},${f(sy + 110)}Z" fill="${metalV}"/>`;
  for (let i = 0; i < 4; i++) out += `<rect x="${f(sx0 - i * 10)}" y="${f(sy + i * 22)}" width="${f(sx1 - sx0 + i * 20)}" height="18" rx="6" fill="${teak}" filter="url(#${s.shadow(4, 0.6)})"/>`;
  // ducha de mano en barral
  const dx = w * 0.86;
  out += `<rect x="${f(dx)}" y="${f(h * 0.12)}" width="16" height="${f(h * 0.56)}" rx="8" fill="${metalV}" filter="url(#${s.shadow(6, 0.6)})"/>`;
  out += `<path d="M${f(dx + 8)},${f(h * 0.3)} C${f(dx - 60)},${f(h * 0.5)} ${f(dx + 70)},${f(h * 0.7)} ${f(dx + 8)},${f(h * 0.78)}" fill="none" stroke="#B9B6AE" stroke-width="10" stroke-linecap="round" filter="url(#${s.shadow(4, 0.5)})"/>`;
  out += `<g transform="rotate(-25 ${f(dx + 8)} ${f(h * 0.28)})" filter="url(#${s.shadow(8, 0.7)})"><rect x="${f(dx - 4)}" y="${f(h * 0.2)}" width="24" height="90" rx="12" fill="${metalV}"/><ellipse cx="${f(dx + 8)}" cy="${f(h * 0.2)}" rx="44" ry="22" fill="${flange}"/></g>`;
  // estante con toallas
  const shx = w * 0.12;
  const shy = h * 0.2;
  out += `<rect x="${f(shx)}" y="${f(shy)}" width="${f(w * 0.3)}" height="14" fill="${P.woodLight}" filter="url(#${s.shadow(8, 0.7)})"/>`;
  out += `<rect x="${f(shx + 24)}" y="${f(shy - 46)}" width="${f(w * 0.14)}" height="24" rx="11" fill="${P.sage}" filter="url(#${s.shadow(3, 0.5)})"/><rect x="${f(shx + 18)}" y="${f(shy - 22)}" width="${f(w * 0.15)}" height="24" rx="11" fill="${P.cream}" filter="url(#${s.shadow(3, 0.5)})"/>`;
  out += potFront(s, shx + w * 0.24, shy, 50, { color: '#EDE7DC' });
  const fl = foliage(s, { x: shx + w * 0.24, y: shy - 46, angle: -1.57, branches: 4, spread: 1.6, length: 100, leafLen: 24, leafWid: 8, density: 7 });
  out += `<g fill="none" stroke="#5E7F4C" stroke-width="2">${fl.stems}</g><g fill="#6E8F57">${fl.leaves}</g>`;
  return out;
}

function bookStack(s, x, baseY, w) {
  const colors = [P.green, P.clay, P.sand, P.sageDark];
  let out = '';
  let y = baseY;
  colors.slice(0, 3).forEach((c, i) => {
    const bw = w * (1 - i * 0.1);
    const bh = w * 0.14;
    y -= bh;
    out += `<rect x="${f(x + (w - bw) / 2 + (i % 2 ? 4 : -3))}" y="${f(y)}" width="${f(bw)}" height="${f(bh - 1)}" rx="2" fill="${c}" filter="url(#${s.shadow(3, 0.6)})"/><rect x="${f(x + (w - bw) / 2 + (i % 2 ? 4 : -3) + 4)}" y="${f(y + bh * 0.35)}" width="${f(bw - 8)}" height="2" fill="#fff" opacity="0.3"/>`;
  });
  return out;
}

function sofa(s, cx, baseY, w, { color = '#D9CDBB' } = {}) {
  const h = w * 0.36;
  const top = baseY - h;
  const fab = s.linear([[0, lighten(color, 0.1)], [1, darken(color, 0.14)]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  const cushG = s.linear([[0, lighten(color, 0.2)], [1, darken(color, 0.05)]]);
  const tex = s.noise({ fx: 0.5, octaves: 2, color: darken(color, 0.6), alpha: 0.08, seed: 91 });
  let out = `<ellipse cx="${f(cx + 20)}" cy="${f(baseY + 6)}" rx="${f(w * 0.55)}" ry="${f(w * 0.025)}" fill="${P.shadow}" opacity="0.4" filter="url(#${s.blur(14)})"/>`;
  out += `<rect x="${f(cx - w * 0.47)}" y="${f(baseY - h * 0.12)}" width="${f(w * 0.02)}" height="${f(h * 0.12)}" fill="${P.woodDark}"/><rect x="${f(cx + w * 0.45)}" y="${f(baseY - h * 0.12)}" width="${f(w * 0.02)}" height="${f(h * 0.12)}" fill="${P.woodDark}"/>`;
  out += `<rect x="${f(cx - w * 0.46)}" y="${f(top)}" width="${f(w * 0.92)}" height="${f(h * 0.62)}" rx="${f(h * 0.12)}" fill="${fab}"/>`;
  out += `<rect x="${f(cx - w * 0.5)}" y="${f(top + h * 0.3)}" width="${f(w * 0.1)}" height="${f(h * 0.58)}" rx="${f(h * 0.1)}" fill="${fab}"/><rect x="${f(cx + w * 0.4)}" y="${f(top + h * 0.3)}" width="${f(w * 0.1)}" height="${f(h * 0.58)}" rx="${f(h * 0.1)}" fill="${fab}"/>`;
  for (let i = 0; i < 3; i++) out += `<rect x="${f(cx - w * 0.39 + i * w * 0.265)}" y="${f(top + h * 0.08)}" width="${f(w * 0.255)}" height="${f(h * 0.42)}" rx="${f(h * 0.1)}" fill="${cushG}" filter="url(#${s.shadow(4, 0.5)})"/>`;
  out += `<rect x="${f(cx - w * 0.4)}" y="${f(top + h * 0.52)}" width="${f(w * 0.8)}" height="${f(h * 0.36)}" rx="${f(h * 0.08)}" fill="${fab}"/>`;
  out += `<rect x="${f(cx - w * 0.3)}" y="${f(top + h * 0.02)}" width="${f(w * 0.12)}" height="${f(h * 0.3)}" rx="${f(h * 0.08)}" fill="${s.linear([[0, lighten(P.sage, 0.2)], [1, P.sageDark]])}" transform="rotate(-8 ${f(cx - w * 0.24)} ${f(top + h * 0.17)})" filter="url(#${s.shadow(4, 0.6)})"/>`;
  out += `<rect x="${f(cx + w * 0.2)}" y="${f(top + h * 0.04)}" width="${f(w * 0.11)}" height="${f(h * 0.28)}" rx="${f(h * 0.08)}" fill="${s.linear([[0, P.clayLight], [1, P.clay]])}" transform="rotate(6 ${f(cx + w * 0.25)} ${f(top + h * 0.18)})" filter="url(#${s.shadow(4, 0.6)})"/>`;
  out += `<rect x="${f(cx - w * 0.5)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" filter="url(#${tex})" opacity="0.8"/>`;
  return out;
}

function coffeeTable(s, cx, baseY, w) {
  const h = w * 0.2;
  const g = s.linear([[0, lighten(P.wood, 0.1)], [1, darken(P.wood, 0.15)]]);
  return `<ellipse cx="${f(cx + 12)}" cy="${f(baseY + 4)}" rx="${f(w * 0.55)}" ry="${f(w * 0.04)}" fill="${P.shadow}" opacity="0.35" filter="url(#${s.blur(10)})"/>
<rect x="${f(cx - w * 0.42)}" y="${f(baseY - h)}" width="${f(w * 0.04)}" height="${f(h)}" fill="${darken(P.wood, 0.25)}"/><rect x="${f(cx + w * 0.38)}" y="${f(baseY - h)}" width="${f(w * 0.04)}" height="${f(h)}" fill="${darken(P.wood, 0.25)}"/>
<rect x="${f(cx - w / 2)}" y="${f(baseY - h - 14)}" width="${f(w)}" height="16" rx="6" fill="${g}"/>`;
}

function rug(s, cx, y, w, h, color = P.sand) {
  const tex = s.noise({ fx: 0.6, octaves: 2, color: darken(color, 0.5), alpha: 0.14, seed: 101 });
  const clip = s.id('cr');
  s.def(`<clipPath id="${clip}"><ellipse cx="${f(cx)}" cy="${f(y)}" rx="${f(w / 2)}" ry="${f(h / 2)}"/></clipPath>`);
  return `<ellipse cx="${f(cx)}" cy="${f(y)}" rx="${f(w / 2)}" ry="${f(h / 2)}" fill="${color}"/><rect x="${f(cx - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" clip-path="url(#${clip})" filter="url(#${tex})"/>
<ellipse cx="${f(cx)}" cy="${f(y)}" rx="${f(w / 2 - 18)}" ry="${f(h / 2 - 8)}" fill="none" stroke="${darken(color, 0.12)}" stroke-width="3" opacity="0.5"/>`;
}

function pendant(s, cx, y, w, { color = P.green, on = true } = {}) {
  const g = s.linear([[0, lighten(color, 0.2)], [1, darken(color, 0.2)]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const glow = on ? `<ellipse cx="${f(cx)}" cy="${f(y + w * 0.5)}" rx="${f(w * 1.4)}" ry="${f(w * 0.9)}" fill="${s.radial([[0, '#FFE2A8', 0.5], [1, '#FFE2A8', 0]])}"/>` : '';
  return `<rect x="${f(cx - 1)}" y="0" width="2" height="${f(y)}" fill="#3a332b" opacity="0.6"/>${glow}
<path d="M${f(cx - w / 2)},${f(y + w * 0.42)} Q${f(cx - w / 2)},${f(y)} ${f(cx)},${f(y)} Q${f(cx + w / 2)},${f(y)} ${f(cx + w / 2)},${f(y + w * 0.42)}Z" fill="${g}" filter="url(#${s.shadow(6, 0.5)})"/>
<ellipse cx="${f(cx)}" cy="${f(y + w * 0.42)}" rx="${f(w / 2)}" ry="${f(w * 0.06)}" fill="#FFF1CF" opacity="${on ? 0.95 : 0.4}"/>`;
}

function diningTable(s, cx, topY, w, { chairs = 3 } = {}) {
  const woodG = s.linear([[0, lighten(P.wood, 0.12)], [1, darken(P.wood, 0.12)]]);
  let out = '';
  // respaldos de sillas (detrás de la mesa)
  for (let i = 0; i < chairs; i++) {
    const chx = cx - w * 0.3 + i * (w * 0.6) / Math.max(1, chairs - 1);
    const ch = w * 0.22;
    out += `<g filter="url(#${s.shadow(6, 0.6)})"><rect x="${f(chx - w * 0.08)}" y="${f(topY - ch)}" width="${f(w * 0.16)}" height="${f(w * 0.03)}" rx="6" fill="${darken(P.wood, 0.1)}"/>`;
    for (let k = 0; k < 3; k++) out += `<rect x="${f(chx - w * 0.06 + k * w * 0.05)}" y="${f(topY - ch + w * 0.03)}" width="${f(w * 0.018)}" height="${f(ch - w * 0.03)}" fill="${darken(P.wood, 0.15)}"/>`;
    out += `<rect x="${f(chx - w * 0.085)}" y="${f(topY - ch)}" width="${f(w * 0.02)}" height="${f(ch)}" fill="${darken(P.wood, 0.2)}"/><rect x="${f(chx + w * 0.065)}" y="${f(topY - ch)}" width="${f(w * 0.02)}" height="${f(ch)}" fill="${darken(P.wood, 0.2)}"/></g>`;
  }
  // patas de sillas visibles bajo la mesa
  for (let i = 0; i < chairs; i++) {
    const chx = cx - w * 0.3 + i * (w * 0.6) / Math.max(1, chairs - 1);
    out += `<rect x="${f(chx - w * 0.075)}" y="${f(topY + w * 0.1)}" width="${f(w * 0.15)}" height="${f(w * 0.022)}" fill="${darken(P.wood, 0.28)}" opacity="0.9"/>`;
    out += `<rect x="${f(chx - w * 0.07)}" y="${f(topY + w * 0.1)}" width="${f(w * 0.014)}" height="${f(w * 0.2)}" fill="${darken(P.wood, 0.3)}"/><rect x="${f(chx + w * 0.056)}" y="${f(topY + w * 0.1)}" width="${f(w * 0.014)}" height="${f(w * 0.2)}" fill="${darken(P.wood, 0.3)}"/>`;
  }
  // mantel y mesa
  out += `<rect x="${f(cx - w / 2)}" y="${f(topY)}" width="${f(w)}" height="${f(w * 0.035)}" rx="6" fill="${woodG}" filter="url(#${s.shadow(10, 0.7)})"/>`;
  out += `<rect x="${f(cx - w * 0.46)}" y="${f(topY + w * 0.03)}" width="${f(w * 0.03)}" height="${f(w * 0.3)}" fill="${darken(P.wood, 0.25)}"/><rect x="${f(cx + w * 0.43)}" y="${f(topY + w * 0.03)}" width="${f(w * 0.03)}" height="${f(w * 0.3)}" fill="${darken(P.wood, 0.25)}"/>`;
  out += `<rect x="${f(cx - w * 0.2)}" y="${f(topY - 2)}" width="${f(w * 0.4)}" height="${f(w * 0.055)}" fill="${P.sageLight}" opacity="0.95"/>`;
  // florero y panera
  out += `<path d="M${f(cx - 16)},${f(topY)} Q${f(cx - 24)},${f(topY - 40)} ${f(cx - 8)},${f(topY - 62)} L${f(cx + 8)},${f(topY - 62)} Q${f(cx + 24)},${f(topY - 40)} ${f(cx + 16)},${f(topY)}Z" fill="${s.linear([[0, '#F4F0E8'], [1, '#CFC6B5']], { x1: 0, y1: 0, x2: 1, y2: 0 })}"/>`;
  const { stems, leaves } = foliage(s, { x: cx, y: topY - 60, angle: -1.57, branches: 5, spread: 1.4, length: 120, leafLen: 26, leafWid: 7, density: 8, droop: 0.2 });
  out += `<g fill="none" stroke="#5E7F4C" stroke-width="2">${stems}</g><g fill="#6E8F57">${leaves}</g>`;
  for (let i = 0; i < 6; i++) out += `<circle cx="${f(cx + s.r(-50, 50))}" cy="${f(topY - s.r(110, 175))}" r="${f(s.r(6, 10))}" fill="${s.pick(['#F3E9DA', '#E8C36A', '#FFFFFF'])}"/>`;
  // platos de canto
  for (let i = 0; i < chairs; i++) {
    const px = cx - w * 0.3 + i * (w * 0.6) / Math.max(1, chairs - 1);
    if (Math.abs(px - cx) < 40) continue;
    out += `<ellipse cx="${f(px)}" cy="${f(topY - 3)}" rx="${f(w * 0.07)}" ry="5" fill="#FBF8F1" filter="url(#${s.shadow(3, 0.5)})"/>`;
  }
  return out;
}

function corridor(s) {
  const { w, h } = s;
  const vp = [w * 0.56, h * 0.46];
  const bw = w * 0.16;
  const bh = h * 0.3;
  const back = [vp[0] - bw / 2, vp[1] - bh / 2, vp[0] + bw / 2, vp[1] + bh / 2];
  const wallL = s.linear([[0, '#E9E0D1'], [1, '#D8CCB8']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const wallR = s.linear([[0, '#E3D8C6'], [1, '#F1EADF']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const floorG = s.linear([[0, '#C9AE8A'], [1, '#B08D66']]);
  const ceil = s.linear([[0, '#F6F2EA'], [1, '#EDE6DA']]);
  let out = `<rect width="${w}" height="${h}" fill="#E8DFD0"/>`;
  out += `<polygon points="0,0 ${f(back[0])},${f(back[1])} ${f(back[0])},${f(back[3])} 0,${h}" fill="${wallL}"/>`;
  out += `<polygon points="${w},0 ${f(back[2])},${f(back[1])} ${f(back[2])},${f(back[3])} ${w},${h}" fill="${wallR}"/>`;
  out += `<polygon points="0,0 ${w},0 ${f(back[2])},${f(back[1])} ${f(back[0])},${f(back[1])}" fill="${ceil}"/>`;
  out += `<polygon points="0,${h} ${w},${h} ${f(back[2])},${f(back[3])} ${f(back[0])},${f(back[3])}" fill="${floorG}"/>`;
  // puerta/ventana luminosa al fondo
  out += `<rect x="${f(back[0])}" y="${f(back[1])}" width="${f(bw)}" height="${f(bh)}" fill="#F3ECE0"/>`;
  out += `<rect x="${f(back[0] + bw * 0.22)}" y="${f(back[1] + bh * 0.12)}" width="${f(bw * 0.56)}" height="${f(bh * 0.88)}" fill="${s.linear([[0, '#FFFBF1'], [1, '#F7E7C4']])}" filter="url(#${s.blur(3)})"/>`;
  out += `<rect x="${f(back[0] + bw * 0.22)}" y="${f(back[1] + bh * 0.12)}" width="${f(bw * 0.56)}" height="${f(bh * 0.88)}" fill="none" stroke="${P.woodLight}" stroke-width="3"/>`;
  // zócalos
  const lerp = (a, b, t) => a + (b - a) * t;
  const zl = (t) => [lerp(0, back[0], t), lerp(h, back[3], t)];
  out += `<polygon points="0,${f(h * 0.93)} ${f(back[0])},${f(back[3] - bh * 0.04)} ${f(back[0])},${f(back[3])} 0,${h}" fill="#F7F2EA" opacity="0.8"/>`;
  out += `<polygon points="${w},${f(h * 0.93)} ${f(back[2])},${f(back[3] - bh * 0.04)} ${f(back[2])},${f(back[3])} ${w},${h}" fill="#F7F2EA" opacity="0.8"/>`;
  // ventanas en la pared derecha (luz)
  for (let i = 0; i < 3; i++) {
    const t0 = 0.08 + i * 0.28;
    const t1 = t0 + 0.14;
    const xr0 = lerp(w, back[2], t0);
    const xr1 = lerp(w, back[2], t1);
    const top0 = lerp(h * 0.12, back[1] + bh * 0.1, t0);
    const top1 = lerp(h * 0.12, back[1] + bh * 0.1, t1);
    const bot0 = lerp(h * 0.62, back[1] + bh * 0.62, t0);
    const bot1 = lerp(h * 0.62, back[1] + bh * 0.62, t1);
    out += `<polygon points="${f(xr0)},${f(top0)} ${f(xr1)},${f(top1)} ${f(xr1)},${f(bot1)} ${f(xr0)},${f(bot0)}" fill="#FFF8E8" opacity="0.95"/>`;
    // charco de luz en el piso
    const fx0 = lerp(w * 0.2, back[0] + bw * 0.4, t0);
    const fx1 = lerp(w * 0.2, back[0] + bw * 0.4, t1);
    const fy0 = lerp(h, back[3], t0);
    const fy1 = lerp(h, back[3], t1);
    out += `<polygon points="${f(xr0 * 0.9)},${f(fy0)} ${f(xr1 * 0.93)},${f(fy1)} ${f(fx1)},${f(fy1)} ${f(fx0)},${f(fy0)}" fill="#FFF3D6" opacity="0.45" filter="url(#${s.blur(10)})"/>`;
  }
  // pasamanos en la pared izquierda
  const hy0 = h * 0.62;
  const hy1 = back[1] + bh * 0.58;
  const rail = s.linear([[0, P.woodLight], [1, P.woodDark]]);
  out += `<polygon points="0,${f(hy0 - 16)} ${f(back[0])},${f(hy1 - 3)} ${f(back[0])},${f(hy1 + 2)} 0,${f(hy0 + 14)}" fill="${rail}" filter="url(#${s.shadow(8, 0.7)})"/>`;
  for (let i = 0; i < 4; i++) {
    const t = 0.1 + i * 0.25;
    const bx = lerp(0, back[0], t);
    const by = lerp(hy0, hy1, t);
    out += `<rect x="${f(bx)}" y="${f(by)}" width="${f(10 * (1 - t))}" height="${f(30 * (1 - t))}" fill="#9E9990"/>`;
  }
  // puertas en la pared izquierda
  for (let i = 0; i < 2; i++) {
    const t0 = 0.25 + i * 0.35;
    const t1 = t0 + 0.12;
    const x0 = lerp(0, back[0], t0);
    const x1 = lerp(0, back[0], t1);
    const top0 = lerp(h * 0.18, back[1] + bh * 0.15, t0);
    const top1 = lerp(h * 0.18, back[1] + bh * 0.15, t1);
    const b0 = lerp(h, back[3], t0);
    const b1 = lerp(h, back[3], t1);
    out += `<polygon points="${f(x0)},${f(top0)} ${f(x1)},${f(top1)} ${f(x1)},${f(b1)} ${f(x0)},${f(b0)}" fill="${P.woodLight}" opacity="0.9"/>`;
  }
  out += `<rect width="${w}" height="${h}" fill="${s.radial([[0, '#fff', 0], [1, '#3a2c1f', 0.18]], { cx: 0.56, cy: 0.46, r: 0.7 })}"/>`;
  void zl;
  return out;
}


function facade(s, { sepia = false } = {}) {
  const { w, h } = s;
  let out = wall(s, { top: '#F1E9DC', bottom: '#DDCDB5' });
  // sombra de alero
  out += `<rect width="${w}" height="${f(h * 0.12)}" fill="${s.linear([[0, P.shadow, 0.35], [1, P.shadow, 0]])}"/>`;
  // sombras de follaje sobre la pared
  const fol = foliage(s, { x: w * 1.02, y: h * 0.05, angle: 2.6, branches: 6, spread: 1.3, length: w * 0.5, leafLen: 70, leafWid: 18, density: 12 });
  out += `<g opacity="0.2" fill="${P.shadow}" filter="url(#${s.blur(5)})">${fol.leaves}</g><g opacity="0.2" fill="none" stroke="${P.shadow}" stroke-width="5" filter="url(#${s.blur(5)})">${fol.stems}</g>`;
  // vereda
  const sidewalkY = h * 0.86;
  out += `<rect x="0" y="${f(sidewalkY)}" width="${w}" height="${f(h - sidewalkY)}" fill="${s.linear([[0, '#CFC5B5'], [1, '#B9AE9C']])}"/>`;
  for (let i = 0; i < 8; i++) out += `<rect x="${f(i * w / 7)}" y="${f(sidewalkY)}" width="2" height="${f(h - sidewalkY)}" fill="#A99D8A" opacity="0.5"/>`;
  // puerta con arco
  const dw = w * 0.2;
  const dx = w * 0.5 - dw / 2;
  const dTop = h * 0.28;
  const dBot = sidewalkY - h * 0.05;
  const frameC = '#D9CDB9';
  out += `<path d="M${f(dx - 26)},${f(dBot)} L${f(dx - 26)},${f(dTop + dw / 2)} A${f(dw / 2 + 26)},${f(dw / 2 + 26)} 0 0 1 ${f(dx + dw + 26)},${f(dTop + dw / 2)} L${f(dx + dw + 26)},${f(dBot)}Z" fill="${frameC}" filter="url(#${s.shadow(4, 0.5)})"/>`;
  const doorG = s.linear([[0, lighten(P.green, 0.12)], [1, darken(P.green, 0.18)]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  out += `<path d="M${f(dx)},${f(dBot)} L${f(dx)},${f(dTop + dw / 2)} A${f(dw / 2)},${f(dw / 2)} 0 0 1 ${f(dx + dw)},${f(dTop + dw / 2)} L${f(dx + dw)},${f(dBot)}Z" fill="${doorG}"/>`;
  out += `<path d="M${f(dx + dw * 0.14)},${f(dTop + dw / 2)} A${f(dw * 0.36)},${f(dw * 0.36)} 0 0 1 ${f(dx + dw * 0.86)},${f(dTop + dw / 2)} L${f(dx + dw * 0.86)},${f(dTop + dw * 0.9)} L${f(dx + dw * 0.14)},${f(dTop + dw * 0.9)}Z" fill="${s.linear([[0, '#F7EFD9'], [1, '#D8CCAF']])}" opacity="0.9"/>`;
  out += `<rect x="${f(dx + dw * 0.49)}" y="${f(dTop + dw * 0.14)}" width="3" height="${f(dw * 0.76)}" fill="${P.green}"/>`;
  for (let i = 0; i < 2; i++) out += `<rect x="${f(dx + dw * 0.14)}" y="${f(dTop + dw * (1.02 + i * 0.62))}" width="${f(dw * 0.72)}" height="${f(dw * 0.5)}" rx="3" fill="none" stroke="${lighten(P.green, 0.18)}" stroke-width="3"/>`;
  out += `<circle cx="${f(dx + dw * 0.82)}" cy="${f(dTop + dw * 1.55)}" r="6" fill="${P.gold}"/>`;
  // rampa con baranda
  const rampY = dBot;
  out += `<polygon points="${f(dx - 30)},${f(rampY)} ${f(dx + dw + 30)},${f(rampY)} ${f(dx + dw + 30)},${f(sidewalkY)} ${f(dx - 30)},${f(sidewalkY)}" fill="#E6DDCF"/>`;
  out += `<polygon points="${f(dx + dw + 30)},${f(rampY)} ${f(w * 0.98)},${f(sidewalkY)} ${f(dx + dw + 30)},${f(sidewalkY)}" fill="#DCD2C2"/>`;
  out += `<line x1="${f(dx + dw + 34)}" y1="${f(rampY - 70)}" x2="${f(w * 0.97)}" y2="${f(sidewalkY - 70)}" stroke="#8C877E" stroke-width="7" stroke-linecap="round"/>`;
  for (const t of [0, 0.5, 1]) {
    const px = dx + dw + 34 + (w * 0.97 - (dx + dw + 34)) * t;
    const py = rampY + (sidewalkY - rampY) * t;
    out += `<rect x="${f(px - 3)}" y="${f(py - 70)}" width="6" height="70" fill="#8C877E"/>`;
  }
  // macetas con olivos
  for (const px of [dx - w * 0.14, dx + dw + w * 0.08]) {
    out += potFront(s, px, sidewalkY - 4, 110, { color: P.clay });
    const tr = foliage(s, { x: px, y: sidewalkY - 110, angle: -1.57, branches: 7, spread: 1.8, length: 190, leafLen: 26, leafWid: 7, density: 14, droop: 0.2 });
    out += `<g fill="none" stroke="#6b5a45" stroke-width="3">${tr.stems}</g><g fill="#7F9270">${tr.leaves}</g>`;
  }
  // aplique
  out += `<rect x="${f(dx + dw + 60)}" y="${f(dTop + 40)}" width="22" height="48" rx="6" fill="#3a332b"/><rect x="${f(dx + dw + 64)}" y="${f(dTop + 46)}" width="14" height="30" rx="4" fill="#FCE7B8"/>`;
  out += `<rect x="${f(dx - 110)}" y="${f(dTop + 60)}" width="70" height="44" rx="4" fill="#EDE5D8" stroke="#BCAF99" stroke-width="2"/>`;
  if (sepia) {
    out += `<rect width="${w}" height="${h}" fill="#8a6b43" style="mix-blend-mode:color" opacity="0.55"/>`;
  }
  return out;
}

function gardenBokeh(s, { bench = true } = {}) {
  const { w, h } = s;
  let out = `<rect width="${w}" height="${h}" fill="${s.linear([[0, '#DCE5D6'], [0.45, '#9FB392'], [1, '#5F7A55']])}"/>`;
  const big = s.blur(38);
  for (let i = 0; i < 26; i++) {
    const c = s.pick(['#7F9A6C', '#5E7A52', '#A9BE92', '#4D6A47', '#C3D1AE']);
    out += `<circle cx="${f(s.r(-50, w + 50))}" cy="${f(s.r(-50, h * 0.8))}" r="${f(s.r(60, 180))}" fill="${c}" opacity="${f(s.r(0.35, 0.8))}" filter="url(#${big})"/>`;
  }
  const mid = s.blur(10);
  for (let i = 0; i < 30; i++) {
    out += `<circle cx="${f(s.r(0, w))}" cy="${f(s.r(0, h * 0.55))}" r="${f(s.r(12, 38))}" fill="#FFF6D9" opacity="${f(s.r(0.18, 0.55))}" filter="url(#${mid})"/>`;
  }
  out += `<rect width="${w}" height="${h}" fill="${s.radial([[0, '#FFF3D0', 0.6], [1, '#FFF3D0', 0]], { cx: 0.82, cy: 0.12, r: 0.6 })}"/>`;
  // césped
  out += `<rect x="0" y="${f(h * 0.72)}" width="${w}" height="${f(h * 0.28)}" fill="${s.linear([[0, '#7E9A5E'], [1, '#56713F']])}" filter="url(#${s.blur(4)})"/>`;
  if (bench) {
    const bx = w * 0.3;
    const by = h * 0.74;
    const bw = w * 0.42;
    const g = s.linear([[0, P.woodLight], [1, P.woodDark]]);
    let b = `<ellipse cx="${f(bx + bw / 2 + 20)}" cy="${f(by + 6)}" rx="${f(bw * 0.55)}" ry="14" fill="#2f3d24" opacity="0.4" filter="url(#${s.blur(10)})"/>`;
    for (let i = 0; i < 3; i++) b += `<rect x="${f(bx)}" y="${f(by - 150 + i * 30)}" width="${f(bw)}" height="20" rx="4" fill="${g}"/>`;
    for (let i = 0; i < 2; i++) b += `<rect x="${f(bx - 10)}" y="${f(by - 62 + i * 22)}" width="${f(bw + 20)}" height="16" rx="4" fill="${g}"/>`;
    for (const x of [bx + 20, bx + bw - 34]) b += `<rect x="${f(x)}" y="${f(by - 160)}" width="14" height="160" fill="#3a332b"/>`;
    out += `<g filter="url(#${s.blur(1.6)})">${b}</g>`;
  }
  // briznas en primer plano
  let blades = '';
  for (let i = 0; i < 80; i++) {
    const x = s.r(0, w);
    const len = s.r(60, 170);
    const lean = s.r(-30, 30);
    blades += `<path d="M${f(x)},${h} Q${f(x + lean * 0.3)},${f(h - len * 0.5)} ${f(x + lean)},${f(h - len)}" stroke="${s.pick(['#3F5A34', '#4D6A3E', '#5E7F4C'])}" stroke-width="${f(s.r(3, 7))}" fill="none" stroke-linecap="round"/>`;
  }
  out += `<g filter="url(#${s.blur(3)})">${blades}</g>`;
  return out;
}

function gardenTop(s) {
  const { w, h } = s;
  let out = `<rect width="${w}" height="${h}" fill="#6E8B55"/>`;
  const grass = s.noise({ fx: 0.6, fy: 0.25, octaves: 3, color: '#2E4424', alpha: 0.35, seed: 121 });
  const grass2 = s.noise({ fx: 0.02, octaves: 2, color: '#A7C07F', alpha: 0.25, seed: 123 });
  out += `<rect width="${w}" height="${h}" filter="url(#${grass})"/><rect width="${w}" height="${h}" filter="url(#${grass2})"/>`;
  // camino de lajas
  for (let i = 0; i < 6; i++) {
    const cx = w * 0.15 + i * w * 0.15;
    const cy = h * 0.72 - i * h * 0.1 + s.r(-20, 20);
    out += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(s.r(70, 95))}" ry="${f(s.r(48, 62))}" fill="${s.radial([[0, '#E8E1D4'], [1, '#BDB29F']], { cx: 0.4, cy: 0.35 })}" transform="rotate(${f(s.r(-20, 20))} ${f(cx)} ${f(cy)})" filter="url(#${s.shadow(4, 0.6)})"/>`;
  }
  // canteros con flores
  const beds = [[0.2, 0.25], [0.78, 0.2], [0.85, 0.75], [0.1, 0.85], [0.5, 0.12]];
  for (const [bx, by] of beds) {
    for (let k = 0; k < 9; k++) {
      const x = w * bx + s.r(-110, 110);
      const y = h * by + s.r(-80, 80);
      out += `<path d="${leafD(s.r(40, 70), s.r(10, 18))}" fill="${s.pick(['#4F6F45', '#5E8050', '#3F5E38'])}" transform="translate(${f(x)} ${f(y)}) rotate(${f(s.r(0, 360))})" filter="url(#${s.shadow(3, 0.6)})"/>`;
    }
    for (let k = 0; k < 7; k++) {
      out += flower(s, w * bx + s.r(-90, 90), h * by + s.r(-60, 60), s.r(14, 24), { petal: s.pick(['#F4EDE1', '#E9C9D2', '#F2D58A', '#D9A0B0']), center: s.pick(['#E0B04A', '#C98B3A']) });
    }
  }
  return out;
}

function patioTop(s) {
  const { w, h } = s;
  let out = `<rect width="${w}" height="${h}" fill="#C98A64"/>`;
  const t = 170;
  for (let i = 0; i * t < w + t; i++) {
    for (let j = 0; j * t < h + t; j++) {
      const c = mix('#C98A64', s.pick(['#B97A55', '#D29A74', '#C4835C', '#BF7E57']), 0.8);
      out += `<rect x="${f(i * t + 3)}" y="${f(j * t + 3)}" width="${t - 6}" height="${t - 6}" rx="3" fill="${c}"/>`;
    }
  }
  const tex = s.noise({ fx: 0.08, octaves: 3, color: '#5a3520', alpha: 0.18, seed: 131 });
  out += `<rect width="${w}" height="${h}" filter="url(#${tex})"/>`;
  out += windowLight(s, { x: -w * 0.1, y: h * 0.05, paneW: w * 0.5, paneH: h * 0.9, cols: 1, rows: 1, shear: [0.05, -0.2], soft: 30, opacity: 0.25, color: '#FFF1D2', leaves: { x: w * 0.3, y: -60, angle: 1.3, branches: 6, spread: 1.4, length: 700, leafLen: 80, leafWid: 20, density: 12, blur: 4 }, leafOpacity: 0.4 });
  out += plantTop(s, w * 0.18, h * 0.22, 120, { kind: 'fern' });
  out += plantTop(s, w * 0.86, h * 0.3, 95, { kind: 'rosette', pot: '#E9E1D3' });
  out += plantTop(s, w * 0.12, h * 0.78, 80, { kind: 'round', pot: P.sageDark });
  // mesa redonda con tazas
  out += `<circle cx="${f(w * 0.58)}" cy="${f(h * 0.62)}" r="190" fill="${s.radial([[0, lighten(P.wood, 0.2)], [1, darken(P.wood, 0.1)]], { cx: 0.4, cy: 0.35 })}" filter="url(#${s.shadow(26)})"/>`;
  out += cup(s, w * 0.53, h * 0.57, 36, { handle: 30 });
  out += cup(s, w * 0.65, h * 0.68, 36, { handle: 200 });
  out += napkin(s, w * 0.5, h * 0.68, 90, 70, { color: P.sage, angle: -12 });
  return out;
}


function mapIllustration(s) {
  const { w, h } = s;
  let out = `<rect width="${w}" height="${h}" fill="#EFE8DC"/>`;
  out += `<g transform="rotate(-14 ${w / 2} ${h / 2})">`;
  // manzanas
  const bs = 150;
  for (let i = -4; i < w / bs + 4; i++) {
    for (let j = -4; j < h / bs + 4; j++) {
      const c = (i * 3 + j * 5) % 11 === 0 ? '#CFDCC6' : s.pick(['#E4DACA', '#E7DECF', '#E2D7C5']);
      out += `<rect x="${f(i * bs + 14)}" y="${f(j * bs + 14)}" width="${bs - 28}" height="${bs - 28}" rx="6" fill="${c}"/>`;
    }
  }
  // avenidas
  out += `<rect x="-400" y="${f(h * 0.5 - 22)}" width="${w + 800}" height="44" fill="#FFFFFF"/><rect x="-400" y="${f(h * 0.5 - 2)}" width="${w + 800}" height="4" fill="#E9D9B8"/>`;
  out += `<rect x="${f(w * 0.36 - 20)}" y="-400" width="40" height="${h + 800}" fill="#FFFFFF"/>`;
  out += `</g>`;
  // plaza
  out += `<ellipse cx="${f(w * 0.2)}" cy="${f(h * 0.25)}" rx="${f(w * 0.12)}" ry="${f(h * 0.12)}" fill="#C4D3B8" opacity="0.9"/>`;
  for (let i = 0; i < 14; i++) out += `<circle cx="${f(w * 0.2 + s.r(-w * 0.09, w * 0.09))}" cy="${f(h * 0.25 + s.r(-h * 0.08, h * 0.08))}" r="${f(s.r(8, 16))}" fill="#A9BE9A"/>`;
  // pin
  const px = w * 0.52;
  const py = h * 0.47;
  out += `<ellipse cx="${f(px + 6)}" cy="${f(py + 8)}" rx="26" ry="9" fill="${P.shadow}" opacity="0.25" filter="url(#${s.blur(5)})"/>`;
  out += `<circle cx="${f(px)}" cy="${f(py)}" r="90" fill="${P.green}" opacity="0.08"/><circle cx="${f(px)}" cy="${f(py)}" r="54" fill="${P.green}" opacity="0.1"/>`;
  out += `<path d="M${f(px)},${f(py)} C${f(px - 12)},${f(py - 24)} ${f(px - 38)},${f(py - 44)} ${f(px - 38)},${f(py - 72)} A38,38 0 1 1 ${f(px + 38)},${f(py - 72)} C${f(px + 38)},${f(py - 44)} ${f(px + 12)},${f(py - 24)} ${f(px)},${f(py)}Z" fill="${P.green}" filter="url(#${s.shadow(8, 0.7)})"/>`;
  out += `<circle cx="${f(px)}" cy="${f(py - 72)}" r="14" fill="${P.cream}"/>`;
  return out;
}

/* ======================================================================
   Composiciones
   ====================================================================== */

const T = {
  manana: { top: '#EEE8DE', bottom: '#D6CCBD', light: '#FFFAF0', shadow: '#4E4A44' },
  mediodia: { top: '#F2E8D8', bottom: '#DBC8AC', light: '#FFF5DE', shadow: '#5A4633' },
  tarde: { top: '#EED9BE', bottom: '#C9A884', light: '#FFE2B0', shadow: '#4E3421' },
};

const images = {
  /* ---------------- INICIO ---------------- */
  'inicio/hero': [1200, 1500, 11, (s) => {
    const t = T.manana;
    s.add(wall(s, { top: t.top, bottom: t.bottom }));
    s.add(windowLight(s, { x: 250, y: 330, paneW: 240, paneH: 330, cols: 2, rows: 2, gap: 24, shear: [0.1, -0.32], soft: 13, color: t.light, opacity: 0.94,
      leaves: { x: 1180, y: 560, angle: 2.92, branches: 8, spread: 1.25, length: 1000, leafLen: 96, leafWid: 24, density: 16, blur: 4 }, leafColor: t.shadow, leafOpacity: 0.36 }));
    s.add(floor(s, 1250, { color: '#C4A27D' }));
    s.add(monstera(s, 1020, 1080, 300, { angle: -60 }));
    s.add(potFront(s, 1020, 1256, 170, { color: '#E9E2D6' }));
    s.add(armchair(s, 470, 1258, 560, { color: '#AEBBA6' }));
    s.add(`<rect x="360" y="890" width="190" height="150" rx="40" fill="${s.linear([[0, P.clayLight], [1, P.clay]], { x1: 0, y1: 0, x2: 1, y2: 1 })}" transform="rotate(-8 455 965)" filter="url(#${s.shadow(8, 0.7)})"/>`);
    s.add(sideTable(s, 860, 1258, 150));
    s.add(bookStack(s, 800, 1090, 120));
    s.finish({ grain: 0.1 });
  }],
  'inicio/nuestra-casa': [1200, 1500, 12, (s) => {
    s.add(linen(s, '#EDE4D5'));
    s.add(napkin(s, 150, 980, 380, 300, { color: P.sageLight, angle: -8 }));
    s.add(book(s, 820, 380, 520, { angle: 12, cover: P.green }));
    s.add(glasses(s, 870, 470, 260, { angle: -18 }));
    s.add(mate(s, 400, 560, 150, { angle: -30 }));
    s.add(termo(s, 120, 250, 520, { angle: 24, color: P.sageDeep }));
    s.add(plate(s, 820, 1080, 190));
    for (const [x, y] of [[760, 1030], [870, 1010], [800, 1130], [900, 1120], [840, 1070]]) s.add(cookie(s, x, y, 42));
    s.add(windowLight(s, { x: 300, y: -200, paneW: 420, paneH: 700, cols: 2, rows: 1, gap: 40, shear: [0.05, -0.55], soft: 26, color: '#FFF7E6', opacity: 0.32,
      leaves: { x: 1300, y: 200, angle: 2.8, branches: 5, spread: 1.4, length: 900, leafLen: 100, leafWid: 24, density: 12, blur: 6 }, leafOpacity: 0.3 }));
    s.finish();
  }],
  'inicio/tranquilidad': [1600, 1200, 13, (s) => {
    const t = T.tarde;
    s.add(wall(s, { top: t.top, bottom: t.bottom }));
    s.add(windowLight(s, { x: 700, y: 60, paneW: 520, paneH: 460, cols: 1, rows: 1, slats: 12, shear: [0.18, -0.45], soft: 8, color: t.light, opacity: 0.85 }));
    s.add(floor(s, 1020, { color: '#B48E68' }));
    s.add(nightstand(s, 190, 1020, 210));
    s.add(lamp(s, 190, 840, 200, { shade: '#F4EDE2' }));
    s.add(nightstand(s, 1410, 1020, 210));
    s.add(bookStack(s, 1350, 840, 110));
    s.add(bedFront(s, 800, 1020, 900, { head: '#B9B09C', throwColor: '#C98F6A' }));
    s.finish({ grain: 0.1, vignette: 0.2 });
  }],
  'inicio/visita': [1600, 1200, 14, (s) => {
    s.add(facade(s));
    s.finish({ grain: 0.09 });
  }],

  /* ---------------- DÍA A DÍA ---------------- */
  'dia/manana': [1200, 1200, 21, (s) => {
    s.add(linen(s, '#F1ECE3'));
    s.add(napkin(s, 110, 700, 330, 260, { color: '#D9E0D5', angle: 6 }));
    s.add(plate(s, 700, 690, 250));
    s.add(medialuna(s, 640, 690, 120, { angle: -20 }));
    s.add(medialuna(s, 780, 760, 110, { angle: 25 }));
    s.add(cup(s, 360, 380, 105, { handle: 20 }));
    s.add(glass(s, 830, 300, 85, { tint: '#F6C26B' }));
    s.add(knife(s, 980, 640, 300, { angle: 8 }));
    s.add(windowLight(s, { x: 150, y: -150, paneW: 380, paneH: 620, cols: 2, rows: 1, gap: 34, shear: [0.05, -0.5], soft: 22, color: '#FFFFFF', opacity: 0.28,
      leaves: { x: 1250, y: 100, angle: 2.6, branches: 4, spread: 1.2, length: 700, leafLen: 80, leafWid: 20, density: 11, blur: 5 }, leafOpacity: 0.22 }));
    s.finish({ warm: false, vignette: 0.12 });
  }],
  'dia/mediodia': [1200, 1200, 22, (s) => {
    s.add(woodSurface(s, '#C9A479', { planks: 5 }));
    s.add(napkin(s, 170, 330, 170, 560, { color: P.sageLight, angle: 0 }));
    s.add(fork(s, 250, 620, 380, { angle: 0 }));
    s.add(lunchPlate(s, 640, 610, 300));
    s.add(knife(s, 1010, 620, 380, { angle: 0 }));
    s.add(glass(s, 980, 230, 90));
    s.finish({ vignette: 0.14 });
  }],
  'dia/tarde': [1200, 1200, 23, (s) => {
    s.add(woodSurface(s, '#BE9670', { planks: 4, vertical: true }));
    s.add(mate(s, 380, 390, 140, { angle: -35 }));
    s.add(termo(s, 700, 160, 520, { angle: 118, color: P.green }));
    s.add(card(s, 560, 800, 170, { angle: -18, face: true, pips: 3 }));
    s.add(card(s, 700, 780, 170, { angle: 4, face: true, pips: 5 }));
    s.add(card(s, 840, 820, 170, { angle: 22, face: false }));
    s.add(plate(s, 250, 880, 170));
    for (const [x, y] of [[210, 850], [290, 860], [240, 930]]) s.add(cookie(s, x, y, 40, { color: '#E0B97F' }));
    s.add(windowLight(s, { x: 250, y: -100, paneW: 360, paneH: 520, cols: 2, rows: 1, gap: 30, shear: [0.1, -0.6], soft: 18, color: '#FFE1AE', opacity: 0.3,
      leaves: { x: 1200, y: 300, angle: 2.9, branches: 5, spread: 1.2, length: 800, leafLen: 90, leafWid: 22, density: 12, blur: 4 }, leafOpacity: 0.28 }));
    s.finish({ vignette: 0.18 });
  }],
  'dia/noche': [1200, 1200, 24, (s) => {
    s.add(`<rect width="${s.w}" height="${s.h}" fill="${s.linear([[0, '#2A4246'], [1, '#162729']], { x1: 0, y1: 0, x2: 1, y2: 1 })}"/>`);
    s.add(`<rect width="${s.w}" height="${s.h}" filter="url(#${s.noise({ fx: 0.012, octaves: 3, color: '#000000', alpha: 0.12, seed: 151 })})"/>`);
    s.add(floor(s, 1010, { color: '#5E4A38' }));
    s.add(lamp(s, 470, 760, 260, { on: true }));
    s.add(nightstand(s, 470, 1010, 300, { color: '#7A5E45' }));
    s.add(bookStack(s, 560, 760, 120));
    s.add(bedFront(s, 1150, 1010, 760, { dim: 0.55, head: '#8E9A89' }));
    s.add(`<circle cx="470" cy="560" r="760" fill="${s.radial([[0, '#F7C97F', 0.32], [0.5, '#E9A95A', 0.1], [1, '#E9A95A', 0]])}" style="mix-blend-mode:screen"/>`);
    s.finish({ grain: 0.12, vignette: 0.28, warm: false });
  }],

  /* ---------------- INSTALACIONES ---------------- */
  'instalaciones/habitacion-1': [1600, 1200, 31, (s) => {
    const t = T.mediodia;
    s.add(wall(s, { top: t.top, bottom: t.bottom }));
    s.add(windowLight(s, { x: 820, y: 40, paneW: 230, paneH: 330, cols: 2, rows: 2, gap: 22, shear: [0.12, -0.38], soft: 12, color: t.light, opacity: 0.88,
      leaves: { x: 1600, y: 60, angle: 2.4, branches: 4, spread: 1.1, length: 640, leafLen: 80, leafWid: 20, density: 12, blur: 3 }, leafColor: t.shadow, leafOpacity: 0.3 }));
    s.add(frame(s, 670, 190, 260, 200));
    s.add(floor(s, 1040, { color: '#C29F78' }));
    s.add(nightstand(s, 200, 1040, 210));
    s.add(lamp(s, 200, 860, 200));
    s.add(nightstand(s, 1400, 1040, 210));
    s.add(potFront(s, 1400, 860, 70, { color: '#EDE6DA' }));
    s.add(bedFront(s, 800, 1040, 900));
    s.finish({ grain: 0.09 });
  }],
  'instalaciones/habitacion-2': [1200, 1500, 32, (s) => {
    const t = T.manana;
    s.add(wall(s, { top: '#E9E4DA', bottom: '#D2C8B8' }));
    s.add(windowLight(s, { x: 120, y: 120, paneW: 300, paneH: 420, cols: 2, rows: 1, gap: 26, shear: [0.08, -0.3], soft: 14, color: t.light, opacity: 0.8,
      leaves: { x: -100, y: 200, angle: 0.3, branches: 5, spread: 1.2, length: 700, leafLen: 80, leafWid: 20, density: 12, blur: 4 }, leafOpacity: 0.28 }));
    s.add(floor(s, 1240, { color: '#BD9B74' }));
    s.add(nightstand(s, 560, 1240, 420, { color: P.woodLight }));
    s.add(lamp(s, 470, 880, 330, { shade: '#F6F0E6', base: P.sageDark }));
    s.add(bookStack(s, 620, 880, 170));
    s.add(potFront(s, 760, 880, 80, { color: '#EDE6DA' }));
    const fl = foliage(s, { x: 760, y: 800, angle: -1.57, branches: 5, spread: 1.6, length: 160, leafLen: 34, leafWid: 10, density: 8 });
    s.add(`<g fill="none" stroke="#5E7F4C" stroke-width="3">${fl.stems}</g><g fill="#6E8F57">${fl.leaves}</g>`);
    s.finish({ grain: 0.1 });
  }],
  'instalaciones/comedor-1': [1600, 1200, 33, (s) => {
    s.add(linen(s, '#F2ECE1'));
    const seats = [[400, 330], [1200, 330], [400, 870], [1200, 870]];
    for (const [x, y] of seats) {
      s.add(plate(s, x, y, 170));
      s.add(fork(s, x - 230, y, 250));
      s.add(knife(s, x + 230, y, 250));
      s.add(glass(s, x + 210, y - 190, 52));
    }
    s.add(fruitBowl(s, 800, 600, 160));
    s.add(napkin(s, 560, 230, 110, 200, { color: P.sageLight }));
    s.add(napkin(s, 930, 770, 110, 200, { color: P.sageLight }));
    s.add(windowLight(s, { x: 300, y: -200, paneW: 460, paneH: 800, cols: 2, rows: 1, gap: 40, shear: [0.05, -0.45], soft: 26, color: '#FFF6E2', opacity: 0.3,
      leaves: { x: 1700, y: 300, angle: 2.9, branches: 5, spread: 1.3, length: 1000, leafLen: 110, leafWid: 26, density: 12, blur: 6 }, leafOpacity: 0.22 }));
    s.finish();
  }],
  'instalaciones/comedor-2': [1600, 1200, 34, (s) => {
    const t = T.mediodia;
    s.add(wall(s, { top: '#EFE7DA', bottom: '#D8C9B2' }));
    s.add(windowLight(s, { x: 120, y: 120, paneW: 200, paneH: 330, cols: 3, rows: 2, gap: 20, shear: [0.08, -0.25], soft: 14, color: t.light, opacity: 0.75 }));
    s.add(floor(s, 1060, { color: '#B99570' }));
    s.add(pendant(s, 560, 190, 170));
    s.add(pendant(s, 1040, 190, 170));
    s.add(diningTable(s, 800, 740, 1100, { chairs: 4 }));
    s.finish({ grain: 0.09 });
  }],
  'instalaciones/sala-1': [1600, 1200, 35, (s) => {
    const t = T.manana;
    s.add(wall(s, { top: '#ECE6DB', bottom: '#D3C8B6' }));
    s.add(windowLight(s, { x: 820, y: 60, paneW: 260, paneH: 360, cols: 2, rows: 1, gap: 26, shear: [0.12, -0.42], soft: 14, color: t.light, opacity: 0.85,
      leaves: { x: 1650, y: 100, angle: 2.5, branches: 5, spread: 1.2, length: 700, leafLen: 86, leafWid: 22, density: 12, blur: 4 }, leafOpacity: 0.3 }));
    s.add(frame(s, 420, 250, 300, 220));
    s.add(frame(s, 760, 300, 170, 170, { art: 'circle' }));
    s.add(floor(s, 960, { color: '#C4A27D' }));
    s.add(rug(s, 800, 1070, 1300, 180));
    s.add(monstera(s, 1420, 800, 240, { angle: -70 }));
    s.add(potFront(s, 1420, 966, 150, { color: P.clay }));
    s.add(sofa(s, 740, 960, 1000));
    s.add(coffeeTable(s, 760, 1110, 520));
    s.finish({ grain: 0.09 });
  }],
  'instalaciones/sala-2': [1600, 1200, 36, (s) => {
    s.add(wall(s, { top: '#E6E0D2', bottom: '#CBBFA8' }));
    // biblioteca
    const bx = 860;
    s.add(`<rect x="${bx}" y="120" width="560" height="900" fill="${P.woodLight}" filter="url(#${s.shadow(12, 0.7)})"/>`);
    for (let r = 0; r < 4; r++) {
      const y = 150 + r * 215;
      s.add(`<rect x="${bx + 24}" y="${y}" width="512" height="180" fill="${darken(P.woodLight, 0.18)}"/>`);
      let x = bx + 34;
      while (x < bx + 500) {
        const bw = s.r(22, 44);
        const bh = s.r(120, 170);
        s.add(`<rect x="${f(x)}" y="${f(y + 180 - bh)}" width="${f(bw)}" height="${f(bh)}" fill="${s.pick([P.green, P.clay, P.sand, P.sageDark, '#8E6A48', '#E9E0D0', '#6F7F8C'])}"/>`);
        x += bw + s.r(2, 6);
        if (s.rng() < 0.12) x += 40;
      }
    }
    s.add(floor(s, 1030, { color: '#B99570' }));
    s.add(lamp(s, 300, 700, 230, { on: false }));
    s.add(sideTable(s, 300, 1030, 170));
    s.add(armchair(s, 560, 1032, 520, { color: '#C99A78' }));
    s.add(windowLight(s, { x: 40, y: 80, paneW: 240, paneH: 400, cols: 2, rows: 1, gap: 26, shear: [0.1, -0.2], soft: 16, color: '#FFF4DC', opacity: 0.35 }));
    s.finish({ grain: 0.1 });
  }],
  'instalaciones/jardin-1': [1600, 1200, 37, (s) => {
    s.add(gardenBokeh(s));
    s.finish({ grain: 0.08, vignette: 0.14 });
  }],
  'instalaciones/jardin-2': [1600, 1200, 38, (s) => {
    s.add(gardenTop(s));
    s.finish({ grain: 0.08, vignette: 0.16 });
  }],
  'instalaciones/patio-1': [1600, 1200, 39, (s) => {
    s.add(patioTop(s));
    s.finish({ grain: 0.08 });
  }],
  'instalaciones/recreativo-1': [1600, 1200, 40, (s) => {
    s.add(woodSurface(s, '#C7A27A', { planks: 5 }));
    s.add(checkers(s, 520, 560, 560, { angle: -8 }));
    for (let i = 0; i < 5; i++) s.add(domino(s, 1100 + i * 70, 300 + (i % 2) * 40, 58, { angle: s.r(-30, 30), a: (i * 2) % 7, b: (i * 3 + 1) % 7 }));
    s.add(puzzlePiece(s, 1180, 760, 130, { color: P.sage, angle: 12 }));
    s.add(puzzlePiece(s, 1330, 850, 130, { color: P.clayLight, angle: -18, tabs: [-1, 1, 1, -1] }));
    s.add(puzzlePiece(s, 1120, 950, 130, { color: P.sand, angle: 30, tabs: [1, 1, -1, -1] }));
    s.add(cup(s, 1380, 560, 80, { handle: 210 }));
    s.finish();
  }],
  'instalaciones/descanso-1': [1600, 1200, 41, (s) => {
    const t = T.tarde;
    s.add(wall(s, { top: t.top, bottom: t.bottom }));
    s.add(windowLight(s, { x: 780, y: 40, paneW: 560, paneH: 520, cols: 1, rows: 1, slats: 14, shear: [0.14, -0.5], soft: 7, color: t.light, opacity: 0.85 }));
    s.add(floor(s, 1000, { color: '#B08A62' }));
    s.add(monstera(s, 180, 760, 260, { angle: -40 }));
    s.add(potFront(s, 180, 1006, 160, { color: '#EDE6DA' }));
    s.add(armchair(s, 820, 1004, 600, { color: '#CDBFA9' }));
    s.add(`<path d="M620,560 C700,520 800,540 870,600 L840,780 C770,740 670,730 600,760Z" fill="${P.sageDark}" opacity="0.95" filter="url(#${s.shadow(6, 0.6)})"/>`);
    s.add(sideTable(s, 1260, 1004, 170));
    s.finish({ grain: 0.1, vignette: 0.2 });
  }],
  'instalaciones/acceso-1': [1600, 1200, 42, (s) => {
    s.add(facade(s));
    s.finish({ grain: 0.09 });
  }],
  'instalaciones/acceso-2': [1600, 1200, 43, (s) => {
    s.add(corridor(s));
    s.finish({ grain: 0.09, vignette: 0.16 });
  }],
  'instalaciones/bano-1': [1600, 1200, 44, (s) => {
    s.add(accessibleBath(s));
    s.finish({ grain: 0.08, warm: false, vignette: 0.14 });
  }],

  /* ---------------- ACTIVIDADES ---------------- */
  'actividades/ejercicios': [1400, 1050, 51, (s) => {
    s.add(woodSurface(s, '#C9A881', { planks: 6, vertical: true }));
    s.add(`<rect x="160" y="140" width="560" height="780" rx="24" fill="${P.sageLight}" filter="url(#${s.shadow(4)})"/>`);
    s.add(ball(s, 980, 360, 120, { color: P.clay }));
    s.add(ball(s, 1160, 600, 80, { color: P.sage }));
    s.add(band(s, 'M860,760 C940,640 1080,900 1200,800 S1300,700 1340,900', { color: P.sageDeep, width: 26 }));
    s.add(towel(s, 250, 600, 360, 190, { color: P.sand, angle: -6 }));
    s.finish();
  }],
  'actividades/juegos-de-mesa': [1400, 1050, 52, (s) => {
    s.add(linen(s, '#E8E0D1'));
    s.add(checkers(s, 420, 520, 460, { angle: 8 }));
    [[900, 420, -20, 1, true], [1010, 400, -5, 4, true], [1120, 420, 12, 2, true], [1000, 720, 30, 0, false], [1150, 760, 50, 0, false]].forEach(([x, y, a, pips, face]) => s.add(card(s, x, y, 150, { angle: a, face, pips: pips || 1 })));
    s.finish();
  }],
  'actividades/lectura': [1400, 1050, 53, (s) => {
    s.add(linen(s, '#EFE7DA'));
    s.add(book(s, 620, 520, 700, { angle: -6, cover: P.clayDark }));
    s.add(glasses(s, 880, 700, 280, { angle: 20 }));
    s.add(cup(s, 1180, 280, 90, { handle: 200, liquid: '#B0703A', tea: true }));
    s.add(windowLight(s, { x: 200, y: -200, paneW: 380, paneH: 700, cols: 2, rows: 1, gap: 30, shear: [0.05, -0.5], soft: 20, color: '#FFF4DC', opacity: 0.3,
      leaves: { x: 1500, y: 100, angle: 2.7, branches: 4, spread: 1.3, length: 900, leafLen: 100, leafWid: 24, density: 11, blur: 5 }, leafOpacity: 0.25 }));
    s.finish();
  }],
  'actividades/musica': [1400, 1050, 54, (s) => {
    s.add(linen(s, '#E9E1D2'));
    s.add(sheetMusic(s, 420, 520, 420, { angle: -10 }));
    s.add(sheetMusic(s, 560, 560, 420, { angle: 6 }));
    s.add(vinyl(s, 1050, 470, 290));
    s.add(pencil(s, 250, 900, 300, { angle: -12 }));
    s.finish();
  }],
  'actividades/talleres': [1400, 1050, 55, (s) => {
    s.add(woodSurface(s, '#D2B48F', { planks: 4 }));
    s.add(paintingPaper(s, 520, 480, 600, { angle: -4 }));
    s.add(watercolorPalette(s, 1080, 330, 380, { angle: 10 }));
    s.add(brush(s, 880, 720, 420, { angle: -20 }));
    s.add(brush(s, 930, 800, 380, { angle: -14, handle: P.clay }));
    s.add(glass(s, 1170, 760, 80, { tint: '#C9D9E0' }));
    s.finish();
  }],
  'actividades/cognitivas': [1400, 1050, 56, (s) => {
    s.add(linen(s, '#ECE4D6'));
    s.add(crossword(s, 430, 520, 460, { angle: -6 }));
    s.add(pencil(s, 620, 830, 320, { angle: -32 }));
    const cols = [P.sage, P.clayLight, P.sand, P.sageDark, '#E8C36A'];
    for (let i = 0; i < 7; i++) s.add(puzzlePiece(s, 880 + (i % 3) * 170 + s.r(-20, 20), 280 + Math.floor(i / 3) * 190 + s.r(-20, 20), 120, { color: cols[i % cols.length], angle: s.r(-40, 40), tabs: [s.pick([1, -1]), s.pick([1, -1]), s.pick([1, -1]), s.pick([1, -1])] }));
    s.finish();
  }],
  'actividades/aire-libre': [1400, 1050, 57, (s) => {
    s.add(gardenTop(s));
    s.finish({ vignette: 0.14 });
  }],
  'actividades/encuentros': [1400, 1050, 58, (s) => {
    s.add(woodSurface(s, '#BF9A72', { planks: 5 }));
    s.add(mate(s, 700, 520, 120, { angle: -60 }));
    s.add(termo(s, 860, 700, 440, { angle: -18, color: P.clay }));
    s.add(cup(s, 330, 300, 80, { handle: 30 }));
    s.add(cup(s, 1100, 280, 80, { handle: 160 }));
    s.add(cup(s, 330, 800, 80, { handle: 300, liquid: '#B0703A', tea: true }));
    s.add(plate(s, 1080, 780, 150));
    for (const [x, y] of [[1040, 750], [1120, 760], [1075, 830]]) s.add(medialuna(s, x, y, 46, { angle: s.r(-30, 30) }));
    s.finish({ vignette: 0.16 });
  }],
  'actividades/celebraciones': [1400, 1050, 59, (s) => {
    s.add(linen(s, '#F2ECE2'));
    s.add(confetti(s, 60, 60, 1280, 930, 70));
    s.add(cake(s, 640, 520, 250));
    s.add(plate(s, 1130, 300, 110));
    s.add(plate(s, 1130, 780, 110));
    s.add(fork(s, 1250, 300, 170, { angle: 10 }));
    s.add(napkin(s, 160, 700, 200, 150, { color: P.clayLight, angle: -10 }));
    s.finish();
  }],
  'actividades/recreativas': [1400, 1050, 60, (s) => {
    s.add(linen(s, '#EAE2D4'));
    s.add(yarn(s, 450, 420, 150, { color: P.clay }));
    s.add(yarn(s, 700, 330, 110, { color: P.sage }));
    s.add(yarn(s, 640, 620, 95, { color: '#E3C78F' }));
    s.add(needle(s, 820, 700, 480, { angle: -30 }));
    s.add(needle(s, 840, 760, 480, { angle: -24, color: '#C7B08E' }));
    s.add(knitSwatch(s, 880, 330, 340, 260, { color: P.sageLight, angle: 8 }));
    s.finish();
  }],

  /* ---------------- ALIMENTACIÓN ---------------- */
  'alimentacion/desayuno': [1200, 1200, 71, (s) => {
    s.add(woodSurface(s, '#CDAA82', { planks: 5 }));
    s.add(cup(s, 420, 420, 110, { handle: 30 }));
    s.add(plate(s, 760, 700, 220));
    s.add(medialuna(s, 720, 680, 110, { angle: -30 }));
    s.add(medialuna(s, 820, 740, 100, { angle: 18 }));
    s.add(glass(s, 860, 300, 85, { tint: '#F6C26B' }));
    s.add(napkin(s, 170, 760, 300, 250, { color: P.sageLight, angle: -10 }));
    s.finish();
  }],
  'alimentacion/almuerzo': [1200, 1200, 72, (s) => {
    s.add(linen(s, '#F0EAE0'));
    s.add(lunchPlate(s, 600, 620, 320));
    s.add(fork(s, 180, 620, 380));
    s.add(knife(s, 1020, 620, 380));
    s.add(glass(s, 1000, 220, 90));
    s.finish();
  }],
  'alimentacion/merienda': [1200, 1200, 73, (s) => {
    s.add(linen(s, '#EDE5D7'));
    s.add(mate(s, 420, 450, 150, { angle: -40 }));
    s.add(termo(s, 640, 180, 520, { angle: 100, color: P.sageDeep }));
    s.add(plate(s, 760, 780, 220));
    for (const [x, y] of [[700, 740], [820, 760], [760, 850]]) s.add(medialuna(s, x, y, 70, { angle: s.r(-30, 30) }));
    s.add(windowLight(s, { x: 200, y: -150, paneW: 380, paneH: 600, cols: 2, rows: 1, gap: 30, shear: [0.1, -0.6], soft: 18, color: '#FFE3B5', opacity: 0.28,
      leaves: { x: 1250, y: 300, angle: 2.8, branches: 5, spread: 1.2, length: 800, leafLen: 90, leafWid: 22, density: 12, blur: 4 }, leafOpacity: 0.26 }));
    s.finish();
  }],
  'alimentacion/cena': [1200, 1200, 74, (s) => {
    s.add(woodSurface(s, '#9C7A58', { planks: 4 }));
    s.add(napkin(s, 150, 250, 220, 700, { color: P.sand, angle: 0 }));
    s.add(spoon(s, 260, 600, 360));
    s.add(plate(s, 640, 620, 300, { color: '#F3EEE4' }));
    s.add(bowl(s, 640, 620, 210, { color: '#EEE7DA', fill: '#D9924F' }));
    s.add(glass(s, 1000, 260, 88));
    s.add(`<ellipse cx="980" cy="880" rx="110" ry="80" fill="${s.radial([[0, '#E4BF86'], [1, '#B98646']], { cx: 0.4, cy: 0.35 })}" filter="url(#${s.shadow(10)})"/>`);
    s.finish({ vignette: 0.22 });
  }],
  'alimentacion/frutas': [1200, 1200, 75, (s) => {
    s.add(linen(s, '#EFE7DA'));
    s.add(fruitBowl(s, 600, 600, 300));
    s.finish();
  }],

  /* ---------------- PÁGINAS ---------------- */
  'nosotros/hero': [1920, 1080, 81, (s) => {
    const t = T.manana;
    s.add(wall(s, { top: t.top, bottom: t.bottom }));
    s.add(windowLight(s, { x: 700, y: 60, paneW: 300, paneH: 330, cols: 3, rows: 2, gap: 22, shear: [0.1, -0.5], soft: 12, color: t.light, opacity: 0.9,
      leaves: { x: 2000, y: 50, angle: 2.6, branches: 6, spread: 1.4, length: 900, leafLen: 96, leafWid: 24, density: 13, blur: 4 }, leafOpacity: 0.3 }));
    s.add(floor(s, 930, { color: '#C4A27D' }));
    s.add(monstera(s, 380, 700, 280, { angle: -50 }));
    s.add(potFront(s, 380, 936, 170, { color: '#E9E2D6' }));
    s.add(sideTable(s, 1500, 936, 160));
    s.finish({ grain: 0.09 });
  }],
  'nosotros/historia': [1200, 1500, 82, (s) => {
    s.add(facade(s, { sepia: true }));
    s.finish({ grain: 0.16, vignette: 0.3 });
  }],
  'familias/hero': [1920, 1080, 83, (s) => {
    s.add(linen(s, '#EEE6D8'));
    s.add(teapot(s, 960, 500, 150));
    s.add(cup(s, 560, 560, 95, { handle: 200, liquid: '#B0703A', tea: true }));
    s.add(cup(s, 1360, 540, 95, { handle: -20, liquid: '#B0703A', tea: true }));
    s.add(plate(s, 960, 860, 150));
    for (const [x, y] of [[910, 840], [1000, 830], [955, 900]]) s.add(cookie(s, x, y, 36));
    s.add(napkin(s, 240, 700, 200, 160, { color: P.sageLight, angle: -8 }));
    s.add(windowLight(s, { x: 400, y: -300, paneW: 520, paneH: 900, cols: 2, rows: 1, gap: 50, shear: [0.05, -0.5], soft: 30, color: '#FFF4DC', opacity: 0.28,
      leaves: { x: 2100, y: 200, angle: 2.8, branches: 6, spread: 1.4, length: 1200, leafLen: 120, leafWid: 30, density: 12, blur: 6 }, leafOpacity: 0.22 }));
    s.finish();
  }],
  'servicios/hero': [1920, 1080, 84, (s) => {
    const t = T.mediodia;
    s.add(wall(s, { top: '#EEE7DC', bottom: '#D5C9B7' }));
    s.add(windowLight(s, { x: 1100, y: 40, paneW: 260, paneH: 380, cols: 2, rows: 1, gap: 24, shear: [0.12, -0.4], soft: 14, color: t.light, opacity: 0.85,
      leaves: { x: 1950, y: 80, angle: 2.5, branches: 5, spread: 1.2, length: 700, leafLen: 88, leafWid: 22, density: 12, blur: 4 }, leafOpacity: 0.3 }));
    s.add(floor(s, 930, { color: '#C29F78' }));
    s.add(armchair(s, 700, 932, 520, { color: '#AEBBA6' }));
    s.add(sideTable(s, 1040, 932, 150));
    s.add(bookStack(s, 980, 770, 120));
    s.add(lamp(s, 420, 700, 240));
    s.add(sideTable(s, 420, 932, 150));
    s.finish({ grain: 0.09 });
  }],
  'actividades/hero': [1920, 1080, 85, (s) => {
    s.add(woodSurface(s, '#C9A57C', { planks: 6 }));
    s.add(checkers(s, 560, 560, 460, { angle: -10 }));
    s.add(yarn(s, 1100, 360, 110, { color: P.clay }));
    s.add(needle(s, 1180, 560, 380, { angle: -24 }));
    s.add(book(s, 1450, 700, 420, { angle: 14, cover: P.green }));
    s.add(cup(s, 1000, 820, 80, { handle: 20 }));
    s.add(card(s, 180, 300, 140, { angle: -14, face: true, pips: 5 }));
    s.add(card(s, 260, 330, 140, { angle: 6, face: false }));
    s.finish();
  }],
  'contacto/mapa': [1600, 1000, 86, (s) => {
    s.add(mapIllustration(s));
    s.finish({ grain: 0.05, vignette: 0.08 });
  }],
};

/* Equipo: naturalezas muertas por área (NO representan personas reales). */
const team = {
  direccion: (s) => {
    s.add(linen(s, '#EAE2D3'));
    s.add(notebook(s, 480, 560, 420, { angle: -8, color: P.green }));
    s.add(pen(s, 700, 820, 360, { angle: -62 }));
    s.add(glasses(s, 420, 1000, 260, { angle: 12 }));
    s.add(cup(s, 780, 300, 90, { handle: 200 }));
  },
  cuidado: (s) => {
    s.add(linen(s, '#EDE6DA'));
    s.add(towel(s, 180, 380, 520, 300, { color: P.sageLight, angle: -4 }));
    s.add(towel(s, 210, 560, 500, 280, { color: P.cream, angle: 3 }));
    s.add(cup(s, 740, 980, 95, { handle: 20, liquid: '#B0703A', tea: true }));
    s.add(herbs(s, 300, 1080, 300, { angle: -20 }));
  },
  enfermeria: (s) => {
    s.add(linen(s, '#E9EDE6'));
    s.add(agenda(s, 560, 380, 520, { angle: 6 }));
    s.add(stethoscope(s, 480, 860, 420, { angle: -12 }));
    s.add(pen(s, 780, 1000, 300, { angle: -110, color: P.sageDeep }));
  },
  profesionales: (s) => {
    s.add(linen(s, '#ECE3D6'));
    s.add(book(s, 520, 520, 600, { angle: -8, cover: P.sageDark }));
    s.add(puzzlePiece(s, 760, 980, 130, { color: P.clayLight, angle: 18 }));
    s.add(puzzlePiece(s, 600, 1050, 130, { color: P.sage, angle: -12, tabs: [-1, 1, 1, -1] }));
    s.add(pencil(s, 180, 980, 300, { angle: -20 }));
  },
  cocina: (s) => {
    s.add(woodSurface(s, '#CBA57C', { planks: 4 }));
    s.add(board(s, 480, 560, 620, { angle: -10 }));
    s.add(herbs(s, 320, 600, 320, { angle: -10 }));
    s.add(woodenSpoon(s, 200, 980, 560, { angle: -18 }));
    s.add(bowl(s, 790, 960, 120, { color: '#EFE7DA', fill: '#E3C58A', soup: false }));
  },
  mantenimiento: (s) => {
    s.add(woodSurface(s, '#B99570', { planks: 5, vertical: true }));
    s.add(wrench(s, 200, 360, 480, { angle: 12 }));
    s.add(screwdriver(s, 200, 700, 520, { angle: -8, color: P.clay }));
    s.add(tape(s, 330, 1000, 110));
    s.add(plantTop(s, 820, 980, 110, { kind: 'rosette' }));
  },
  administracion: (s) => {
    s.add(linen(s, '#EEE7DB'));
    s.add(agenda(s, 520, 480, 560, { angle: -6 }));
    s.add(pen(s, 620, 900, 340, { angle: -30, color: P.clayDark }));
    s.add(cup(s, 300, 1010, 90, { handle: 300 }));
    s.add(glasses(s, 760, 1080, 230, { angle: -18 }));
  },
};
Object.entries(team).forEach(([name, draw], i) => {
  images[`equipo/${name}`] = [1000, 1250, 90 + i, (s) => {
    draw(s);
    s.finish({ grain: 0.08, vignette: 0.14 });
  }];
});

/* ======================================================================
   Salida
   ====================================================================== */
const only = process.argv[2];
let count = 0;
for (const [name, [w, h, seed, draw]] of Object.entries(images)) {
  if (only && !name.startsWith(only)) continue;
  const s = new Scene(w, h, seed);
  draw(s);
  const file = path.join(OUT, `${name}.svg`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, s.toString());
  count++;
}
console.log(`✓ ${count} imágenes provisionales generadas en ${path.relative(process.cwd(), OUT)}/`);
