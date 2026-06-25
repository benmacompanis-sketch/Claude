// input.js — estado de teclado simple y centralizado.
const Input = (() => {
  const keys = {};

  const map = {
    ArrowUp: "up", KeyW: "up",
    ArrowDown: "down", KeyS: "down",
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
  };

  window.addEventListener("keydown", (e) => {
    const action = map[e.code];
    if (action) {
      keys[action] = true;
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    const action = map[e.code];
    if (action) {
      keys[action] = false;
      e.preventDefault();
    }
  });

  // Vector de movimiento normalizado segun las teclas apretadas.
  function moveVector() {
    let x = 0, y = 0;
    if (keys.left) x -= 1;
    if (keys.right) x += 1;
    if (keys.up) y -= 1;
    if (keys.down) y += 1;
    // Normalizar para que la diagonal no sea mas rapida.
    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.sqrt(2);
      x *= inv;
      y *= inv;
    }
    return { x, y };
  }

  return { keys, moveVector };
})();
