// renderer.js — todo el dibujado. Acá vive gran parte del "game feel".
class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    // Buffer emisivo para el bloom (se dibuja desenfocado y se compone aditivo).
    this.glow = document.createElement("canvas");
    this.gctx = this.glow.getContext("2d");
    this.titleEmbers = []; // brasas que flotan en la pantalla de título
  }

  resize(w, h) {
    // El bloom se renderiza a media resolución: más barato y más "suave".
    this.glow.width = Math.max(1, Math.floor(w / 2));
    this.glow.height = Math.max(1, Math.floor(h / 2));
  }

  // Pantalla de título: una ESCENA, no un slide de texto.
  // El Portador encapuchado sostiene su antorcha en la oscuridad; la llama
  // es la única fuente de luz e ilumina el título por encima.
  drawTitle(time, w, h) {
    const ctx = this.ctx;
    const t = time / 1000;
    const cx = w / 2;
    const flick = 0.82 + Math.sin(t * 7) * 0.06 + Math.sin(t * 17) * 0.04 + Math.sin(t * 31) * 0.02;

    // --- Fondo: profundidad de un pozo, no un degradé plano ---
    ctx.fillStyle = "#04040a";
    ctx.fillRect(0, 0, w, h);
    // Pilares lejanos apenas insinuados a los lados (encuadre).
    ctx.fillStyle = "rgba(10,10,18,0.9)";
    ctx.fillRect(0, 0, w * 0.13, h);
    ctx.fillRect(w * 0.87, 0, w * 0.13, h);

    // Posición de la antorcha (la fuente de luz de toda la escena).
    const baseY = h * 0.84;
    const torchX = cx + 30;
    const torchY = baseY - 168;

    // --- Charco de luz cálida en el piso de piedra ---
    const pool = ctx.createRadialGradient(cx, baseY + 6, 10, cx, baseY + 6, 280);
    pool.addColorStop(0, `rgba(120,70,30,${0.5 * flick})`);
    pool.addColorStop(1, "rgba(120,70,30,0)");
    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 10, 300, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grandes lajas de piedra sugeridas con líneas tenues bajo la luz.
    ctx.strokeStyle = "rgba(180,120,70,0.06)";
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 70, baseY - 10);
      ctx.lineTo(cx + i * 130, baseY + 70);
      ctx.stroke();
    }

    // --- Resplandor de la antorcha (motiva la luz del título) ---
    const glow = ctx.createRadialGradient(torchX, torchY, 8, torchX, torchY, 520);
    glow.addColorStop(0, `rgba(255,180,80,${0.32 * flick})`);
    glow.addColorStop(0.5, `rgba(255,150,60,${0.10 * flick})`);
    glow.addColorStop(1, "rgba(255,150,60,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Sombra larga del Portador, proyectada lejos de la llama (hacia abajo-izq).
    ctx.save();
    ctx.translate(cx - 8, baseY + 4);
    ctx.rotate(0.5);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(0, 80, 34, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- El Portador (silueta con borde cálido) ---
    this._drawHooded(cx, baseY, torchX, torchY, flick, t);

    // --- Brasas que ascienden desde la llama y el piso ---
    if (this.titleEmbers.length < 50 && Math.random() < 0.5) {
      const fromFlame = Math.random() < 0.5;
      this.titleEmbers.push({
        x: fromFlame ? torchX + (Math.random() - 0.5) * 12 : Math.random() * w,
        y: fromFlame ? torchY : h + 10,
        vy: 16 + Math.random() * 30,
        r: 0.8 + Math.random() * 1.8,
        life: 1,
        seed: Math.random() * 100,
      });
    }
    for (let i = this.titleEmbers.length - 1; i >= 0; i--) {
      const e = this.titleEmbers[i];
      e.y -= e.vy * 0.016;
      e.x += Math.sin(t * 1.3 + e.seed) * 0.5;
      e.life -= 0.0026;
      if (e.life <= 0 || e.y < -10) { this.titleEmbers.splice(i, 1); continue; }
      const a = e.life * (0.4 + Math.abs(Math.sin(t * 3 + e.seed)) * 0.6);
      ctx.fillStyle = `rgba(255,${160 + Math.floor(e.seed) % 60},70,${a})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Título tratado como logo (grabado + espaciado + ornamento) ---
    const cyTitle = h * 0.30;
    ctx.save();
    ctx.textAlign = "center";
    if ("letterSpacing" in ctx) ctx.letterSpacing = "10px";
    // Sombra grabada (oscura, desplazada hacia abajo).
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.font = "600 58px Georgia, 'Times New Roman', serif";
    ctx.fillText("PORTADOR DE LUZ", cx + 2, cyTitle + 3);
    // Cara cálida con brillo.
    ctx.shadowColor = "rgba(255,150,50,0.7)";
    ctx.shadowBlur = 24 * flick;
    const tg = ctx.createLinearGradient(0, cyTitle - 40, 0, cyTitle + 10);
    tg.addColorStop(0, "#fff1cf");
    tg.addColorStop(1, "#e8a858");
    ctx.fillStyle = tg;
    ctx.fillText("PORTADOR DE LUZ", cx, cyTitle);
    ctx.restore();

    // Ornamento: regla fina con un rombo al centro.
    ctx.save();
    ctx.strokeStyle = "rgba(210,160,90,0.4)";
    ctx.fillStyle = "rgba(230,180,110,0.55)";
    ctx.lineWidth = 1;
    const ry = cyTitle + 30, rw = 150;
    ctx.beginPath(); ctx.moveTo(cx - rw, ry); ctx.lineTo(cx - 14, ry); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 14, ry); ctx.lineTo(cx + rw, ry); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, ry - 5); ctx.lineTo(cx + 5, ry); ctx.lineTo(cx, ry + 5); ctx.lineTo(cx - 5, ry);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // Enganche.
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(210,200,215,0.6)";
    ctx.font = "italic 18px Georgia, serif";
    ctx.fillText("El Sol murió. Alguien tiene que bajar a reencenderlo.", cx, cyTitle + 58);
    ctx.restore();

    // Llamado a la acción pulsante (abajo de todo, discreto).
    const pulse = 0.45 + Math.abs(Math.sin(t * 1.6)) * 0.55;
    ctx.save();
    ctx.textAlign = "center";
    if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";
    ctx.fillStyle = `rgba(255,205,135,${pulse})`;
    ctx.font = "13px 'Courier New', monospace";
    ctx.fillText("CLIC O ENTER PARA DESCENDER", cx, h * 0.93);
    ctx.restore();

    // --- Grano de textura (mata el look digital plano) ---
    this._drawGrain(w, h);

    // Viñeta envolvente.
    const vig = ctx.createRadialGradient(cx, h * 0.55, Math.min(w, h) * 0.25, cx, h * 0.55, Math.max(w, h) * 0.72);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.78)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  // Silueta del Portador encapuchado con antorcha y borde de luz cálido.
  _drawHooded(cx, baseY, torchX, torchY, flick, t) {
    const ctx = this.ctx;
    const sway = Math.sin(t * 1.1) * 1.5;

    ctx.save();
    ctx.translate(sway, 0);

    // Cuerpo/túnica (silueta casi negra).
    ctx.fillStyle = "#070608";
    ctx.beginPath();
    ctx.moveTo(cx - 40, baseY);
    ctx.quadraticCurveTo(cx - 30, baseY - 70, cx - 20, baseY - 112);
    ctx.quadraticCurveTo(cx - 16, baseY - 128, cx, baseY - 132);   // hombro izq -> capucha
    ctx.quadraticCurveTo(cx + 16, baseY - 128, cx + 20, baseY - 112);
    ctx.quadraticCurveTo(cx + 30, baseY - 70, cx + 40, baseY);
    // Dobladillo ondulado.
    ctx.quadraticCurveTo(cx + 20, baseY + 8, cx, baseY + 3);
    ctx.quadraticCurveTo(cx - 20, baseY + 8, cx - 40, baseY);
    ctx.closePath();
    ctx.fill();

    // Capucha (punta hacia adelante).
    ctx.beginPath();
    ctx.moveTo(cx - 18, baseY - 120);
    ctx.quadraticCurveTo(cx, baseY - 150, cx + 16, baseY - 124);
    ctx.quadraticCurveTo(cx + 6, baseY - 110, cx - 18, baseY - 120);
    ctx.closePath();
    ctx.fill();

    // Brazo/manga que sostiene la antorcha (hacia arriba-derecha).
    ctx.lineWidth = 11;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#070608";
    ctx.beginPath();
    ctx.moveTo(cx + 12, baseY - 96);
    ctx.lineTo(torchX - 2, torchY + 22);
    ctx.stroke();

    // Borde de luz cálido en el lado de la llama (rim light = se ve "pro").
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = `rgba(255,170,90,${0.5 * flick})`;
    ctx.beginPath();
    ctx.moveTo(cx + 20, baseY - 112);
    ctx.quadraticCurveTo(cx + 30, baseY - 70, cx + 40, baseY);
    ctx.stroke();
    // Rim en la capucha.
    ctx.beginPath();
    ctx.moveTo(cx + 16, baseY - 124);
    ctx.quadraticCurveTo(cx + 8, baseY - 140, cx, baseY - 148);
    ctx.stroke();

    // Mango de la antorcha.
    ctx.strokeStyle = "#1a120a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(torchX - 4, torchY + 26);
    ctx.lineTo(torchX, torchY + 4);
    ctx.stroke();

    // Llama (capas que parpadean).
    const fh = 14 * flick;
    let fg = ctx.createRadialGradient(torchX, torchY, 1, torchX, torchY, 16);
    fg.addColorStop(0, "rgba(255,245,210,1)");
    fg.addColorStop(0.5, "rgba(255,170,60,0.9)");
    fg.addColorStop(1, "rgba(255,120,30,0)");
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.ellipse(torchX, torchY - 2, 9, fh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,250,230,0.95)";
    ctx.beginPath();
    ctx.ellipse(torchX, torchY, 3.5, fh * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Grano sutil cacheado para romper el plano digital.
  _drawGrain(w, h) {
    const ctx = this.ctx;
    if (!this._grain) {
      const g = document.createElement("canvas");
      g.width = g.height = 128;
      const gc = g.getContext("2d");
      const img = gc.createImageData(128, 128);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 120 + Math.floor(Math.random() * 135);
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      gc.putImageData(img, 0, 0);
      this._grain = g;
    }
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.05;
    const pat = ctx.createPattern(this._grain, "repeat");
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Pinta todas las fuentes de luz en el buffer emisivo y lo compone con "lighter".
  drawBloom(player, dungeon, particles, enemies, cam, w, h) {
    const g = this.gctx;
    const s = 0.5; // escala del buffer
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.glow.width, this.glow.height);
    g.save();
    g.scale(s, s);

    const ox = cam.offsetX, oy = cam.offsetY;

    // Halo cálido del jugador (su llama).
    const px = player.x - ox, py = player.y - oy;
    const r = player.lightRadius * 0.85;
    radial(g, px, py, r, "rgba(255,180,90,0.55)");
    radial(g, px, py, player.radius * 1.6, "rgba(255,240,200,0.9)");

    // Braseros.
    for (const b of dungeon.braziers) {
      if (b.taken || b.donated) continue;
      radial(g, b.x - ox, b.y - oy, 90, "rgba(255,150,50,0.7)");
    }

    // Ojos fríos de las Sombras (acento que contrasta con tu calor).
    for (const e of enemies) {
      radial(g, e.x - ox, e.y - oy, 22 + e.exposure * 20, "rgba(150,180,255,0.5)");
    }

    // Espada.
    if (player.swingTimer > 0) {
      const t = player.swingTimer / player.swingDur;
      const a = player.swingAngle;
      const sx = px + Math.cos(a) * player.swordRange * 0.6;
      const sy = py + Math.sin(a) * player.swordRange * 0.6;
      radial(g, sx, sy, 70 * t, "rgba(255,235,170,0.8)");
    }

    // Partículas brillantes.
    for (const p of particles.list) {
      const a = Math.max(0, p.life / p.maxLife);
      radial(g, p.x - ox, p.y - oy, 10 * a, `rgba(${p.color},${a * 0.5})`);
    }

    g.restore();

    // Componer el buffer (escalado y suavizado por el upscale) en modo aditivo.
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(this.glow, 0, 0, this.glow.width, this.glow.height, 0, 0, w, h);
    // Segunda pasada más amplia para un bloom más jugoso.
    ctx.globalAlpha = 0.5;
    ctx.drawImage(this.glow, 0, 0, this.glow.width, this.glow.height, -8, -8, w + 16, h + 16);
    ctx.restore();
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

    // Cuerpo con gradiente cálido: sos quien lleva el fuego (núcleo blanco-dorado).
    const grad = ctx.createRadialGradient(
      px - 4, py - 6 + bob, 3,
      px, py + bob, player.radius
    );
    grad.addColorStop(0, "#fff3d0");
    grad.addColorStop(0.5, "#ffc24d");
    grad.addColorStop(1, "#c2641a");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py + bob, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Contorno oscuro para recortar la silueta.
    ctx.strokeStyle = "rgba(20,8,0,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // "Ojo" / indicador de hacia dónde mira.
    ctx.fillStyle = "rgba(30,12,0,0.85)";
    ctx.beginPath();
    ctx.arc(px + player.facing * 5, py - 2 + bob, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEnemies(enemies, cam) {
    const ctx = this.ctx;
    for (const e of enemies) {
      const ex = Math.round(e.x - cam.offsetX);
      const ey = Math.round(e.y - cam.offsetY);
      const wob = Math.sin(e.wobble) * 2;

      // Aura de humo: más densa en penumbra, se "quema" bajo la luz (exposure).
      const aura = ctx.createRadialGradient(ex, ey + wob, 2, ex, ey + wob, e.radius + 10);
      aura.addColorStop(0, `rgba(20,10,30,${0.85 - e.exposure * 0.3})`);
      aura.addColorStop(1, "rgba(20,10,30,0)");
      ctx.fillStyle = aura;
      ctx.fillRect(ex - 30, ey - 30, 60, 60);

      // Cuerpo: negro humo que vira a azul espectral frío al ser revelado.
      const reveal = e.exposure;
      const cr = Math.floor(12 + reveal * 80);
      const cg = Math.floor(14 + reveal * 110);
      const cb = Math.floor(28 + reveal * 150);
      ctx.fillStyle = e.hurtFlash > 0.3
        ? "rgba(255,255,255,0.9)"
        : `rgb(${cr},${cg},${cb})`;
      ctx.beginPath();
      ctx.arc(ex, ey + wob, e.radius, 0, Math.PI * 2);
      ctx.fill();

      // Ojos: dos brasas frías que se intensifican al revelarse.
      const eg = 0.4 + reveal * 0.6;
      ctx.fillStyle = `rgba(190,160,255,${eg})`;
      ctx.beginPath();
      ctx.arc(ex - 5, ey - 3 + wob, 2.4, 0, Math.PI * 2);
      ctx.arc(ex + 5, ey - 3 + wob, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Barra de "luz absorbida" (vida) cuando está dañada.
      if (e.hp < e.maxHp) {
        const t = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(ex - 14, ey - e.radius - 9, 28, 4);
        ctx.fillStyle = "rgba(200,170,255,0.9)";
        ctx.fillRect(ex - 14, ey - e.radius - 9, 28 * t, 4);
      }
    }
  }

  // Arco de la espada mientras dura el swing.
  drawSword(player, cam) {
    if (player.swingTimer <= 0) return;
    const ctx = this.ctx;
    const px = player.x - cam.offsetX;
    const py = player.y - cam.offsetY;
    const t = player.swingTimer / player.swingDur; // 1 -> 0
    const a = player.swingAngle;
    const arc = player.swordArc;
    const r = player.swordRange;

    // El arco "barre" de un lado al otro durante el golpe.
    const sweep = (1 - t) * arc - arc / 2;
    const mid = a + sweep;

    ctx.save();
    ctx.globalAlpha = 0.5 + t * 0.5;
    const grad = ctx.createRadialGradient(px, py, r * 0.3, px, py, r);
    grad.addColorStop(0, "rgba(255,240,200,0.0)");
    grad.addColorStop(1, "rgba(255,225,150,0.55)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, r, mid - 0.35, mid + 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // El destello de recuerdo al vencer una Sombra (lore jugable).
  drawMemory(memory, w, h) {
    const ctx = this.ctx;
    const a = Math.min(1, memory.timer / 1.2) * Math.min(1, (4.5 - memory.timer) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    ctx.textAlign = "center";
    ctx.fillStyle = "#e8e0ff";
    ctx.font = "italic 22px Georgia, 'Times New Roman', serif";
    ctx.shadowColor = "rgba(150,120,220,0.8)";
    ctx.shadowBlur = 18;
    ctx.fillText(memory.text, w / 2, h * 0.28);
    ctx.restore();
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

// Dibuja un disco de luz con caída radial (usado por el bloom).
function radial(ctx, x, y, r, color) {
  if (r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
