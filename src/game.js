// game.js — punto de entrada y loop principal.
(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  let camera, dungeon, player, renderer;
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

  // Genera un nivel nuevo, conservando la antorcha del jugador entre niveles.
  function buildLevel(keepTorch) {
    dungeon = new Dungeon(30, 22, depth);
    const spawn = dungeon.spawnPoint;
    const torch = keepTorch != null ? keepTorch : 65;
    player = new Player(spawn.x, spawn.y);
    player.torch = torch;
    if (!camera) camera = new Camera(width, height);
    camera.x = player.x - width / 2;
    camera.y = player.y - height / 2;
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
    if (player.dead) return; // congelado en la pantalla de "te apagaste"

    player.update(dt, dungeon);
    camera.follow(player, dt, dungeon.widthPx, dungeon.heightPx);

    // Recoger braseros por proximidad (recarga tu llama).
    for (const b of dungeon.braziers) {
      if (b.taken || b.donated) continue;
      if (Math.hypot(player.x - b.x, player.y - b.y) < 34) {
        b.taken = true;
        player.refuel(40);
        camera.addShake(0.2);
      }
    }

    // Llegar a la escalera = bajar un nivel (más profundo y oscuro).
    if (dungeon.isStairsAtPx(player.x, player.y)) {
      depth++;
      buildLevel(player.torch);
    }
  }

  function render() {
    renderer.clear(width, height);
    renderer.drawDungeon(dungeon, camera);
    renderer.drawBraziers(dungeon, camera, time);
    renderer.drawPlayer(player, camera);
    renderer.drawLighting(player, camera, dungeon, width, height);
    renderer.drawHUD(player, depth, width, height);
    if (player.dead) renderer.drawDeath(width, height);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (e) => {
    if (player && player.dead && (e.code === "Enter" || e.code === "Space")) {
      restart();
    }
  });

  init();
  requestAnimationFrame(frame);
})();
