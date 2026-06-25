// particles.js — sistema de partículas simple para brasas, golpes y muerte de sombras.
class Particles {
  constructor() {
    this.list = [];
  }

  emit(x, y, opts = {}) {
    const count = opts.count || 8;
    const speed = opts.speed || 90;
    const life = opts.life || 0.6;
    const color = opts.color || "255,170,70";
    const size = opts.size || 3;
    const spread = opts.spread != null ? opts.spread : Math.PI * 2;
    const dir = opts.dir != null ? opts.dir : 0;
    const gravity = opts.gravity || 0;

    for (let i = 0; i < count; i++) {
      const a = dir + (Math.random() - 0.5) * spread;
      const s = speed * (0.4 + Math.random() * 0.6);
      this.list.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: life * (0.6 + Math.random() * 0.4),
        maxLife: life,
        color,
        size: size * (0.6 + Math.random() * 0.6),
        gravity,
      });
    }
  }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt;
      if (p.life <= 0) { this.list.splice(i, 1); continue; }
      p.vx *= 0.92;
      p.vy = p.vy * 0.92 + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  draw(ctx, cam) {
    for (const p of this.list) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = `rgba(${p.color},${a})`;
      const s = p.size * a;
      ctx.fillRect(
        Math.round(p.x - cam.offsetX - s / 2),
        Math.round(p.y - cam.offsetY - s / 2),
        s, s
      );
    }
  }
}
