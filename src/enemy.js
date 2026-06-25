// enemy.js — las Sombras: Portadores caídos que acechan en la oscuridad.
// Comportamiento atado a la luz: huyen y se queman dentro de tu llama,
// se envalentonan cuando tu luz se debilita.

// Fragmentos de recuerdo que se revelan al vencer una Sombra (el lore jugable).
const MEMORIES = [
  "“Bajé por mi hija. No recuerdo su cara.”",
  "“La llama alcanzaba. Lo juro. Alcanzaba.”",
  "“No mires atrás. Lo de atrás ya no existe.”",
  "“Fui el primero en reír aquí abajo. Y el último.”",
  "“Guardé luz para el final. El final nunca llegó.”",
  "“Tenía un nombre. Empezaba con… empezaba con…”",
  "“El Corazón late. Lo escuché. Sigue latiendo.”",
  "“Di mi luz a un desconocido. Volvería a hacerlo.”",
];

class Shadow {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.hp = 10;
    this.maxHp = 10;
    this.speed = 95;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.exposure = 0;     // 0..1: qué tan revelada está por la luz (estética)
    this.attackCd = 0;     // cooldown de ataque
    this.hurtFlash = 0;
    this.wobble = Math.random() * Math.PI * 2;
    this.memory = MEMORIES[Math.floor(Math.random() * MEMORIES.length)];
  }

  update(dt, player, dungeon, particles) {
    if (this.dead) return;
    this.wobble += dt * 4;
    if (this.attackCd > 0) this.attackCd -= dt;
    if (this.hurtFlash > 0) this.hurtFlash = Math.max(0, this.hurtFlash - dt * 4);

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist, ny = dy / dist;

    // ¿Está dentro de la luz del jugador?
    const lightR = player.lightRadius;
    const inLight = dist < lightR;
    // Cuánto la "muerde" la luz: más fuerte cuanto más cerca del centro.
    const lightBite = inLight ? Math.max(0, 1 - dist / lightR) : 0;
    this.exposure += ((inLight ? Math.min(1, lightBite * 1.6) : 0) - this.exposure) * Math.min(1, dt * 6);

    // La luz la daña de forma continua (tu luz ES un arma).
    if (lightBite > 0.15) {
      this.hp -= lightBite * 7 * dt;
      if (Math.random() < lightBite * dt * 12) {
        particles.emit(this.x, this.y, { count: 1, color: "120,90,150", speed: 30, life: 0.4, size: 2 });
      }
    }

    // Decisión de movimiento:
    let mx = 0, my = 0;
    if (lightBite > 0.45) {
      // Muy expuesta: huye de la luz.
      mx = -nx; my = -ny;
    } else {
      // En penumbra: acecha y se acerca, con un leve zigzag.
      const wob = 0.5;
      mx = nx + Math.cos(this.wobble) * wob;
      my = ny + Math.sin(this.wobble) * wob;
    }
    const ml = Math.hypot(mx, my) || 1;
    mx /= ml; my /= ml;

    // Las sombras se mueven más rápido cuando tu llama está baja (te envalentonás
    // vos, te envalentonan ellas).
    const boldness = 1 + (1 - player.torch / player.torchMax) * 0.6;
    this.vx = mx * this.speed * boldness;
    this.vy = my * this.speed * boldness;

    this._moveAxis(dungeon, this.vx * dt, 0);
    this._moveAxis(dungeon, 0, this.vy * dt);

    // Atacar al jugador si está pegada y el cooldown lo permite.
    if (dist < this.radius + player.radius + 4 && this.attackCd <= 0) {
      player.damage(9);
      this.attackCd = 1.1;
      // Knockback al jugador.
      player.vx += nx * 180;
      player.vy += ny * 180;
      particles.emit(player.x, player.y, { count: 10, color: "150,30,30", speed: 140, life: 0.4 });
    }

    if (this.hp <= 0) this.dead = true;
  }

  // Recibe daño de la espada (golpe fuerte y puntual).
  hit(amount, knockX, knockY, particles) {
    this.hp -= amount;
    this.hurtFlash = 1;
    this.x += knockX;
    this.y += knockY;
    particles.emit(this.x, this.y, { count: 8, color: "180,120,200", speed: 120, life: 0.5 });
    if (this.hp <= 0) this.dead = true;
  }

  _moveAxis(dungeon, dx, dy) {
    const nx = this.x + dx;
    const ny = this.y + dy;
    const r = this.radius * 0.7;
    if (!dungeon.isSolidAtPx(nx - r, ny) && !dungeon.isSolidAtPx(nx + r, ny) &&
        !dungeon.isSolidAtPx(nx, ny - r) && !dungeon.isSolidAtPx(nx, ny + r)) {
      this.x = nx; this.y = ny;
    }
  }
}
