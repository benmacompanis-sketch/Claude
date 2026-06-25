// renderer.js — todo el dibujado. Acá vive gran parte del "game feel".
class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clear(w, h) {
    this.ctx.fillStyle = "#05050a";
    this.ctx.fillRect(0, 0, w, h);
  }

  // Dibuja solo los tiles visibles (culling por cámara).
  drawDungeon(dungeon, cam) {
    const ctx = this.ctx;
    const ox = cam.offsetX;
    const oy = cam.offsetY;

    const startC = Math.max(0, Math.floor(ox / TILE));
    const startR = Math.max(0, Math.floor(oy / TILE));
    const endC = Math.min(dungeon.cols, Math.ceil((ox + cam.viewW) / TILE));
    const endR = Math.min(dungeon.rows, Math.ceil((oy + cam.viewH) / TILE));

    for (let r = startR; r < endR; r++) {
      for (let c = startC; c < endC; c++) {
        const t = dungeon.grid[r][c];
        const sx = Math.round(c * TILE - ox);
        const sy = Math.round(r * TILE - oy);

        if (t === Tiles.FLOOR) {
          this._drawFloor(sx, sy, dungeon.noise[r][c]);
        } else if (t === Tiles.WALL) {
          this._drawWall(sx, sy, dungeon, c, r, ox, oy);
        }
      }
    }
  }

  _drawFloor(sx, sy, n) {
    const ctx = this.ctx;
    // Color base con leve variación por tile.
    const shade = 26 + Math.floor(n * 10);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade + 8})`;
    ctx.fillRect(sx, sy, TILE, TILE);
    // Líneas de grilla sutiles.
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(sx + 0.5, sy + 0.5, TILE, TILE);
  }

  _drawWall(sx, sy, dungeon, c, r, ox, oy) {
    const ctx = this.ctx;
    // Cuerpo de la pared.
    ctx.fillStyle = "#23232f";
    ctx.fillRect(sx, sy, TILE, TILE);

    // "Cara" iluminada arriba si el tile de abajo es piso (efecto 3D barato).
    const below = dungeon.tileAt(c, r + 1);
    if (below === Tiles.FLOOR) {
      const faceH = 12;
      ctx.fillStyle = "#34344a";
      ctx.fillRect(sx, sy + TILE - faceH, TILE, faceH);
      // Sombra proyectada sobre el piso de abajo.
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(sx, sy + TILE, TILE, 8);
    }

    // Borde superior con highlight.
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(sx, sy, TILE, 3);
  }

  drawPlayer(player, cam) {
    const ctx = this.ctx;
    const px = Math.round(player.x - cam.offsetX);
    const py = Math.round(player.y - cam.offsetY);
    const bob = Math.sin(player.bob) * 2;

    // Sombra suave en el piso.
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(px, py + player.radius - 2, player.radius * 0.9, player.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo con gradiente (volumen).
    const grad = ctx.createRadialGradient(
      px - 5, py - 6 + bob, 4,
      px, py + bob, player.radius
    );
    grad.addColorStop(0, "#7ad7ff");
    grad.addColorStop(1, "#2a7fb8");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py + bob, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Contorno.
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // "Ojo" / indicador de hacia dónde mira.
    ctx.fillStyle = "#0a0a14";
    ctx.beginPath();
    ctx.arc(px + player.facing * 5, py - 2 + bob, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Capa de atmósfera: luz alrededor del jugador + viñeta en los bordes.
  drawLighting(player, cam, w, h) {
    const ctx = this.ctx;
    const px = player.x - cam.offsetX;
    const py = player.y - cam.offsetY;

    // Oscurecer la escena y "abrir" un círculo de luz sobre el jugador.
    ctx.save();
    const light = ctx.createRadialGradient(px, py, 40, px, py, 320);
    light.addColorStop(0, "rgba(0,0,0,0)");
    light.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, w, h);

    // Viñeta de los bordes de la pantalla.
    const vig = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.35,
      w / 2, h / 2, Math.max(w, h) * 0.75
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
