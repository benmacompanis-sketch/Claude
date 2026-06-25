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
        } else if (t === Tiles.STAIRS) {
          this._drawFloor(sx, sy, dungeon.noise[r][c]);
          this._drawStairs(sx, sy);
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

  _drawStairs(sx, sy) {
    const ctx = this.ctx;
    // Escalera descendente: peldaños cada vez más oscuros (sensación de abismo).
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const inset = (TILE / 2) * t;
      const v = Math.floor(20 * (1 - t));
      ctx.fillStyle = `rgb(${v},${v},${v + 4})`;
      ctx.fillRect(sx + inset, sy + inset, TILE - inset * 2, TILE - inset * 2);
    }
    // Glow tenue para que se note en la oscuridad.
    ctx.fillStyle = "rgba(120,160,255,0.06)";
    ctx.fillRect(sx, sy, TILE, TILE);
  }

  // Braseros: fuente de luz/recarga. Cambian según estado.
  drawBraziers(dungeon, cam, time) {
    const ctx = this.ctx;
    for (const b of dungeon.braziers) {
      if (b.taken || b.donated) continue;
      const bx = Math.round(b.x - cam.offsetX);
      const by = Math.round(b.y - cam.offsetY);

      // Halo de luz cálida.
      const flick = 1 + Math.sin(time * 0.012 + bx) * 0.08;
      const glow = ctx.createRadialGradient(bx, by, 2, bx, by, 70 * flick);
      glow.addColorStop(0, "rgba(255,170,70,0.55)");
      glow.addColorStop(1, "rgba(255,140,40,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(bx - 80, by - 80, 160, 160);

      // Pie del brasero.
      ctx.fillStyle = "#2a2218";
      ctx.fillRect(bx - 6, by + 2, 12, 12);
      // Llama.
      ctx.fillStyle = "#ffb84d";
      ctx.beginPath();
      ctx.ellipse(bx, by - 2, 6, 11 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff1c2";
      ctx.beginPath();
      ctx.ellipse(bx, by, 3, 6 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
    }
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

  // Medidor de llama + profundidad actual.
  drawHUD(player, depth, w, h) {
    const ctx = this.ctx;
    const x = 20, y = h - 44, bw = 240, bh = 16;

    // Marco.
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(x - 2, y - 2, bw + 4, bh + 4);

    // Relleno con color que vira de cálido (lleno) a rojo (peligro).
    const t = player.torch / player.torchMax;
    const danger = t < 0.25;
    const r = danger ? 200 : Math.floor(255);
    const g = Math.floor(120 + t * 100);
    const b = Math.floor(40 + t * 30);
    // Parpadeo de alarma cuando queda poca luz.
    let alpha = 1;
    if (danger) alpha = 0.55 + Math.abs(Math.sin(player.flicker * 1.5)) * 0.45;
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.fillRect(x, y, bw * t, bh);

    // Etiquetas.
    ctx.fillStyle = "rgba(220,220,240,0.8)";
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText("LLAMA", x, y - 8);
    ctx.textAlign = "right";
    ctx.fillText(`PROFUNDIDAD ${depth}`, w - 20, y + bh);
    ctx.textAlign = "left";
  }

  drawDeath(w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center";
    ctx.fillStyle = "#d8d8e8";
    ctx.font = "32px 'Courier New', monospace";
    ctx.fillText("TE APAGASTE", w / 2, h / 2 - 10);
    ctx.font = "15px 'Courier New', monospace";
    ctx.fillStyle = "rgba(200,200,220,0.6)";
    ctx.fillText("La oscuridad te reclama.  [Enter] para volver a bajar", w / 2, h / 2 + 26);
    ctx.textAlign = "left";
  }

  // Capa de atmósfera: la luz de tu antorcha + el calor de los braseros + viñeta.
  // La oscuridad se construye en un canvas aparte y se "perfora" donde hay luz.
  drawLighting(player, cam, dungeon, w, h) {
    const ctx = this.ctx;
    const px = player.x - cam.offsetX;
    const py = player.y - cam.offsetY;
    const radius = player.lightRadius;

    ctx.save();
    // Sombra casi total; los gradientes la "abren".
    const light = ctx.createRadialGradient(px, py, radius * 0.25, px, py, radius);
    light.addColorStop(0, "rgba(0,0,0,0)");
    light.addColorStop(0.7, "rgba(0,0,0,0.55)");
    light.addColorStop(1, "rgba(2,2,8,0.93)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, w, h);

    // Los braseros también iluminan: restamos oscuridad alrededor de ellos.
    ctx.globalCompositeOperation = "destination-out";
    for (const b of dungeon.braziers) {
      if (b.taken || b.donated) continue;
      const bx = b.x - cam.offsetX;
      const by = b.y - cam.offsetY;
      const bg = ctx.createRadialGradient(bx, by, 8, bx, by, 95);
      bg.addColorStop(0, "rgba(0,0,0,0.85)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(bx - 100, by - 100, 200, 200);
    }
    ctx.globalCompositeOperation = "source-over";

    // Tinte rojo si te acaban de golpear (perdés luz).
    if (player.hurtFlash > 0) {
      ctx.fillStyle = `rgba(150,20,20,${player.hurtFlash * 0.25})`;
      ctx.fillRect(0, 0, w, h);
    }

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
