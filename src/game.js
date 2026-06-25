// game.js — punto de entrada y loop principal.
(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  let camera, dungeon, player, renderer;
  let width = 0, height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (camera) camera.resize(width, height);
  }

  function init() {
    resize();
    dungeon = new Dungeon(26, 18);
    const spawn = dungeon.spawnPoint;
    player = new Player(spawn.x, spawn.y);
    camera = new Camera(width, height);
    // Centrar la cámara de entrada sin animación.
    camera.x = player.x - width / 2;
    camera.y = player.y - height / 2;
    renderer = new Renderer(ctx);
  }

  let last = performance.now();
  function frame(now) {
    // dt en segundos, con tope para evitar saltos si la pestaña se congela.
    let dt = (now - last) / 1000;
    if (dt > 0.05) dt = 0.05;
    last = now;

    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  function update(dt) {
    player.update(dt, dungeon);
    camera.follow(player, dt, dungeon.widthPx, dungeon.heightPx);
  }

  function render() {
    renderer.clear(width, height);
    renderer.drawDungeon(dungeon, camera);
    renderer.drawPlayer(player, camera);
    renderer.drawLighting(player, camera, width, height);
  }

  window.addEventListener("resize", resize);

  init();
  requestAnimationFrame(frame);
})();
