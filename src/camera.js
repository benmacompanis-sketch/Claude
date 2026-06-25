// camera.js — cámara que sigue al jugador con suavizado (lerp).
class Camera {
  constructor(viewW, viewH) {
    this.x = 0;
    this.y = 0;
    this.viewW = viewW;
    this.viewH = viewH;
    this.smooth = 0.12; // 0 = no sigue, 1 = pegado al instante
    // Pequeño "screen shake" reutilizable para el game feel de fases futuras.
    this.shake = 0;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  resize(viewW, viewH) {
    this.viewW = viewW;
    this.viewH = viewH;
  }

  // Centra la cámara en un objetivo, sin pasarse de los límites del mapa.
  follow(target, dt, mapW, mapH) {
    const targetX = target.x - this.viewW / 2;
    const targetY = target.y - this.viewH / 2;

    // Lerp independiente del framerate.
    const t = 1 - Math.pow(1 - this.smooth, dt * 60);
    this.x += (targetX - this.x) * t;
    this.y += (targetY - this.y) * t;

    // Clamp a los bordes del mapa.
    this.x = Math.max(0, Math.min(this.x, mapW - this.viewW));
    this.y = Math.max(0, Math.min(this.y, mapH - this.viewH));

    // Decaimiento del shake.
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 60 * 0.08);
      const mag = this.shake * 6;
      this.shakeX = (Math.random() * 2 - 1) * mag;
      this.shakeY = (Math.random() * 2 - 1) * mag;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  addShake(amount) {
    this.shake = Math.min(1.5, this.shake + amount);
  }

  // Offset final que se aplica al dibujar (cámara + shake).
  get offsetX() { return this.x + this.shakeX; }
  get offsetY() { return this.y + this.shakeY; }
}
