// game.js — punto de entrada y loop principal.
(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  let camera, dungeon, player, renderer, particles;
  let enemies = [];
  let memory = null; // { text, timer } — recuerdo revelado al vencer una Sombra
  let width = 0, height = 0;
  let depth = 1;
  let time = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (camera) camera.resize(width, height);
  }

  function buildLevel(keepTorch) {
    dungeon = new Dungeon(30, 22, depth);
    const spawn = dungeon.spawnPoint;
    const torch = keepTorch != null ? keepTorch : 65;
    player = new Player(spawn.x, spawn.y);
    player.torch = torch;
    if (!camera) camera = new Camera(width, height);
    camera.x = player.x - width / 2;
    camera.y = player.y - height / 2;
    particles = new Particles();
    memory = null;
    spawnEnemies();
  }

  // Coloca Sombras en las salas (menos la del spawn). Más cantidad cuanto más hondo.
  function spawnEnemies() {
    enemies = [];
    const perLevel = 2 + depth;
    for (let i = 1; i < dungeon.rooms.length; i++) {
      const r = dungeon.rooms[i];
      const n = Math.random() < 0.7 ? randInt(1, 2) : 0;
      for (let k = 0; k < n && enemies.length < perLevel; k++) {
        const ex = (r.x + 1 + Math.random() * (r.w - 2)) * TILE;
        const ey = (r.y + 1 + Math.random() * (r.h - 2)) * TILE;
        enemies.push(new Shadow(ex, ey));
      }
    }
  }

  function init() {
    resize();
    renderer = new Renderer(ctx);
    buildLevel();
  }

  function restart() {
    depth = 1;
    buildLevel(65);
  }

  let last = performance.now();
  function frame(now) {
    let dt = (now - last) / 1000;
    if (dt > 0.05) dt = 0.05;
    last = now;
    time = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  function update(dt) {
    if (player.dead) return;

    // Apuntado: ángulo del jugador hacia el mouse (en coords de mundo).
    const mWorldX = Input.mouse.x + camera.offsetX;
    const mWorldY = Input.mouse.y + camera.offsetY;
    player.aimAngle = Math.atan2(mWorldY - player.y, mWorldX - player.x);

    player.update(dt, dungeon);

    // Golpe de espada.
    if (Input.consumeAttack() && player.attack()) {
      camera.addShake(0.25);
      doSwordHit();
    }

    // Enemigos.
    for (const e of enemies) e.update(dt, player, dungeon, particles);
    // Limpiar muertos y revelar su recuerdo.
    for (let i = enemies.length - 1; i >= 0; i--) {
      if (enemies[i].dead) {
        const e = enemies[i];
        particles.emit(e.x, e.y, { count: 22, color: "170,120,210", speed: 160, life: 0.7 });
        camera.addShake(0.3);
        memory = { text: e.memory, timer: 4.5 };
        enemies.splice(i, 1);
      }
    }

    particles.update(dt);
    if (memory) { memory.timer -= dt; if (memory.timer <= 0) memory = null; }

    camera.follow(player, dt, dungeon.widthPx, dungeon.heightPx);

    // Braseros: recarga por proximidad.
    for (const b of dungeon.braziers) {
      if (b.taken || b.donated) continue;
      if (Math.hypot(player.x - b.x, player.y - b.y) < 34) {
        b.taken = true;
        player.refuel(40);
        camera.addShake(0.2);
        particles.emit(b.x, b.y, { count: 18, color: "255,180,80", speed: 130, life: 0.7 });
      }
    }

    // Escalera: bajar de nivel.
    if (dungeon.isStairsAtPx(player.x, player.y)) {
      depth++;
      buildLevel(player.torch);
    }
  }

  // Detección del golpe: Sombras dentro del rango y del arco de la espada.
  function doSwordHit() {
    for (const e of enemies) {
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > player.swordRange + e.radius) continue;
      let diff = Math.abs(angleDiff(Math.atan2(dy, dx), player.swingAngle));
      if (diff <= player.swordArc / 2) {
        const a = Math.atan2(dy, dx);
        e.hit(player.swordDamage, Math.cos(a) * 26, Math.sin(a) * 26, particles);
      }
    }
  }

  function render() {
    renderer.clear(width, height);
    renderer.drawDungeon(dungeon, camera);
    renderer.drawBraziers(dungeon, camera, time);
    renderer.drawEnemies(enemies, camera);
    renderer.drawPlayer(player, camera);
    renderer.drawSword(player, camera);
    particles.draw(ctx, camera);
    renderer.drawLighting(player, camera, dungeon, width, height);
    renderer.drawHUD(player, depth, width, height);
    if (memory) renderer.drawMemory(memory, width, height);
    if (player.dead) renderer.drawDeath(width, height);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (e) => {
    if (player && player.dead && (e.code === "Enter" || e.code === "Space")) restart();
  });

  init();
  requestAnimationFrame(frame);
})();

// Diferencia angular más corta entre dos ángulos (-PI..PI).
function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
