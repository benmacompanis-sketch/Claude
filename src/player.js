// player.js — jugador con movimiento basado en aceleración (se siente "con peso").
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 16;        // radio de colisión
    this.vx = 0;
    this.vy = 0;
    this.maxSpeed = 230;     // px/seg
    this.accel = 2200;       // qué tan rápido alcanza la velocidad
    this.friction = 1800;    // qué tan rápido frena al soltar
    this.facing = 1;         // 1 derecha, -1 izquierda (para futura animación)
    // "bob": leve balanceo al caminar, puro game feel.
    this.bob = 0;
  }

  update(dt, dungeon) {
    const dir = Input.moveVector();

    // Aceleración hacia la dirección pedida.
    if (dir.x !== 0 || dir.y !== 0) {
      this.vx += dir.x * this.accel * dt;
      this.vy += dir.y * this.accel * dt;
      if (dir.x !== 0) this.facing = dir.x > 0 ? 1 : -1;
    } else {
      // Fricción: frena de a poco cuando no hay input.
      this.vx = approach(this.vx, 0, this.friction * dt);
      this.vy = approach(this.vy, 0, this.friction * dt);
    }

    // Limitar la velocidad máxima.
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      const s = this.maxSpeed / speed;
      this.vx *= s;
      this.vy *= s;
    }

    // Mover con colisión por eje (permite "deslizar" contra paredes).
    this._moveAxis(dungeon, this.vx * dt, 0);
    this._moveAxis(dungeon, 0, this.vy * dt);

    // Balanceo al caminar.
    if (speed > 10) this.bob += dt * speed * 0.05;
  }

  _moveAxis(dungeon, dx, dy) {
    const nx = this.x + dx;
    const ny = this.y + dy;
    const r = this.radius;

    // Chequear las 4 esquinas del "hitbox" circular aproximado.
    const points = [
      [nx - r, ny - r], [nx + r, ny - r],
      [nx - r, ny + r], [nx + r, ny + r],
    ];

    let blocked = false;
    for (const [px, py] of points) {
      if (dungeon.isSolidAtPx(px, py)) { blocked = true; break; }
    }

    if (!blocked) {
      this.x = nx;
      this.y = ny;
    } else {
      // Choque: matar la velocidad en ese eje.
      if (dx !== 0) this.vx = 0;
      if (dy !== 0) this.vy = 0;
    }
  }
}

// Mueve `value` hacia `target` sin pasarse, en pasos de `maxDelta`.
function approach(value, target, maxDelta) {
  if (value < target) return Math.min(value + maxDelta, target);
  if (value > target) return Math.max(value - maxDelta, target);
  return value;
}
