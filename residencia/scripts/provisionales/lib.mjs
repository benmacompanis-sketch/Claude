/**
 * Utilidades para dibujar las imágenes provisionales en SVG.
 * Estilo: luz natural desde arriba a la izquierda, sombras suaves en dos capas,
 * texturas sutiles y grano fotográfico. Paleta cálida y sobria.
 */

/* ---------------------------------------------------------------- Azar reproducible */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------- Color */
const toRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (r, g, b) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => {
  const A = toRgb(a);
  const B = toRgb(b);
  return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
};
export const lighten = (c, t) => mix(c, '#ffffff', t);
export const darken = (c, t) => mix(c, '#000000', t);

/* ---------------------------------------------------------------- Paleta */
export const P = {
  cream: '#F6F0E6',
  linen: '#EEE6D8',
  sand: '#E2D5C1',
  sandDark: '#CDBBA0',
  sage: '#A9B8A3',
  sageLight: '#C9D3C3',
  sageDark: '#7E9580',
  sageDeep: '#5D7663',
  green: '#2D4A42',
  greenDeep: '#1F3530',
  clay: '#C4845C',
  clayDark: '#A7653F',
  clayLight: '#DDB08F',
  wood: '#B98F66',
  woodDark: '#8E6A48',
  woodLight: '#D4B791',
  ink: '#2A2622',
  shadow: '#3E3024',
  light: '#FFF6E3',
  night: '#20363A',
  nightDeep: '#132326',
  lamp: '#F6C77E',
  gold: '#C9A15A',
  metal: '#C9C6BE',
};

/* ---------------------------------------------------------------- Escena */
export class Scene {
  constructor(w, h, seed = 1) {
    this.w = w;
    this.h = h;
    this.rng = mulberry32(seed);
    this.defs = [];
    this.body = [];
    this.n = 0;
    this.cache = new Map();
  }
  id(prefix = 'x') {
    this.n += 1;
    return `${prefix}${this.n}`;
  }
  def(s) {
    this.defs.push(s);
  }
  add(...parts) {
    this.body.push(...parts);
  }
  r(a = 0, b = 1) {
    return a + this.rng() * (b - a);
  }
  pick(arr) {
    return arr[Math.floor(this.rng() * arr.length)];
  }
  once(key, make) {
    if (!this.cache.has(key)) this.cache.set(key, make());
    return this.cache.get(key);
  }

  /** Desenfoque gaussiano reutilizable. */
  blur(sd) {
    return this.once(`blur${sd}`, () => {
      const id = this.id('b');
      this.def(
        `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${sd}"/></filter>`,
      );
      return id;
    });
  }

  /** Sombra en dos capas (ambiente + contacto). `e` = altura del objeto. Luz desde arriba-izquierda. */
  shadow(e = 10, strength = 1) {
    return this.once(`sh${e}-${strength}`, () => {
      const id = this.id('s');
      const a = Math.max(2, e * 0.9);
      const c = Math.max(1, e * 0.14);
      this.def(`<filter id="${id}" x="-40%" y="-40%" width="190%" height="190%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation="${a}"/><feOffset dx="${e * 0.55}" dy="${e * 0.8}" result="o1"/>
<feFlood flood-color="${P.shadow}" flood-opacity="${0.26 * strength}"/><feComposite in2="o1" operator="in" result="s1"/>
<feGaussianBlur in="SourceAlpha" stdDeviation="${c}"/><feOffset dx="${e * 0.12}" dy="${e * 0.18}" result="o2"/>
<feFlood flood-color="${P.shadow}" flood-opacity="${0.34 * strength}"/><feComposite in2="o2" operator="in" result="s2"/>
<feMerge><feMergeNode in="s1"/><feMergeNode in="s2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
      return id;
    });
  }

  /** Degradado lineal. stops: [[offset, color, opacity?], ...] */
  linear(stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1, units } = {}) {
    const id = this.id('lg');
    const u = units ? ` gradientUnits="${units}"` : '';
    this.def(
      `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${u}>${stops
        .map(([o, c, op = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op}"/>`)
        .join('')}</linearGradient>`,
    );
    return `url(#${id})`;
  }

  /** Degradado radial. */
  radial(stops, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy, units } = {}) {
    const id = this.id('rg');
    const f = fx !== undefined ? ` fx="${fx}" fy="${fy}"` : '';
    const u = units ? ` gradientUnits="${units}"` : '';
    this.def(
      `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${f}${u}>${stops
        .map(([o, c, op = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op}"/>`)
        .join('')}</radialGradient>`,
    );
    return `url(#${id})`;
  }

  /** Textura de ruido coloreada (para fibras, veta de madera, papel). */
  noise({ fx = 0.8, fy = fx, octaves = 2, color = '#3a2c1f', alpha = 0.08, seed = 1, type = 'fractalNoise' }) {
    const id = this.id('n');
    const [r, g, b] = toRgb(color).map((v) => (v / 255).toFixed(3));
    this.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="${type}" baseFrequency="${fx} ${fy}" numOctaves="${octaves}" seed="${seed}" stitchTiles="noStitch"/>
<feColorMatrix type="matrix" values="0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  1.4 0 0 0 -0.45"/>
<feComponentTransfer><feFuncA type="linear" slope="${alpha * 2.2}" intercept="0"/></feComponentTransfer></filter>`);
    return id;
  }

  /** Grano fotográfico final + viñeta suave. */
  finish({ grain = 0.09, vignette = 0.16, warm = true } = {}) {
    const { w, h } = this;
    const g = this.id('grain');
    this.def(`<filter id="${g}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="2" seed="7" stitchTiles="noStitch"/>
<feColorMatrix type="saturate" values="0"/>
<feComponentTransfer><feFuncA type="table" tableValues="0 ${grain}"/></feComponentTransfer></filter>`);
    const vig = this.radial(
      [
        [0, '#000', 0],
        [0.62, '#000', 0],
        [1, warm ? '#2b1d10' : '#0b1416', vignette],
      ],
      { cx: 0.5, cy: 0.48, r: 0.78 },
    );
    this.add(
      `<rect width="${w}" height="${h}" fill="${vig}"/>`,
      `<rect width="${w}" height="${h}" filter="url(#${g})" style="mix-blend-mode:multiply"/>`,
    );
    return this;
  }

  toString() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}">
<!-- Imagen PROVISIONAL generada por scripts/generar-provisionales.mjs. Reemplazar por una foto real. -->
<defs>
${this.defs.join('\n')}
</defs>
${this.body.join('\n')}
</svg>
`;
  }
}

/* ---------------------------------------------------------------- Formas base */
export const f = (n) => Math.round(n * 10) / 10;

export function roundedRect(x, y, w, h, r) {
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}"/>`;
}

/** Hoja lanceolada apuntando hacia +x, desde el origen. */
export function leafD(len, wid, tipCurve = 0.62) {
  return `M0,0 C${f(len * 0.28)},${f(-wid)} ${f(len * tipCurve)},${f(-wid * 0.95)} ${f(len)},0 C${f(len * tipCurve)},${f(wid * 0.95)} ${f(len * 0.28)},${f(wid)} 0,0Z`;
}

/**
 * Ramas con hojas (para sombras de follaje o plantas).
 * Devuelve { stems, leaves } como strings de paths.
 */
export function foliage(s, { x, y, angle = -1.2, branches = 4, spread = 1.1, length = 420, leafLen = 70, leafWid = 16, density = 11, droop = 0.35 }) {
  let stems = '';
  let leaves = '';
  for (let b = 0; b < branches; b++) {
    let a = angle + (b / Math.max(1, branches - 1) - 0.5) * spread + s.r(-0.15, 0.15);
    let px = x + s.r(-20, 20);
    let py = y + s.r(-20, 20);
    const L = length * s.r(0.7, 1.15);
    const steps = 24;
    let d = `M${f(px)},${f(py)}`;
    const bend = s.r(-droop, droop);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      a += (bend / steps) * 1.4;
      px += Math.cos(a) * (L / steps);
      py += Math.sin(a) * (L / steps);
      d += ` L${f(px)},${f(py)}`;
      if (i % Math.max(1, Math.round(steps / density)) === 0 && t > 0.08) {
        const side = i % 2 === 0 ? 1 : -1;
        const la = a + side * s.r(0.55, 1.05);
        const ll = leafLen * (1.05 - t * 0.45) * s.r(0.8, 1.15);
        const lw = leafWid * (1.05 - t * 0.35) * s.r(0.8, 1.2);
        leaves += `<path d="${leafD(ll, lw)}" transform="translate(${f(px)} ${f(py)}) rotate(${f((la * 180) / Math.PI)})"/>`;
      }
    }
    // hoja terminal
    leaves += `<path d="${leafD(leafLen * 0.7, leafWid * 0.7)}" transform="translate(${f(px)} ${f(py)}) rotate(${f((a * 180) / Math.PI)})"/>`;
    stems += `<path d="${d}"/>`;
  }
  return { stems, leaves };
}

/**
 * Luz de ventana proyectada sobre una superficie, con sombras de follaje dentro.
 * Devuelve el SVG del parche de luz ya enmascarado.
 */
export function windowLight(
  s,
  {
    x = 0,
    y = 0,
    paneW = 220,
    paneH = 300,
    cols = 2,
    rows = 2,
    gap = 18,
    shear = [0.12, -0.4],
    rotate = 0,
    soft = 16,
    color = P.light,
    opacity = 0.85,
    leaves = null,
    leafColor = P.shadow,
    leafOpacity = 0.3,
    slats = 0,
  } = {},
) {
  const mask = s.id('lm');
  let panes = '';
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (slats) {
        const sh = paneH / slats;
        for (let k = 0; k < slats; k++) {
          panes += `<rect x="${f(c * (paneW + gap))}" y="${f(r * (paneH + gap) + k * sh)}" width="${f(paneW)}" height="${f(sh * 0.62)}"/>`;
        }
      } else {
        panes += `<rect x="${f(c * (paneW + gap))}" y="${f(r * (paneH + gap))}" width="${f(paneW)}" height="${f(paneH)}"/>`;
      }
    }
  }
  const tf = `translate(${f(x)} ${f(y)}) rotate(${rotate}) matrix(1 ${shear[0]} ${shear[1]} 1 0 0)`;
  s.def(`<mask id="${mask}" maskUnits="userSpaceOnUse" x="0" y="0" width="${s.w}" height="${s.h}"><g fill="#fff" filter="url(#${s.blur(soft)})" transform="${tf}">${panes}</g></mask>`);
  let out = `<rect width="${s.w}" height="${s.h}" fill="${color}" opacity="${opacity}" mask="url(#${mask})"/>`;
  if (leaves) {
    const { stems, leaves: lv } = foliage(s, leaves);
    out += `<g mask="url(#${mask})" opacity="${leafOpacity}"><g fill="${leafColor}" filter="url(#${s.blur(leaves.blur ?? 3)})">${lv}</g><g fill="none" stroke="${leafColor}" stroke-width="${leaves.stem ?? 3}" filter="url(#${s.blur(leaves.blur ?? 3)})">${stems}</g></g>`;
  }
  return out;
}

/* ---------------------------------------------------------------- Superficies */
export function wall(s, { top = '#EFE6D8', bottom = '#D9CAB3', angle = 'diag' } = {}) {
  const g =
    angle === 'diag'
      ? s.linear([[0, lighten(top, 0.06)], [0.55, top], [1, bottom]], { x1: 0, y1: 0, x2: 1, y2: 1 })
      : s.linear([[0, top], [1, bottom]]);
  const tex = s.noise({ fx: 0.012, fy: 0.018, octaves: 3, color: '#6b5a45', alpha: 0.032, seed: 11 });
  return `<rect width="${s.w}" height="${s.h}" fill="${g}"/><rect width="${s.w}" height="${s.h}" filter="url(#${tex})"/>`;
}

export function linen(s, color = P.linen, { x = 0, y = 0, w = s.w, h = s.h } = {}) {
  const t1 = s.noise({ fx: 0.9, fy: 0.01, octaves: 1, color: '#6d5c47', alpha: 0.05, seed: 3 });
  const t2 = s.noise({ fx: 0.01, fy: 0.9, octaves: 1, color: '#6d5c47', alpha: 0.05, seed: 5 });
  const t3 = s.noise({ fx: 0.003, fy: 0.004, octaves: 2, color: '#5a4834', alpha: 0.06, seed: 9 });
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${t1})"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${t2})"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${t3})"/>`;
}

export function woodSurface(s, base = P.wood, { x = 0, y = 0, w = s.w, h = s.h, vertical = false, planks = 5 } = {}) {
  const grain = s.noise({
    fx: vertical ? 0.09 : 0.0035,
    fy: vertical ? 0.0035 : 0.09,
    octaves: 3,
    color: darken(base, 0.55),
    alpha: 0.16,
    seed: 21,
  });
  const fine = s.noise({ fx: vertical ? 0.6 : 0.02, fy: vertical ? 0.02 : 0.6, octaves: 1, color: darken(base, 0.4), alpha: 0.07, seed: 23 });
  const sheen = s.linear(
    [
      [0, lighten(base, 0.18)],
      [0.5, base],
      [1, darken(base, 0.12)],
    ],
    { x1: 0, y1: 0, x2: 1, y2: 1 },
  );
  let lines = '';
  for (let i = 1; i < planks; i++) {
    const p = (i / planks) * (vertical ? w : h);
    lines += vertical
      ? `<rect x="${f(x + p - 1)}" y="${y}" width="2" height="${h}" fill="${darken(base, 0.3)}" opacity="0.35"/>`
      : `<rect x="${x}" y="${f(y + p - 1)}" width="${w}" height="2" fill="${darken(base, 0.3)}" opacity="0.35"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${sheen}"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${grain})"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${fine})"/>${lines}`;
}

/* ---------------------------------------------------------------- Objetos vistos desde arriba */

export function plate(s, cx, cy, r, { color = '#FBF8F1', e = 8 } = {}) {
  const body = s.radial(
    [
      [0, lighten(color, 0.4)],
      [0.72, color],
      [1, darken(color, 0.07)],
    ],
    { cx: 0.42, cy: 0.38, r: 0.72 },
  );
  const well = s.radial(
    [
      [0, color],
      [0.8, darken(color, 0.035)],
      [1, darken(color, 0.1)],
    ],
    { cx: 0.58, cy: 0.62, r: 0.62 },
  );
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${body}" filter="url(#${s.shadow(e)})"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.7)}" fill="${well}"/>
<path d="M${f(cx - r * 0.9)},${f(cy + r * 0.1)} A${f(r * 0.9)},${f(r * 0.9)} 0 0 1 ${f(cx - r * 0.1)},${f(cy - r * 0.9)}" fill="none" stroke="#fff" stroke-width="${f(r * 0.035)}" stroke-linecap="round" opacity="0.55"/>`;
}

export function cup(s, cx, cy, r, { liquid = '#5C3A22', crema = '#B8875A', color = '#FCFAF5', handle = 35, saucer = true, e = 14, tea = false } = {}) {
  let out = '';
  if (saucer) out += plate(s, cx, cy, r * 1.55, { color, e: 6 });
  const ang = (handle * Math.PI) / 180;
  const hx = cx + Math.cos(ang) * r * 1.05;
  const hy = cy + Math.sin(ang) * r * 1.05;
  const body = s.radial(
    [
      [0, '#fff'],
      [0.8, color],
      [1, darken(color, 0.12)],
    ],
    { cx: 0.4, cy: 0.35, r: 0.7 },
  );
  const liq = s.radial(
    tea
      ? [
          [0, lighten(liquid, 0.25)],
          [1, liquid],
        ]
      : [
          [0, crema],
          [0.55, mix(crema, liquid, 0.5)],
          [0.8, liquid],
          [1, darken(liquid, 0.3)],
        ],
    { cx: 0.46, cy: 0.44, r: 0.6 },
  );
  out += `<g filter="url(#${s.shadow(e)})"><rect x="${f(-r * 0.22)}" y="${f(-r * 0.13)}" width="${f(r * 0.62)}" height="${f(r * 0.26)}" rx="${f(r * 0.13)}" fill="${darken(color, 0.03)}" transform="translate(${f(hx)} ${f(hy)}) rotate(${handle})"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${body}"/></g>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.84)}" fill="${liq}"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.84)}" fill="none" stroke="${darken(color, 0.15)}" stroke-width="${f(r * 0.03)}" opacity="0.5"/>
<ellipse cx="${f(cx - r * 0.3)}" cy="${f(cy - r * 0.32)}" rx="${f(r * 0.22)}" ry="${f(r * 0.08)}" fill="#fff" opacity="0.35" transform="rotate(-35 ${f(cx - r * 0.3)} ${f(cy - r * 0.32)})"/>`;
  return out;
}

export function glass(s, cx, cy, r, { e = 12, tint = '#EEF3EC' } = {}) {
  const caustic = `<ellipse cx="${f(cx + r * 0.9)}" cy="${f(cy + r * 1.1)}" rx="${f(r * 0.5)}" ry="${f(r * 0.3)}" fill="#FFF8E6" opacity="0.55" filter="url(#${s.blur(6)})"/>`;
  return `<circle cx="${f(cx + r * 0.5)}" cy="${f(cy + r * 0.7)}" r="${f(r * 0.95)}" fill="${P.shadow}" opacity="0.12" filter="url(#${s.blur(e * 0.8)})"/>${caustic}
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${tint}" opacity="0.55"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="#fff" stroke-width="${f(r * 0.08)}" opacity="0.75"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.86)}" fill="none" stroke="${darken(tint, 0.25)}" stroke-width="${f(r * 0.03)}" opacity="0.5"/>
<path d="M${f(cx - r * 0.7)},${f(cy - r * 0.2)} A${f(r * 0.75)},${f(r * 0.75)} 0 0 1 ${f(cx - r * 0.15)},${f(cy - r * 0.72)}" fill="none" stroke="#fff" stroke-width="${f(r * 0.1)}" stroke-linecap="round" opacity="0.8"/>`;
}

export function mate(s, cx, cy, r, { angle = -40, body = '#4B3A28', e = 20 } = {}) {
  const b = s.radial(
    [
      [0, lighten(body, 0.25)],
      [0.7, body],
      [1, darken(body, 0.35)],
    ],
    { cx: 0.38, cy: 0.35, r: 0.72 },
  );
  const ring = s.linear(
    [
      [0, '#F1EEE8'],
      [0.45, '#B7B2A8'],
      [0.55, '#E4E0D8'],
      [1, '#8C877E'],
    ],
    { x1: 0, y1: 0, x2: 1, y2: 1 },
  );
  const yerba = s.radial(
    [
      [0, '#9DAE62'],
      [0.6, '#7D8F45'],
      [1, '#56662C'],
    ],
    { cx: 0.35, cy: 0.4, r: 0.75 },
  );
  const tex = s.noise({ fx: 0.35, octaves: 2, color: '#2f3a14', alpha: 0.35, seed: 31 });
  const clip = s.id('cm');
  s.def(`<clipPath id="${clip}"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.7)}"/></clipPath>`);
  const a = (angle * Math.PI) / 180;
  const len = r * 1.9;
  const metal = s.linear(
    [
      [0, '#EDEAE3'],
      [0.5, '#A9A49A'],
      [1, '#E6E2DA'],
    ],
    { x1: 0, y1: 0, x2: 0, y2: 1 },
  );
  const bx = cx + Math.cos(a) * r * 0.1;
  const by = cy + Math.sin(a) * r * 0.1;
  const stitches = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.93)}" fill="none" stroke="${lighten(body, 0.35)}" stroke-width="${f(r * 0.025)}" stroke-dasharray="${f(r * 0.06)} ${f(r * 0.05)}" opacity="0.7"/>`;
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${b}" filter="url(#${s.shadow(e)})"/>${stitches}
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.8)}" fill="${ring}"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.7)}" fill="${yerba}"/>
<rect x="${f(cx - r)}" y="${f(cy - r)}" width="${f(r * 2)}" height="${f(r * 2)}" clip-path="url(#${clip})" filter="url(#${tex})"/>
<ellipse cx="${f(cx + r * 0.18)}" cy="${f(cy + r * 0.12)}" rx="${f(r * 0.34)}" ry="${f(r * 0.26)}" fill="#A8BA6B" opacity="0.55" filter="url(#${s.blur(r * 0.08)})"/>
<g transform="translate(${f(bx)} ${f(by)}) rotate(${angle})" filter="url(#${s.shadow(e * 0.7)})">
<rect x="0" y="${f(-r * 0.055)}" width="${f(len)}" height="${f(r * 0.11)}" rx="${f(r * 0.055)}" fill="${metal}"/>
<rect x="${f(len * 0.52)}" y="${f(-r * 0.085)}" width="${f(r * 0.12)}" height="${f(r * 0.17)}" rx="${f(r * 0.04)}" fill="${metal}"/>
<rect x="${f(len - r * 0.24)}" y="${f(-r * 0.075)}" width="${f(r * 0.26)}" height="${f(r * 0.15)}" rx="${f(r * 0.07)}" fill="${metal}"/>
</g>`;
}

export function termo(s, x, y, len, { angle = 0, color = P.green, e = 22 } = {}) {
  const w = len * 0.28;
  const body = s.linear(
    [
      [0, lighten(color, 0.3)],
      [0.35, color],
      [0.7, darken(color, 0.2)],
      [1, darken(color, 0.4)],
    ],
    { x1: 0, y1: 0, x2: 0, y2: 1 },
  );
  const cap = s.linear(
    [
      [0, '#6f6a61'],
      [0.4, '#3f3b35'],
      [1, '#26231f'],
    ],
    { x1: 0, y1: 0, x2: 0, y2: 1 },
  );
  const steel = s.linear(
    [
      [0, '#F2EFE9'],
      [0.4, '#B9B4AB'],
      [1, '#7F7A71'],
    ],
    { x1: 0, y1: 0, x2: 0, y2: 1 },
  );
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" filter="url(#${s.shadow(e)})">
<rect x="0" y="${f(-w / 2)}" width="${f(len * 0.74)}" height="${f(w)}" rx="${f(w * 0.28)}" fill="${body}"/>
<rect x="${f(len * 0.7)}" y="${f(-w * 0.47)}" width="${f(len * 0.06)}" height="${f(w * 0.94)}" fill="${steel}"/>
<rect x="${f(len * 0.75)}" y="${f(-w * 0.42)}" width="${f(len * 0.25)}" height="${f(w * 0.84)}" rx="${f(w * 0.22)}" fill="${cap}"/>
<rect x="${f(len * 0.08)}" y="${f(-w * 0.38)}" width="${f(len * 0.56)}" height="${f(w * 0.12)}" rx="${f(w * 0.06)}" fill="#fff" opacity="0.18"/>
</g>`;
}

export function medialuna(s, cx, cy, size, { angle = 0, e = 10 } = {}) {
  const g = s.radial(
    [
      [0, '#E9B96E'],
      [0.55, '#C98E45'],
      [1, '#9C6528'],
    ],
    { cx: 0.42, cy: 0.35, r: 0.75 },
  );
  const R = size;
  const d = `M${f(-R)},0 C${f(-R * 0.95)},${f(-R * 0.75)} ${f(-R * 0.35)},${f(-R * 0.98)} 0,${f(-R * 0.98)} C${f(R * 0.35)},${f(-R * 0.98)} ${f(R * 0.95)},${f(-R * 0.75)} ${f(R)},0 C${f(R * 0.85)},${f(R * 0.12)} ${f(R * 0.62)},${f(-R * 0.05)} ${f(R * 0.45)},${f(-R * 0.18)} C${f(R * 0.25)},${f(-R * 0.35)} ${f(-R * 0.25)},${f(-R * 0.35)} ${f(-R * 0.45)},${f(-R * 0.18)} C${f(-R * 0.62)},${f(-R * 0.05)} ${f(-R * 0.85)},${f(R * 0.12)} ${f(-R)},0Z`;
  let seg = '';
  for (let i = -2; i <= 2; i++) {
    const sx = i * R * 0.3;
    seg += `<path d="M${f(sx - R * 0.08)},${f(-R * 0.9)} Q${f(sx + R * 0.1)},${f(-R * 0.55)} ${f(sx * 1.15)},${f(-R * 0.28)}" fill="none" stroke="#8a5620" stroke-width="${f(R * 0.035)}" stroke-linecap="round" opacity="0.45"/>`;
  }
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><path d="${d}" fill="${g}" filter="url(#${s.shadow(e)})"/>${seg}
<path d="M${f(-R * 0.55)},${f(-R * 0.7)} Q0,${f(-R * 0.95)} ${f(R * 0.5)},${f(-R * 0.72)}" fill="none" stroke="#FFE3B0" stroke-width="${f(R * 0.09)}" stroke-linecap="round" opacity="0.35" filter="url(#${s.blur(R * 0.04)})"/></g>`;
}

export function napkin(s, x, y, w, h, { color = P.sage, angle = 0, e = 4 } = {}) {
  const g = s.linear(
    [
      [0, lighten(color, 0.12)],
      [1, darken(color, 0.06)],
    ],
    { x1: 0, y1: 0, x2: 1, y2: 1 },
  );
  const tex = s.noise({ fx: 0.7, fy: 0.05, octaves: 1, color: darken(color, 0.5), alpha: 0.12, seed: 41 });
  const clip = s.id('cn');
  s.def(`<clipPath id="${clip}"><rect x="0" y="0" width="${f(w)}" height="${f(h)}" rx="4"/></clipPath>`);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})"><rect x="0" y="0" width="${f(w)}" height="${f(h)}" rx="4" fill="${g}" filter="url(#${s.shadow(e)})"/>
<rect x="0" y="0" width="${f(w)}" height="${f(h)}" clip-path="url(#${clip})" filter="url(#${tex})"/>
<rect x="${f(w * 0.52)}" y="0" width="${f(w * 0.04)}" height="${f(h)}" fill="${darken(color, 0.12)}" opacity="0.35"/>
<rect x="6" y="6" width="${f(w - 12)}" height="${f(h - 12)}" rx="3" fill="none" stroke="${lighten(color, 0.3)}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/></g>`;
}

export function fork(s, x, y, len, { angle = 0, e = 5 } = {}) {
  const m = s.linear(
    [
      [0, '#F4F2ED'],
      [0.5, '#B3AEA5'],
      [1, '#E2DED6'],
    ],
    { x1: 0, y1: 0, x2: 1, y2: 0 },
  );
  const w = len * 0.075;
  const tines = [0, 1, 2, 3]
    .map((i) => `<rect x="${f(-w * 1.1 + i * w * 0.62)}" y="${f(-len * 0.26)}" width="${f(w * 0.3)}" height="${f(len * 0.2)}" rx="${f(w * 0.15)}"/>`)
    .join('');
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" fill="${m}" filter="url(#${s.shadow(e)})">
<rect x="${f(-w / 2)}" y="${f(len * 0.02)}" width="${f(w)}" height="${f(len * 0.72)}" rx="${f(w / 2)}"/>
<path d="M${f(-w * 1.1)},${f(-len * 0.08)} Q${f(-w * 1.1)},${f(len * 0.06)} ${f(-w * 0.3)},${f(len * 0.08)} L${f(w * 0.3)},${f(len * 0.08)} Q${f(w * 1.1)},${f(len * 0.06)} ${f(w * 1.1)},${f(-len * 0.08)}Z"/>${tines}</g>`;
}

export function knife(s, x, y, len, { angle = 0, e = 5 } = {}) {
  const m = s.linear(
    [
      [0, '#F4F2ED'],
      [0.5, '#B3AEA5'],
      [1, '#E2DED6'],
    ],
    { x1: 0, y1: 0, x2: 1, y2: 0 },
  );
  const w = len * 0.08;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" fill="${m}" filter="url(#${s.shadow(e)})">
<rect x="${f(-w / 2)}" y="${f(len * 0.05)}" width="${f(w)}" height="${f(len * 0.62)}" rx="${f(w / 2)}"/>
<path d="M${f(-w * 0.5)},${f(len * 0.06)} L${f(-w * 0.5)},${f(-len * 0.3)} Q${f(-w * 0.4)},${f(-len * 0.34)} ${f(w * 0.6)},${f(-len * 0.28)} L${f(w * 0.55)},${f(len * 0.06)}Z"/></g>`;
}

export function spoon(s, x, y, len, { angle = 0, e = 5 } = {}) {
  const m = s.linear(
    [
      [0, '#F4F2ED'],
      [0.5, '#B3AEA5'],
      [1, '#E2DED6'],
    ],
    { x1: 0, y1: 0, x2: 1, y2: 1 },
  );
  const w = len * 0.07;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" fill="${m}" filter="url(#${s.shadow(e)})">
<rect x="${f(-w / 2)}" y="${f(0)}" width="${f(w)}" height="${f(len * 0.7)}" rx="${f(w / 2)}"/>
<ellipse cx="0" cy="${f(-len * 0.12)}" rx="${f(len * 0.11)}" ry="${f(len * 0.16)}"/></g>`;
}

export function bowl(s, cx, cy, r, { color = '#F5F0E6', fill = '#D98E4A', e = 14, soup = true } = {}) {
  const b = s.radial(
    [
      [0, lighten(color, 0.4)],
      [0.75, color],
      [1, darken(color, 0.1)],
    ],
    { cx: 0.4, cy: 0.36, r: 0.7 },
  );
  const inner = s.radial(
    [
      [0, lighten(fill, 0.18)],
      [0.7, fill],
      [1, darken(fill, 0.25)],
    ],
    { cx: 0.44, cy: 0.42, r: 0.62 },
  );
  let out = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${b}" filter="url(#${s.shadow(e)})"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.82)}" fill="${inner}"/>`;
  if (soup) {
    out += `<path d="M${f(cx - r * 0.35)},${f(cy + r * 0.05)} C${f(cx - r * 0.2)},${f(cy - r * 0.35)} ${f(cx + r * 0.35)},${f(cy - r * 0.2)} ${f(cx + r * 0.2)},${f(cy + r * 0.12)} C${f(cx + r * 0.1)},${f(cy + r * 0.3)} ${f(cx - r * 0.15)},${f(cy + r * 0.2)} ${f(cx - r * 0.05)},${f(cy)}" fill="none" stroke="#FFF3E0" stroke-width="${f(r * 0.06)}" stroke-linecap="round" opacity="0.8"/>`;
    for (let i = 0; i < 14; i++) {
      const a = s.r(0, Math.PI * 2);
      const d = s.r(0, r * 0.6);
      out += `<ellipse cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d)}" rx="${f(r * 0.035)}" ry="${f(r * 0.018)}" fill="#4F6B2E" transform="rotate(${f(s.r(0, 180))} ${f(cx + Math.cos(a) * d)} ${f(cy + Math.sin(a) * d)})" opacity="0.85"/>`;
    }
  }
  return out;
}

/** Plato de almuerzo equilibrado: puré, filete y verduras. */
export function lunchPlate(s, cx, cy, r) {
  let out = plate(s, cx, cy, r, { e: 9 });
  // puré
  out += `<path d="M${f(cx - r * 0.55)},${f(cy - r * 0.05)} C${f(cx - r * 0.6)},${f(cy - r * 0.45)} ${f(cx - r * 0.1)},${f(cy - r * 0.55)} ${f(cx + r * 0.02)},${f(cy - r * 0.3)} C${f(cx + r * 0.12)},${f(cy - r * 0.05)} ${f(cx - r * 0.1)},${f(cy + r * 0.12)} ${f(cx - r * 0.3)},${f(cy + r * 0.1)} C${f(cx - r * 0.45)},${f(cy + r * 0.1)} ${f(cx - r * 0.52)},${f(cy + r * 0.05)} ${f(cx - r * 0.55)},${f(cy - r * 0.05)}Z" fill="${s.radial([[0, '#FBF0D2'], [1, '#E3CC98']], { cx: 0.4, cy: 0.35 })}" filter="url(#${s.shadow(4)})"/>`;
  out += `<circle cx="${f(cx - r * 0.28)}" cy="${f(cy - r * 0.22)}" r="${f(r * 0.03)}" fill="#6F8C3A"/><circle cx="${f(cx - r * 0.2)}" cy="${f(cy - r * 0.28)}" r="${f(r * 0.025)}" fill="#6F8C3A"/>`;
  // filete
  const meat = s.radial([[0, '#D8A064'], [0.6, '#B97A3E'], [1, '#8A5424']], { cx: 0.4, cy: 0.35, r: 0.7 });
  out += `<g transform="translate(${f(cx + r * 0.22)} ${f(cy - r * 0.08)}) rotate(-18)"><ellipse cx="0" cy="0" rx="${f(r * 0.36)}" ry="${f(r * 0.22)}" fill="${meat}" filter="url(#${s.shadow(5)})"/>`;
  for (let i = -2; i <= 2; i++) out += `<rect x="${f(i * r * 0.12 - r * 0.015)}" y="${f(-r * 0.18)}" width="${f(r * 0.03)}" height="${f(r * 0.36)}" rx="${f(r * 0.015)}" fill="#6b3d17" opacity="0.5" transform="rotate(35 ${f(i * r * 0.12)} 0)"/>`;
  out += `</g>`;
  // brócoli
  for (let k = 0; k < 3; k++) {
    const bx = cx - r * 0.12 + k * r * 0.2;
    const by = cy + r * 0.38 - (k % 2) * r * 0.06;
    for (let j = 0; j < 7; j++) {
      const a = (j / 7) * Math.PI * 2;
      out += `<circle cx="${f(bx + Math.cos(a) * r * 0.05)}" cy="${f(by + Math.sin(a) * r * 0.05)}" r="${f(r * 0.055)}" fill="${j % 2 ? '#4F7A34' : '#5E8A3E'}"/>`;
    }
    out += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r * 0.05)}" fill="#6E9A48"/>`;
  }
  // zanahorias
  for (let k = 0; k < 4; k++) {
    const zx = cx + r * 0.42 + (k % 2) * r * 0.09;
    const zy = cy + r * 0.2 + Math.floor(k / 2) * r * 0.12;
    out += `<circle cx="${f(zx)}" cy="${f(zy)}" r="${f(r * 0.06)}" fill="#E58A3A" filter="url(#${s.shadow(2)})"/><circle cx="${f(zx)}" cy="${f(zy)}" r="${f(r * 0.03)}" fill="#F2A860" opacity="0.8"/>`;
  }
  return out;
}

export function fruitBowl(s, cx, cy, r) {
  let out = bowl(s, cx, cy, r, { color: '#EFE7DA', fill: '#E4D8C4', soup: false, e: 16 });
  const fruits = [
    [-0.28, -0.2, 0.3, '#E8963A'],
    [0.2, -0.28, 0.28, '#EFA24A'],
    [0.28, 0.18, 0.29, '#B8412E'],
    [-0.22, 0.27, 0.27, '#E8963A'],
    [0.0, 0.0, 0.26, '#9DB04A'],
  ];
  for (const [dx, dy, rr, c] of fruits) {
    const g = s.radial([[0, lighten(c, 0.35)], [0.6, c], [1, darken(c, 0.3)]], { cx: 0.36, cy: 0.32, r: 0.7 });
    out += `<circle cx="${f(cx + dx * r)}" cy="${f(cy + dy * r)}" r="${f(rr * r)}" fill="${g}" filter="url(#${s.shadow(8)})"/>`;
  }
  return out;
}

export function book(s, cx, cy, w, { angle = 0, cover = P.green, e = 6, lines = true } = {}) {
  const h = w * 0.68;
  const page = s.linear(
    [
      [0, '#F3ECDD'],
      [0.46, '#FBF7EE'],
      [0.5, '#D9CDB6'],
      [0.54, '#FBF7EE'],
      [1, '#F0E8D8'],
    ],
    { x1: 0, y1: 0, x2: 1, y2: 0 },
  );
  let txt = '';
  if (lines) {
    for (let side = 0; side < 2; side++) {
      for (let i = 0; i < 12; i++) {
        const lw = w * (i === 11 ? 0.2 : s.r(0.3, 0.36));
        txt += `<rect x="${f(-w / 2 + w * 0.07 + side * w * 0.52)}" y="${f(-h / 2 + h * 0.14 + i * h * 0.062)}" width="${f(lw)}" height="${f(h * 0.018)}" rx="1" fill="#8F8573" opacity="0.55"/>`;
      }
    }
  }
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})">
<rect x="${f(-w / 2 - 8)}" y="${f(-h / 2 - 6)}" width="${f(w + 16)}" height="${f(h + 12)}" rx="4" fill="${cover}" filter="url(#${s.shadow(e)})"/>
<path d="M${f(-w / 2)},${f(-h / 2 + 6)} Q${f(-w / 4)},${f(-h / 2 - 4)} 0,${f(-h / 2 + 4)} Q${f(w / 4)},${f(-h / 2 - 4)} ${f(w / 2)},${f(-h / 2 + 6)} L${f(w / 2)},${f(h / 2)} Q${f(w / 4)},${f(h / 2 - 8)} 0,${f(h / 2 - 2)} Q${f(-w / 4)},${f(h / 2 - 8)} ${f(-w / 2)},${f(h / 2)}Z" fill="${page}"/>${txt}</g>`;
}

export function glasses(s, cx, cy, size, { angle = 0, frame = '#3A2E25', e = 8 } = {}) {
  const lw = size * 0.42;
  const lh = size * 0.3;
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})" filter="url(#${s.shadow(e, 0.7)})" fill="none" stroke="${frame}" stroke-width="${f(size * 0.035)}">
<rect x="${f(-size * 0.5)}" y="${f(-lh / 2)}" width="${f(lw)}" height="${f(lh)}" rx="${f(lh * 0.42)}" fill="#fff" fill-opacity="0.12"/>
<rect x="${f(size * 0.08)}" y="${f(-lh / 2)}" width="${f(lw)}" height="${f(lh)}" rx="${f(lh * 0.42)}" fill="#fff" fill-opacity="0.12"/>
<path d="M${f(-size * 0.08)},${f(-lh * 0.12)} Q0,${f(-lh * 0.35)} ${f(size * 0.08)},${f(-lh * 0.12)}"/>
<path d="M${f(-size * 0.5)},${f(-lh * 0.3)} L${f(-size * 0.62)},${f(lh * 0.2)} L${f(-size * 0.12)},${f(lh * 0.45)}" opacity="0.8"/>
<path d="M${f(size * 0.5)},${f(-lh * 0.3)} L${f(size * 0.62)},${f(lh * 0.2)} L${f(size * 0.2)},${f(lh * 0.5)}" opacity="0.8"/></g>`;
}

/** Naipe español (boca arriba con oros, o boca abajo con dorso). */
export function card(s, cx, cy, w, { angle = 0, face = true, pips = 3, e = 3 } = {}) {
  const h = w * 1.55;
  let inner = '';
  if (face) {
    const gold = s.radial([[0, '#F2D48A'], [0.7, '#D2A646'], [1, '#9C7424']], { cx: 0.4, cy: 0.35 });
    const pos = {
      1: [[0, 0]],
      2: [[0, -0.22], [0, 0.22]],
      3: [[0, -0.28], [0, 0], [0, 0.28]],
      4: [[-0.2, -0.22], [0.2, -0.22], [-0.2, 0.22], [0.2, 0.22]],
      5: [[-0.2, -0.26], [0.2, -0.26], [0, 0], [-0.2, 0.26], [0.2, 0.26]],
    }[pips];
    inner = pos
      .map(
        ([px, py]) =>
          `<circle cx="${f(px * w)}" cy="${f(py * h)}" r="${f(w * (pips === 1 ? 0.24 : 0.13))}" fill="${gold}" stroke="#8E6A1F" stroke-width="1.2"/><circle cx="${f(px * w)}" cy="${f(py * h)}" r="${f(w * (pips === 1 ? 0.12 : 0.06))}" fill="none" stroke="#8E6A1F" stroke-width="1"/>`,
      )
      .join('');
    inner += `<rect x="${f(-w * 0.42)}" y="${f(-h * 0.45)}" width="${f(w * 0.84)}" height="${f(h * 0.9)}" rx="4" fill="none" stroke="#C9A15A" stroke-width="1.2" opacity="0.7"/>`;
    inner += `<text x="${f(-w * 0.34)}" y="${f(-h * 0.33)}" font-family="Georgia, serif" font-size="${f(w * 0.16)}" fill="#8E6A1F">${pips}</text>`;
  } else {
    const pid = s.id('pt');
    s.def(`<pattern id="${pid}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="${P.green}"/><path d="M0 6h12M6 0v12" stroke="#C9B98E" stroke-width="1" opacity="0.5"/></pattern>`);
    inner = `<rect x="${f(-w * 0.4)}" y="${f(-h * 0.43)}" width="${f(w * 0.8)}" height="${f(h * 0.86)}" rx="5" fill="url(#${pid})"/>`;
  }
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(w * 0.08)}" fill="#FBF8F1" stroke="#E0D6C4" stroke-width="1" filter="url(#${s.shadow(e)})"/>${inner}</g>`;
}

export function checkers(s, cx, cy, size, { angle = 0 } = {}) {
  const cell = size / 8;
  let sq = '';
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) sq += `<rect x="${f(-size / 2 + i * cell)}" y="${f(-size / 2 + j * cell)}" width="${f(cell)}" height="${f(cell)}"/>`;
  let pieces = '';
  const pos = [
    [1, 0, 0], [3, 0, 0], [5, 0, 0], [0, 1, 0], [2, 1, 0], [6, 1, 0], [1, 2, 0], [5, 2, 0], [4, 3, 0],
    [2, 5, 1], [4, 5, 1], [6, 5, 1], [1, 6, 1], [3, 6, 1], [7, 6, 1], [0, 7, 1], [4, 7, 1], [3, 4, 1],
  ];
  const cream = s.radial([[0, '#FFF9EC'], [0.8, '#E8DCC4'], [1, '#C9B795']], { cx: 0.4, cy: 0.35 });
  const dark = s.radial([[0, '#5E7A6B'], [0.8, P.green], [1, P.greenDeep]], { cx: 0.4, cy: 0.35 });
  for (const [i, j, t] of pos) {
    const px = -size / 2 + (i + 0.5) * cell;
    const py = -size / 2 + (j + 0.5) * cell;
    pieces += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(cell * 0.38)}" fill="${t ? dark : cream}" filter="url(#${s.shadow(5)})"/><circle cx="${f(px)}" cy="${f(py)}" r="${f(cell * 0.26)}" fill="none" stroke="${t ? '#8FA89A' : '#B5A27D'}" stroke-width="1.5" opacity="0.7"/>`;
  }
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><rect x="${f(-size / 2 - cell * 0.4)}" y="${f(-size / 2 - cell * 0.4)}" width="${f(size + cell * 0.8)}" height="${f(size + cell * 0.8)}" rx="6" fill="${P.woodDark}" filter="url(#${s.shadow(8)})"/>
<rect x="${f(-size / 2)}" y="${f(-size / 2)}" width="${f(size)}" height="${f(size)}" fill="#EFE3CB"/><g fill="${P.wood}">${sq}</g>${pieces}</g>`;
}

export function domino(s, cx, cy, w, { angle = 0, a = 3, b = 5 } = {}) {
  const h = w * 2;
  const dots = (n, oy) => {
    const map = {
      0: [], 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
      5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
    }[n];
    return map.map(([x, y]) => `<circle cx="${f(x * w * 0.25)}" cy="${f(oy + y * w * 0.25)}" r="${f(w * 0.075)}" fill="#2A2622"/>`).join('');
  };
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(w * 0.14)}" fill="${s.linear([[0, '#FFFCF4'], [1, '#E7DCC6']], { x1: 0, y1: 0, x2: 1, y2: 1 })}" filter="url(#${s.shadow(6)})"/>
<rect x="${f(-w * 0.34)}" y="-1" width="${f(w * 0.68)}" height="2" fill="#2A2622" opacity="0.6"/>${dots(a, -h / 4)}${dots(b, h / 4)}</g>`;
}

/** Pieza de rompecabezas con encastres. */
export function puzzlePiece(s, cx, cy, size, { angle = 0, color = P.sage, tabs = [1, -1, 1, -1], e = 5 } = {}) {
  const u = size;
  const side = (t) => {
    if (t === 0) return [[1, 0]];
    const k = 0.22 * t;
    return [
      ['C', 0.35, 0, 0.42, 0, 0.4, -k * 0.35],
      ['C', 0.32, -k * 1.25, 0.68, -k * 1.25, 0.6, -k * 0.35],
      ['C', 0.58, 0, 0.65, 0, 1, 0],
    ];
  };
  const pts = [];
  const dirs = [
    [1, 0, 0, 1],
    [0, 1, -1, 0],
    [-1, 0, 0, -1],
    [0, -1, 1, 0],
  ];
  let ox = -u / 2;
  let oy = -u / 2;
  let d = `M${f(ox)},${f(oy)}`;
  dirs.forEach(([dx, dy, nx, ny], i) => {
    const segs = side(tabs[i]);
    for (const sgm of segs) {
      if (sgm.length === 2) {
        d += ` L${f(ox + dx * u)},${f(oy + dy * u)}`;
      } else {
        const [, x1, y1, x2, y2, x3, y3] = sgm;
        const tp = (px, py) => `${f(ox + dx * px * u + nx * py * u)},${f(oy + dy * px * u + ny * py * u)}`;
        d += ` C${tp(x1, y1)} ${tp(x2, y2)} ${tp(x3, y3)}`;
      }
    }
    ox += dx * u;
    oy += dy * u;
  });
  d += 'Z';
  pts.length = 0;
  const g = s.linear([[0, lighten(color, 0.2)], [1, darken(color, 0.12)]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><path d="${d}" fill="${g}" filter="url(#${s.shadow(e)})"/><path d="${d}" fill="none" stroke="#fff" stroke-width="2" opacity="0.28" transform="translate(-1.5 -1.5)"/></g>`;
}

export function yarn(s, cx, cy, r, { color = P.clay, e = 16 } = {}) {
  const g = s.radial([[0, lighten(color, 0.3)], [0.7, color], [1, darken(color, 0.3)]], { cx: 0.38, cy: 0.34, r: 0.72 });
  let wraps = '';
  for (let i = 0; i < 16; i++) {
    const a = s.r(0, 180);
    const rx = r * s.r(0.55, 0.98);
    wraps += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(rx * s.r(0.25, 0.55))}" transform="rotate(${f(a)} ${f(cx)} ${f(cy)})"/>`;
  }
  const clip = s.id('cy');
  s.def(`<clipPath id="${clip}"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/></clipPath>`);
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${g}" filter="url(#${s.shadow(e)})"/>
<g clip-path="url(#${clip})" fill="none" stroke="${darken(color, 0.25)}" stroke-width="${f(r * 0.035)}" opacity="0.45">${wraps}</g>
<g clip-path="url(#${clip})" fill="none" stroke="${lighten(color, 0.35)}" stroke-width="${f(r * 0.02)}" opacity="0.4" transform="translate(-2 -2)">${wraps}</g>
<path d="M${f(cx + r * 0.7)},${f(cy + r * 0.7)} C${f(cx + r * 1.4)},${f(cy + r * 1.1)} ${f(cx + r * 0.6)},${f(cy + r * 1.8)} ${f(cx + r * 1.6)},${f(cy + r * 2.1)}" fill="none" stroke="${color}" stroke-width="${f(r * 0.05)}" stroke-linecap="round" filter="url(#${s.shadow(3)})"/>`;
}

export function needle(s, x, y, len, { angle = 0, color = P.woodLight } = {}) {
  const w = len * 0.022;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" filter="url(#${s.shadow(6)})"><rect x="0" y="${f(-w / 2)}" width="${f(len)}" height="${f(w)}" rx="${f(w / 2)}" fill="${color}"/><circle cx="${f(len)}" cy="0" r="${f(w * 1.8)}" fill="${darken(color, 0.3)}"/></g>`;
}

export function plantTop(s, cx, cy, r, { pot = P.clay, leaf = '#5E7F4C', kind = 'rosette', e = 16 } = {}) {
  const potG = s.radial([[0, lighten(pot, 0.2)], [0.75, pot], [1, darken(pot, 0.25)]], { cx: 0.4, cy: 0.36, r: 0.72 });
  let out = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${potG}" filter="url(#${s.shadow(e)})"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.84)}" fill="#4A3A2A"/>`;
  const n = kind === 'fern' ? 22 : kind === 'round' ? 16 : 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360 + s.r(-8, 8);
    const len = r * (kind === 'fern' ? s.r(1.1, 1.5) : kind === 'round' ? s.r(0.55, 0.8) : s.r(0.9, 1.25));
    const wid = kind === 'fern' ? len * 0.12 : kind === 'round' ? len * 0.45 : len * 0.22;
    const c = mix(leaf, i % 3 === 0 ? '#8FAE6E' : darken(leaf, 0.15), s.r(0, 0.6));
    out += `<path d="${leafD(len, wid, kind === 'round' ? 0.5 : 0.62)}" fill="${c}" transform="translate(${f(cx)} ${f(cy)}) rotate(${f(a)})" filter="url(#${s.shadow(4, 0.7)})"/>`;
    out += `<path d="M0,0 L${f(len * 0.9)},0" stroke="${lighten(c, 0.25)}" stroke-width="1.2" opacity="0.5" transform="translate(${f(cx)} ${f(cy)}) rotate(${f(a)})"/>`;
  }
  return out;
}

export function flower(s, cx, cy, r, { petal = '#F3E9DA', center = '#E0B04A', petals = 9, e = 4 } = {}) {
  let out = '';
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * 360;
    out += `<ellipse cx="${f(r * 0.55)}" cy="0" rx="${f(r * 0.5)}" ry="${f(r * 0.2)}" fill="${petal}" transform="translate(${f(cx)} ${f(cy)}) rotate(${f(a)})"/>`;
  }
  return `<g filter="url(#${s.shadow(e, 0.6)})">${out}<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.24)}" fill="${center}"/></g>`;
}

export function cake(s, cx, cy, r) {
  let out = plate(s, cx, cy, r * 1.22, { e: 8 });
  const top = s.radial([[0, '#FFFBF4'], [0.8, '#F6EBDB'], [1, '#E3D2B8']], { cx: 0.42, cy: 0.38, r: 0.7 });
  out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${top}" filter="url(#${s.shadow(18)})"/>`;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    out += `<circle cx="${f(cx + Math.cos(a) * r * 0.9)}" cy="${f(cy + Math.sin(a) * r * 0.9)}" r="${f(r * 0.065)}" fill="#FFF8EE" filter="url(#${s.shadow(2, 0.6)})"/>`;
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const bx = cx + Math.cos(a) * r * 0.62;
    const by = cy + Math.sin(a) * r * 0.62;
    out += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r * 0.07)}" fill="${i % 2 ? '#B3312E' : '#3E3A6E'}" filter="url(#${s.shadow(3)})"/><circle cx="${f(bx - r * 0.02)}" cy="${f(by - r * 0.02)}" r="${f(r * 0.02)}" fill="#fff" opacity="0.6"/>`;
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - 0.4;
    const bx = cx + Math.cos(a) * r * 0.3;
    const by = cy + Math.sin(a) * r * 0.3;
    out += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r * 0.05)}" fill="${['#D98B6A', '#9DB4A0', '#E8C36A', '#C4845C', '#A9B8A3'][i]}" filter="url(#${s.shadow(10)})"/>
<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r * 0.14)}" fill="#FFD68A" opacity="0.35" filter="url(#${s.blur(r * 0.06)})"/>
<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r * 0.03)}" fill="#FFF2C8"/>`;
  }
  return out;
}

export function confetti(s, x, y, w, h, n = 40) {
  let out = '';
  const colors = [P.clay, P.sage, P.gold, P.sageDeep, '#D98B6A', '#E8C36A'];
  for (let i = 0; i < n; i++) {
    const px = x + s.r(0, w);
    const py = y + s.r(0, h);
    out += `<rect x="${f(px)}" y="${f(py)}" width="${f(s.r(8, 16))}" height="${f(s.r(3, 6))}" rx="1.5" fill="${s.pick(colors)}" transform="rotate(${f(s.r(0, 180))} ${f(px)} ${f(py)})" filter="url(#${s.shadow(2, 0.6)})"/>`;
  }
  return out;
}

export function cookie(s, cx, cy, r, { color = '#D9AE72', e = 5 } = {}) {
  const g = s.radial([[0, lighten(color, 0.25)], [0.7, color], [1, darken(color, 0.2)]], { cx: 0.4, cy: 0.35 });
  let dots = '';
  for (let i = 0; i < 6; i++) {
    const a = s.r(0, Math.PI * 2);
    const d = s.r(0, r * 0.6);
    dots += `<circle cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d)}" r="${f(r * 0.06)}" fill="${darken(color, 0.3)}" opacity="0.6"/>`;
  }
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${g}" filter="url(#${s.shadow(e)})"/>${dots}`;
}

export function vinyl(s, cx, cy, r) {
  let grooves = '';
  for (let i = 0; i < 26; i++) grooves += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * (0.4 + i * 0.022))}" fill="none" stroke="${i % 2 ? '#3a3632' : '#1b1917'}" stroke-width="${f(r * 0.012)}"/>`;
  const sheen = s.linear([[0, '#fff', 0], [0.45, '#fff', 0.14], [0.5, '#fff', 0], [0.55, '#fff', 0.1], [1, '#fff', 0]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="#1E1C1A" filter="url(#${s.shadow(6)})"/>${grooves}
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${sheen}"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.33)}" fill="${P.clay}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.3)}" fill="none" stroke="#F3E2CC" stroke-width="1.5" opacity="0.6"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.03)}" fill="#EEE6D8"/>`;
}

export function sheetMusic(s, cx, cy, w, { angle = 0 } = {}) {
  const h = w * 1.35;
  let staff = '';
  for (let k = 0; k < 6; k++) {
    const sy = -h / 2 + h * 0.12 + k * h * 0.14;
    for (let l = 0; l < 5; l++) staff += `<rect x="${f(-w * 0.42)}" y="${f(sy + l * h * 0.014)}" width="${f(w * 0.84)}" height="1" fill="#6b6255" opacity="0.6"/>`;
    for (let n = 0; n < 7; n++) {
      const nx = -w * 0.36 + n * w * 0.11 + s.r(-4, 4);
      const ny = sy + s.pick([0, 1, 2, 3, 4]) * h * 0.007;
      staff += `<ellipse cx="${f(nx)}" cy="${f(ny + h * 0.02)}" rx="${f(w * 0.014)}" ry="${f(w * 0.01)}" fill="#3a332b" transform="rotate(-20 ${f(nx)} ${f(ny + h * 0.02)})"/><rect x="${f(nx + w * 0.012)}" y="${f(ny - h * 0.02)}" width="1.2" height="${f(h * 0.04)}" fill="#3a332b"/>`;
    }
  }
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" fill="#FBF7EE" filter="url(#${s.shadow(3)})"/>${staff}</g>`;
}

export function watercolorPalette(s, cx, cy, w, { angle = 0 } = {}) {
  const h = w * 0.42;
  const colors = ['#C4845C', '#E3B55E', '#A9B8A3', '#5D7663', '#7F9CB0', '#B86A7E', '#8E6A48', '#2D4A42'];
  let wells = '';
  colors.forEach((c, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = -w / 2 + w * 0.06 + col * w * 0.23;
    const y = -h / 2 + h * 0.1 + row * h * 0.44;
    wells += `<rect x="${f(x)}" y="${f(y)}" width="${f(w * 0.19)}" height="${f(h * 0.36)}" rx="4" fill="#F2EEE6" stroke="#DDD5C6"/><ellipse cx="${f(x + w * 0.095)}" cy="${f(y + h * 0.18)}" rx="${f(w * 0.07)}" ry="${f(h * 0.12)}" fill="${c}" opacity="0.9"/>`;
  });
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="8" fill="#FFFFFF" filter="url(#${s.shadow(6)})"/>${wells}</g>`;
}

export function brush(s, x, y, len, { angle = 0, handle = P.green } = {}) {
  const w = len * 0.035;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" filter="url(#${s.shadow(5)})">
<rect x="0" y="${f(-w / 2)}" width="${f(len * 0.68)}" height="${f(w)}" rx="${f(w / 2)}" fill="${handle}"/>
<rect x="${f(len * 0.66)}" y="${f(-w * 0.55)}" width="${f(len * 0.13)}" height="${f(w * 1.1)}" fill="#C9C4BA"/>
<path d="M${f(len * 0.79)},${f(-w * 0.55)} Q${f(len * 0.95)},${f(-w * 0.5)} ${f(len)},0 Q${f(len * 0.95)},${f(w * 0.5)} ${f(len * 0.79)},${f(w * 0.55)}Z" fill="#3A2C22"/></g>`;
}

export function paintingPaper(s, cx, cy, w, { angle = 0 } = {}) {
  const h = w * 0.75;
  const blobs = [
    [-0.2, -0.15, 0.35, '#A9C1D0'],
    [0.2, -0.2, 0.3, '#BCD0DA'],
    [-0.25, 0.18, 0.28, '#9DB08A'],
    [0.05, 0.22, 0.3, '#86A077'],
    [0.28, 0.15, 0.2, '#C4845C'],
  ];
  const b = s.blur(w * 0.018);
  const clip = s.id('cp');
  s.def(`<clipPath id="${clip}"><rect x="${f(-w * 0.44)}" y="${f(-h * 0.42)}" width="${f(w * 0.88)}" height="${f(h * 0.84)}"/></clipPath>`);
  const paint = blobs
    .map(([bx, by, br, c]) => `<ellipse cx="${f(bx * w)}" cy="${f(by * h)}" rx="${f(br * w)}" ry="${f(br * h * 0.7)}" fill="${c}" opacity="0.55" filter="url(#${b})"/>`)
    .join('');
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" fill="#FDFBF6" filter="url(#${s.shadow(3)})"/><g clip-path="url(#${clip})">${paint}</g></g>`;
}

export function crossword(s, cx, cy, w, { angle = 0 } = {}) {
  const h = w * 1.3;
  const n = 9;
  const cell = (w * 0.62) / n;
  let grid = '';
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const black = (i * 7 + j * 3) % 5 === 0 || (i === 4 && j % 3 === 1);
      grid += `<rect x="${f(-w * 0.31 + i * cell)}" y="${f(-h * 0.4 + j * cell)}" width="${f(cell)}" height="${f(cell)}" fill="${black ? '#2A2622' : '#FFFDF8'}" stroke="#6a6154" stroke-width="0.8"/>`;
    }
  let lines = '';
  for (let k = 0; k < 9; k++) lines += `<rect x="${f(-w * 0.4)}" y="${f(h * 0.1 + k * h * 0.035)}" width="${f(w * s.r(0.5, 0.78))}" height="${f(h * 0.012)}" fill="#8F8573" opacity="0.6"/>`;
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" fill="#F4EFE4" filter="url(#${s.shadow(3)})"/>${grid}${lines}</g>`;
}

export function pencil(s, x, y, len, { angle = 0, color = P.sageDeep } = {}) {
  const w = len * 0.06;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" filter="url(#${s.shadow(5)})">
<rect x="0" y="${f(-w / 2)}" width="${f(len * 0.8)}" height="${f(w)}" fill="${color}"/><rect x="0" y="${f(-w / 2)}" width="${f(len * 0.8)}" height="${f(w * 0.3)}" fill="#fff" opacity="0.2"/>
<rect x="${f(-len * 0.06)}" y="${f(-w / 2)}" width="${f(len * 0.07)}" height="${f(w)}" fill="#D9B2A2"/>
<path d="M${f(len * 0.8)},${f(-w / 2)} L${f(len)},0 L${f(len * 0.8)},${f(w / 2)}Z" fill="#E8CFA8"/><path d="M${f(len * 0.93)},${f(-w * 0.15)} L${f(len)},0 L${f(len * 0.93)},${f(w * 0.15)}Z" fill="#3a332b"/></g>`;
}

export function ball(s, cx, cy, r, { color = P.clay, e = 18 } = {}) {
  const g = s.radial([[0, lighten(color, 0.45)], [0.55, color], [1, darken(color, 0.35)]], { cx: 0.35, cy: 0.3, r: 0.75 });
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${g}" filter="url(#${s.shadow(e)})"/>
<path d="M${f(cx - r * 0.95)},${f(cy - r * 0.2)} C${f(cx - r * 0.3)},${f(cy + r * 0.3)} ${f(cx + r * 0.3)},${f(cy + r * 0.3)} ${f(cx + r * 0.95)},${f(cy - r * 0.2)}" fill="none" stroke="${darken(color, 0.2)}" stroke-width="${f(r * 0.04)}" opacity="0.5"/>`;
}

export function band(s, d, { color = P.sageDeep, width = 22 } = {}) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" filter="url(#${s.shadow(4)})"/><path d="${d}" fill="none" stroke="#fff" stroke-width="${width * 0.2}" stroke-linecap="round" opacity="0.18" transform="translate(-2 -3)"/>`;
}

export function towel(s, x, y, w, h, { color = P.sand, angle = 0 } = {}) {
  const g = s.linear([[0, lighten(color, 0.15)], [1, darken(color, 0.08)]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  const tex = s.noise({ fx: 0.5, octaves: 2, color: darken(color, 0.5), alpha: 0.16, seed: 51 });
  const clip = s.id('ct');
  s.def(`<clipPath id="${clip}"><rect x="0" y="0" width="${f(w)}" height="${f(h)}" rx="10"/></clipPath>`);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})"><rect x="0" y="0" width="${f(w)}" height="${f(h)}" rx="10" fill="${g}" filter="url(#${s.shadow(8)})"/><rect width="${f(w)}" height="${f(h)}" clip-path="url(#${clip})" filter="url(#${tex})"/>
<rect x="0" y="${f(h * 0.8)}" width="${f(w)}" height="${f(h * 0.06)}" fill="${darken(color, 0.12)}" opacity="0.5"/><rect x="0" y="${f(h * 0.45)}" width="${f(w)}" height="${f(h * 0.05)}" fill="#000" opacity="0.06"/></g>`;
}

export function teapot(s, cx, cy, r) {
  const g = s.radial([[0, '#FFFFFF'], [0.7, '#EDE8DD'], [1, '#CFC6B5']], { cx: 0.38, cy: 0.34, r: 0.72 });
  return `<g filter="url(#${s.shadow(22)})"><path d="M${f(cx + r * 0.85)},${f(cy - r * 0.15)} C${f(cx + r * 1.4)},${f(cy - r * 0.3)} ${f(cx + r * 1.5)},${f(cy - r * 0.55)} ${f(cx + r * 1.62)},${f(cy - r * 0.75)} L${f(cx + r * 1.72)},${f(cy - r * 0.66)} C${f(cx + r * 1.55)},${f(cy - r * 0.2)} ${f(cx + r * 1.3)},${f(cy + r * 0.1)} ${f(cx + r * 0.85)},${f(cy + r * 0.2)}Z" fill="#E6DFD2"/>
<path d="M${f(cx - r * 0.9)},${f(cy - r * 0.35)} C${f(cx - r * 1.5)},${f(cy - r * 0.4)} ${f(cx - r * 1.5)},${f(cy + r * 0.45)} ${f(cx - r * 0.9)},${f(cy + r * 0.35)}" fill="none" stroke="#E6DFD2" stroke-width="${f(r * 0.14)}" stroke-linecap="round"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${g}"/></g>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.55)}" fill="none" stroke="#D4CBBA" stroke-width="2"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.14)}" fill="${P.sage}" filter="url(#${s.shadow(4)})"/>`;
}

/* ---------------------------------------------------------------- Escenas frontales (interiores) */

/** Piso de madera en perspectiva simple (franja inferior). */
export function floor(s, y, { color = P.wood, h } = {}) {
  const H = h ?? s.h - y;
  const g = s.linear([[0, darken(color, 0.12)], [0.2, color], [1, lighten(color, 0.08)]]);
  const grain = s.noise({ fx: 0.004, fy: 0.25, octaves: 2, color: darken(color, 0.5), alpha: 0.12, seed: 61 });
  let seams = '';
  for (let i = 0; i < 9; i++) {
    const x0 = (i / 8) * s.w;
    seams += `<line x1="${f(x0)}" y1="${f(y)}" x2="${f(s.w / 2 + (x0 - s.w / 2) * 2.2)}" y2="${f(y + H)}" stroke="${darken(color, 0.3)}" stroke-width="1.5" opacity="0.28"/>`;
  }
  return `<rect x="0" y="${f(y)}" width="${s.w}" height="${f(H)}" fill="${g}"/><rect x="0" y="${f(y)}" width="${s.w}" height="${f(H)}" filter="url(#${grain})"/>${seams}
<rect x="0" y="${f(y - 14)}" width="${s.w}" height="14" fill="${lighten(P.cream, 0.2)}"/><rect x="0" y="${f(y - 2)}" width="${s.w}" height="3" fill="${P.shadow}" opacity="0.15"/>
<rect x="0" y="${f(y)}" width="${s.w}" height="${f(H * 0.18)}" fill="${s.linear([[0, P.shadow, 0.22], [1, P.shadow, 0]])}"/>`;
}

/** Sillón tapizado visto de frente. */
export function armchair(s, cx, baseY, w, { color = P.sage, legs = P.woodDark } = {}) {
  const h = w * 0.95;
  const top = baseY - h;
  const fab = s.linear([[0, lighten(color, 0.16)], [0.6, color], [1, darken(color, 0.18)]], { x1: 0, y1: 0, x2: 0.3, y2: 1 });
  const fabSide = s.linear([[0, darken(color, 0.1)], [1, darken(color, 0.28)]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  const cush = s.linear([[0, lighten(color, 0.24)], [1, darken(color, 0.08)]]);
  const tex = s.noise({ fx: 0.45, octaves: 2, color: darken(color, 0.6), alpha: 0.1, seed: 71 });
  const clip = s.id('ca');
  const shape = `<path d="M${f(cx - w * 0.38)},${f(top + h * 0.08)} Q${f(cx - w * 0.38)},${f(top)} ${f(cx - w * 0.26)},${f(top)} L${f(cx + w * 0.26)},${f(top)} Q${f(cx + w * 0.38)},${f(top)} ${f(cx + w * 0.38)},${f(top + h * 0.08)} L${f(cx + w * 0.38)},${f(top + h * 0.5)} L${f(cx - w * 0.38)},${f(top + h * 0.5)}Z"/>
<rect x="${f(cx - w * 0.5)}" y="${f(top + h * 0.38)}" width="${f(w * 0.2)}" height="${f(h * 0.5)}" rx="${f(w * 0.08)}"/>
<rect x="${f(cx + w * 0.3)}" y="${f(top + h * 0.38)}" width="${f(w * 0.2)}" height="${f(h * 0.5)}" rx="${f(w * 0.08)}"/>
<rect x="${f(cx - w * 0.36)}" y="${f(top + h * 0.56)}" width="${f(w * 0.72)}" height="${f(h * 0.32)}" rx="${f(w * 0.04)}"/>`;
  s.def(`<clipPath id="${clip}">${shape}</clipPath>`);
  return `<ellipse cx="${f(cx + w * 0.06)}" cy="${f(baseY + 6)}" rx="${f(w * 0.62)}" ry="${f(w * 0.05)}" fill="${P.shadow}" opacity="0.35" filter="url(#${s.blur(12)})"/>
<rect x="${f(cx - w * 0.42)}" y="${f(baseY - h * 0.14)}" width="${f(w * 0.035)}" height="${f(h * 0.14)}" fill="${legs}"/><rect x="${f(cx + w * 0.385)}" y="${f(baseY - h * 0.14)}" width="${f(w * 0.035)}" height="${f(h * 0.14)}" fill="${legs}"/>
<g fill="${fab}">${shape}</g>
<rect x="${f(cx - w * 0.5)}" y="${f(top + h * 0.38)}" width="${f(w * 0.2)}" height="${f(h * 0.5)}" rx="${f(w * 0.08)}" fill="${fabSide}" opacity="0.45"/>
<rect x="${f(cx - w * 0.32)}" y="${f(top + h * 0.5)}" width="${f(w * 0.64)}" height="${f(h * 0.16)}" rx="${f(w * 0.06)}" fill="${cush}"/>
<rect x="${f(cx - w * 0.6)}" y="${f(top - 10)}" width="${f(w * 1.2)}" height="${f(h + 20)}" clip-path="url(#${clip})" filter="url(#${tex})"/>
<rect x="${f(cx - w * 0.36)}" y="${f(top + h * 0.72)}" width="${f(w * 0.72)}" height="${f(h * 0.16)}" fill="${P.shadow}" opacity="0.12"/>`;
}

export function sideTable(s, cx, baseY, w, { color = P.woodDark } = {}) {
  const h = w * 1.05;
  const g = s.linear([[0, lighten(color, 0.2)], [1, darken(color, 0.15)]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  return `<ellipse cx="${f(cx + 10)}" cy="${f(baseY + 4)}" rx="${f(w * 0.6)}" ry="${f(w * 0.06)}" fill="${P.shadow}" opacity="0.3" filter="url(#${s.blur(10)})"/>
<rect x="${f(cx - w * 0.04)}" y="${f(baseY - h)}" width="${f(w * 0.08)}" height="${f(h)}" fill="${g}"/><rect x="${f(cx - w * 0.25)}" y="${f(baseY - 8)}" width="${f(w * 0.5)}" height="8" rx="4" fill="${g}"/>
<rect x="${f(cx - w / 2)}" y="${f(baseY - h - 12)}" width="${f(w)}" height="14" rx="6" fill="${g}"/>`;
}

export function lamp(s, cx, baseY, h, { shade = '#F3EBDD', base = P.clay, on = false } = {}) {
  const sw = h * 0.62;
  const shadeTop = baseY - h;
  const baseG = s.radial([[0, lighten(base, 0.3)], [0.7, base], [1, darken(base, 0.3)]], { cx: 0.35, cy: 0.35 });
  const shadeG = on
    ? s.linear([[0, '#FFE9B8'], [1, '#F6C77E']])
    : s.linear([[0, lighten(shade, 0.2)], [1, darken(shade, 0.08)]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  let glow = '';
  if (on) {
    glow = `<circle cx="${f(cx)}" cy="${f(shadeTop + h * 0.28)}" r="${f(h * 1.6)}" fill="${s.radial([[0, '#F9CF86', 0.55], [0.4, '#E9A95A', 0.2], [1, '#E9A95A', 0]])}"/>`;
  }
  return `${glow}<ellipse cx="${f(cx + 6)}" cy="${f(baseY + 2)}" rx="${f(h * 0.2)}" ry="${f(h * 0.03)}" fill="${P.shadow}" opacity="0.3" filter="url(#${s.blur(5)})"/>
<path d="M${f(cx - h * 0.14)},${f(baseY)} Q${f(cx - h * 0.2)},${f(baseY - h * 0.3)} ${f(cx - h * 0.04)},${f(baseY - h * 0.45)} L${f(cx + h * 0.04)},${f(baseY - h * 0.45)} Q${f(cx + h * 0.2)},${f(baseY - h * 0.3)} ${f(cx + h * 0.14)},${f(baseY)}Z" fill="${baseG}"/>
<path d="M${f(cx - sw * 0.3)},${f(shadeTop)} L${f(cx + sw * 0.3)},${f(shadeTop)} L${f(cx + sw / 2)},${f(shadeTop + h * 0.5)} L${f(cx - sw / 2)},${f(shadeTop + h * 0.5)}Z" fill="${shadeG}"/>`;
}

export function monstera(s, x, y, size, { angle = 0, color = '#4F6F45' } = {}) {
  let out = '';
  for (let i = 0; i < 5; i++) {
    const a = angle - 70 + i * 32 + s.r(-8, 8);
    const len = size * s.r(0.75, 1.05);
    const c = mix(color, '#7E9A63', s.r(0, 0.5));
    out += `<path d="M0,0 C${f(len * 0.2)},${f(-len * 0.02)} ${f(len * 0.5)},0 ${f(len * 0.62)},0" stroke="${darken(c, 0.2)}" stroke-width="4" fill="none" transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"/>`;
    out += `<path d="M${f(len * 0.55)},0 C${f(len * 0.6)},${f(-len * 0.34)} ${f(len * 1.05)},${f(-len * 0.3)} ${f(len * 1.1)},0 C${f(len * 1.05)},${f(len * 0.3)} ${f(len * 0.6)},${f(len * 0.34)} ${f(len * 0.55)},0Z" fill="${c}" transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"/>`;
    out += `<path d="M${f(len * 0.57)},0 L${f(len * 1.05)},0" stroke="${lighten(c, 0.25)}" stroke-width="2" transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"/>`;
  }
  return out;
}

export function potFront(s, cx, baseY, w, { color = P.clay } = {}) {
  const h = w * 0.9;
  const g = s.linear([[0, lighten(color, 0.18)], [0.5, color], [1, darken(color, 0.25)]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  return `<ellipse cx="${f(cx + 8)}" cy="${f(baseY + 3)}" rx="${f(w * 0.6)}" ry="${f(w * 0.07)}" fill="${P.shadow}" opacity="0.3" filter="url(#${s.blur(8)})"/>
<path d="M${f(cx - w / 2)},${f(baseY - h)} L${f(cx + w / 2)},${f(baseY - h)} L${f(cx + w * 0.38)},${f(baseY)} L${f(cx - w * 0.38)},${f(baseY)}Z" fill="${g}"/><rect x="${f(cx - w * 0.54)}" y="${f(baseY - h)}" width="${f(w * 1.08)}" height="${f(h * 0.14)}" rx="3" fill="${g}"/>`;
}

export function frame(s, x, y, w, h, { art = 'hills' } = {}) {
  const inner = art === 'hills'
    ? `<rect x="${f(x + w * 0.1)}" y="${f(y + h * 0.1)}" width="${f(w * 0.8)}" height="${f(h * 0.8)}" fill="#EFE7D8"/><path d="M${f(x + w * 0.1)},${f(y + h * 0.65)} Q${f(x + w * 0.35)},${f(y + h * 0.4)} ${f(x + w * 0.55)},${f(y + h * 0.6)} T${f(x + w * 0.9)},${f(y + h * 0.5)} L${f(x + w * 0.9)},${f(y + h * 0.9)} L${f(x + w * 0.1)},${f(y + h * 0.9)}Z" fill="${P.sage}" opacity="0.8"/><circle cx="${f(x + w * 0.66)}" cy="${f(y + h * 0.32)}" r="${f(w * 0.07)}" fill="${P.clay}" opacity="0.7"/>`
    : `<rect x="${f(x + w * 0.1)}" y="${f(y + h * 0.1)}" width="${f(w * 0.8)}" height="${f(h * 0.8)}" fill="#F2ECE1"/><circle cx="${f(x + w * 0.5)}" cy="${f(y + h * 0.5)}" r="${f(w * 0.22)}" fill="${P.sand}"/>`;
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${P.woodLight}" filter="url(#${s.shadow(6, 0.7)})"/>${inner}`;
}

/* ---------------------------------------------------------------- Objetos para el equipo (naturalezas muertas por área) */

export function notebook(s, cx, cy, w, { angle = 0, color = P.green, e = 6 } = {}) {
  const h = w * 1.35;
  const g = s.linear([[0, lighten(color, 0.15)], [1, darken(color, 0.12)]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})">
<rect x="${f(-w / 2 + 6)}" y="${f(-h / 2 + 6)}" width="${f(w)}" height="${f(h)}" rx="${f(w * 0.05)}" fill="#F3EDE2" filter="url(#${s.shadow(e)})"/>
<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(w * 0.05)}" fill="${g}"/>
<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w * 0.06)}" height="${f(h)}" fill="#000" opacity="0.12"/>
<rect x="${f(w * 0.3)}" y="${f(-h / 2)}" width="${f(w * 0.035)}" height="${f(h)}" fill="${darken(color, 0.45)}"/></g>`;
}

export function pen(s, x, y, len, { angle = 0, color = '#2A2622', e = 6 } = {}) {
  const w = len * 0.055;
  const body = s.linear([[0, lighten(color, 0.35)], [0.5, color], [1, darken(color, 0.3)]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" filter="url(#${s.shadow(e)})">
<rect x="0" y="${f(-w / 2)}" width="${f(len * 0.84)}" height="${f(w)}" rx="${f(w / 2)}" fill="${body}"/>
<rect x="${f(len * 0.52)}" y="${f(-w * 0.5)}" width="${f(len * 0.05)}" height="${f(w)}" fill="${P.gold}"/>
<rect x="${f(len * 0.08)}" y="${f(-w * 0.75)}" width="${f(len * 0.38)}" height="${f(w * 0.22)}" rx="${f(w * 0.1)}" fill="${P.gold}"/>
<path d="M${f(len * 0.84)},${f(-w * 0.45)} L${f(len)},0 L${f(len * 0.84)},${f(w * 0.45)}Z" fill="#C9C4BA"/></g>`;
}

export function stethoscope(s, cx, cy, size, { angle = 0, tube = P.greenDeep } = {}) {
  const u = size;
  const metal = s.linear([[0, '#F2EFE9'], [0.5, '#A9A49A'], [1, '#E6E2DA']], { x1: 0, y1: 0, x2: 1, y2: 1 });
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})" filter="url(#${s.shadow(6)})">
<path d="M${f(-u * 0.35)},${f(-u * 0.55)} Q${f(-u * 0.3)},${f(-u * 0.1)} 0,${f(-u * 0.02)} Q${f(u * 0.3)},${f(-u * 0.1)} ${f(u * 0.35)},${f(-u * 0.55)}" fill="none" stroke="${metal}" stroke-width="${f(u * 0.035)}" stroke-linecap="round"/>
<circle cx="${f(-u * 0.35)}" cy="${f(-u * 0.57)}" r="${f(u * 0.04)}" fill="#3a332b"/><circle cx="${f(u * 0.35)}" cy="${f(-u * 0.57)}" r="${f(u * 0.04)}" fill="#3a332b"/>
<path d="M0,${f(-u * 0.02)} C0,${f(u * 0.3)} ${f(u * 0.5)},${f(u * 0.2)} ${f(u * 0.55)},${f(u * 0.45)} S${f(u * 0.3)},${f(u * 0.8)} ${f(u * 0.05)},${f(u * 0.72)}" fill="none" stroke="${tube}" stroke-width="${f(u * 0.06)}" stroke-linecap="round"/>
<circle cx="${f(-u * 0.02)}" cy="${f(u * 0.72)}" r="${f(u * 0.13)}" fill="${metal}"/><circle cx="${f(-u * 0.02)}" cy="${f(u * 0.72)}" r="${f(u * 0.09)}" fill="#F7F5F0"/></g>`;
}

export function woodenSpoon(s, x, y, len, { angle = 0 } = {}) {
  const g = s.linear([[0, P.woodLight], [1, P.wood]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" fill="${g}" filter="url(#${s.shadow(6)})">
<rect x="0" y="${f(-len * 0.025)}" width="${f(len * 0.72)}" height="${f(len * 0.05)}" rx="${f(len * 0.025)}"/>
<ellipse cx="${f(len * 0.84)}" cy="0" rx="${f(len * 0.16)}" ry="${f(len * 0.1)}"/></g>`;
}

export function board(s, cx, cy, w, { angle = 0 } = {}) {
  const h = w * 0.62;
  const g = s.linear([[0, lighten(P.wood, 0.2)], [1, darken(P.wood, 0.05)]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  const grain = s.noise({ fx: 0.004, fy: 0.12, octaves: 3, color: darken(P.wood, 0.5), alpha: 0.14, seed: 161 });
  const clip = s.id('cb');
  s.def(`<clipPath id="${clip}"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h * 0.12)}"/></clipPath>`);
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h * 0.12)}" fill="${g}" filter="url(#${s.shadow(8)})"/>
<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" clip-path="url(#${clip})" filter="url(#${grain})"/>
<circle cx="${f(w * 0.4)}" cy="0" r="${f(h * 0.07)}" fill="#EEE6D8" stroke="${darken(P.wood, 0.2)}" stroke-width="2"/></g>`;
}

export function herbs(s, cx, cy, size, { angle = 0 } = {}) {
  const fl = foliage(s, { x: cx, y: cy, angle: (angle * Math.PI) / 180, branches: 3, spread: 0.6, length: size, leafLen: size * 0.22, leafWid: size * 0.09, density: 9, droop: 0.2 });
  return `<g filter="url(#${s.shadow(4, 0.7)})"><g fill="none" stroke="#56733F" stroke-width="3">${fl.stems}</g><g fill="#6E8F4E">${fl.leaves}</g></g>`;
}

export function wrench(s, x, y, len, { angle = 0 } = {}) {
  const m = s.linear([[0, '#F2EFE9'], [0.5, '#9E998F'], [1, '#D9D5CD']], { x1: 0, y1: 0, x2: 0, y2: 1 });
  const hw = len * 0.065;
  const R = hw * 1.35;
  // Llave combinada: estrella/anillo a la izquierda, boca abierta a la derecha.
  const ring = `M${f(-R)},0 A${f(R)},${f(R)} 0 1 0 ${f(R)},0 A${f(R)},${f(R)} 0 1 0 ${f(-R)},0Z M${f(-R * 0.55)},0 A${f(R * 0.55)},${f(R * 0.55)} 0 1 1 ${f(R * 0.55)},0 A${f(R * 0.55)},${f(R * 0.55)} 0 1 1 ${f(-R * 0.55)},0Z`;
  const L = len;
  const jaw = `M${f(L - R * 0.2)},${f(-R * 1.1)} C${f(L + R * 0.9)},${f(-R * 1.2)} ${f(L + R * 1.5)},${f(-R * 0.4)} ${f(L + R * 1.35)},${f(-R * 0.42)} L${f(L + R * 0.35)},${f(-R * 0.42)} L${f(L + R * 0.35)},${f(R * 0.42)} L${f(L + R * 1.35)},${f(R * 0.42)} C${f(L + R * 1.5)},${f(R * 0.4)} ${f(L + R * 0.9)},${f(R * 1.2)} ${f(L - R * 0.2)},${f(R * 1.1)}Z`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" filter="url(#${s.shadow(6)})" fill="${m}">
<path d="${ring}" fill-rule="evenodd"/>
<path d="M${f(R * 0.8)},${f(-hw / 2)} L${f(L - R * 0.5)},${f(-hw / 2)} L${f(L - R * 0.5)},${f(hw / 2)} L${f(R * 0.8)},${f(hw / 2)}Z"/>
<path d="${jaw}"/></g>`;
}

export function screwdriver(s, x, y, len, { angle = 0, color = P.clay } = {}) {
  const w = len * 0.1;
  const h = s.linear([[0, lighten(color, 0.3)], [0.5, color], [1, darken(color, 0.3)]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})" filter="url(#${s.shadow(6)})">
<rect x="0" y="${f(-w / 2)}" width="${f(len * 0.42)}" height="${f(w)}" rx="${f(w * 0.35)}" fill="${h}"/>
<rect x="${f(len * 0.42)}" y="${f(-w * 0.14)}" width="${f(len * 0.5)}" height="${f(w * 0.28)}" fill="#BDB8AF"/>
<rect x="${f(len * 0.92)}" y="${f(-w * 0.2)}" width="${f(len * 0.08)}" height="${f(w * 0.4)}" rx="2" fill="#8E8A82"/></g>`;
}

export function tape(s, cx, cy, r) {
  const g = s.radial([[0, lighten(P.sageDeep, 0.3)], [1, darken(P.sageDeep, 0.2)]], { cx: 0.4, cy: 0.35 });
  let ticks = '';
  for (let i = 0; i < 24; i++) ticks += `<rect x="${f(cx + r * 0.9 + i * 14)}" y="${f(cy + r * 0.55)}" width="1.5" height="${i % 5 ? 8 : 14}" fill="#3a332b"/>`;
  return `<rect x="${f(cx + r * 0.6)}" y="${f(cy + r * 0.52)}" width="${f(r * 3.6)}" height="${f(r * 0.3)}" fill="#F1D48A" filter="url(#${s.shadow(3)})"/>${ticks}
<rect x="${f(cx - r)}" y="${f(cy - r)}" width="${f(r * 2)}" height="${f(r * 2)}" rx="${f(r * 0.35)}" fill="${g}" filter="url(#${s.shadow(12)})"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.42)}" fill="#E9E4DA"/>`;
}

export function agenda(s, cx, cy, w, { angle = 0 } = {}) {
  const h = w * 0.75;
  let cells = '';
  for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) cells += `<rect x="${f(-w * 0.44 + i * w * 0.126)}" y="${f(-h * 0.22 + j * h * 0.13)}" width="${f(w * 0.115)}" height="${f(h * 0.115)}" fill="${(i + j * 7) % 9 === 3 ? P.sageLight : '#FFFDF8'}" stroke="#D8CFBF" stroke-width="1"/>`;
  let rings = '';
  for (let i = 0; i < 12; i++) rings += `<rect x="${f(-w * 0.43 + i * w * 0.078)}" y="${f(-h / 2 - 10)}" width="7" height="22" rx="3.5" fill="#8E8A82"/>`;
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${angle})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="6" fill="#FBF8F2" filter="url(#${s.shadow(5)})"/>
<rect x="${f(-w * 0.44)}" y="${f(-h * 0.38)}" width="${f(w * 0.4)}" height="${f(h * 0.08)}" rx="3" fill="${P.clay}" opacity="0.85"/>${cells}${rings}</g>`;
}

export function knitSwatch(s, x, y, w, h, { color = P.sageLight, angle = 0 } = {}) {
  const pid = s.id('kn');
  s.def(`<pattern id="${pid}" width="18" height="16" patternUnits="userSpaceOnUse"><rect width="18" height="16" fill="${color}"/><path d="M1 1 L9 14 M17 1 L9 14" stroke="${darken(color, 0.18)}" stroke-width="3.5" stroke-linecap="round"/><path d="M1 1 L9 14 M17 1 L9 14" stroke="${lighten(color, 0.25)}" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/></pattern>`);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angle})"><rect x="0" y="0" width="${f(w)}" height="${f(h)}" rx="10" fill="url(#${pid})" filter="url(#${s.shadow(4)})"/></g>`;
}
