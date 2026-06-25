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

    // --- LUZ = VIDA (la antorcha) ---
    this.torch = 65;         // 0..100, tu llama. Si llega a 0, te apagás.
    this.torchMax = 100;
    this.drainRate = 0.9;    // luz/seg que se consume solo por existir
    this.dead = false;
    this.hurtFlash = 0;      // feedback visual al recibir daño
    this.flicker = 0;        // parpadeo de la llama (estético)

    // --- Espada ---
    this.aimAngle = 0;       // hacia dónde apuntás (radianes), lo setea el game
    this.attackCd = 0;       // cooldown entre golpes
    this.swingTimer = 0;     // >0 mientras se anima el golpe
    this.swingDur = 0.18;
    this.swingAngle = 0;     // ángulo del golpe en curso
    this.swordRange = 62;
    this.swordArc = 1.7;     // ancho del arco (radianes)
    this.swordDamage = 6;
  }

  // Intenta dar un golpe. Devuelve true si efectivamente swingó (cooldown listo).
  attack() {
    if (this.attackCd > 0 || this.dead) return false;
    this.attackCd = 0.32;
    this.swingTimer = this.swingDur;
    this.swingAngle = this.aimAngle;
    return true;
  }

  // Radio de luz actual: cuanta menos antorcha, más se cierra el mundo.
  get lightRadius() {
    const t = this.torch / this.torchMax;
    // 90 px casi a oscuras, hasta ~340 px con la llama llena.
    const base = 90 + t * 250;
    // Parpadeo sutil para que la llama "respire".
    return base + Math.sin(this.flicker) * 6;
  }

  refuel(amount) {
    this.torch = Math.min(this.torchMax, this.torch + amount);
  }

  // Recibir daño = perder luz.
  damage(amount) {
    this.torch -= amount;
    this.hurtFlash = 1;
    if (this.torch <= 0) {
      this.torch = 0;
      this.dead = true;
    }
  }

  update(dt, dungeon) {
    // La llama se consume siempre.
    this.torch = Math.max(0, this.torch - this.drainRate * dt);
    if (this.torch <= 0) this.dead = true;
    this.flicker += dt * 9;
    if (this.hurtFlash > 0) this.hurtFlash = Math.max(0, this.hurtFlash - dt * 3);
    if (this.attackCd > 0) this.attackCd -= dt;
    if (this.swingTimer > 0) this.swingTimer -= dt;
    // La dirección de mirada sigue al apuntado.
    this.facing = Math.cos(this.aimAngle) >= 0 ? 1 : -1;

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
