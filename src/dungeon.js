// dungeon.js — mapa basado en grilla de tiles.
// Fase 1: una sola sala rectangular con paredes en el borde.
// El sistema de tiles ya queda listo para la generación procedural (Fase 2).

const TILE = 48; // tamaño de cada tile en pixeles

const Tiles = {
  VOID: 0,  // afuera del mapa (negro)
  FLOOR: 1, // piso caminable
  WALL: 2,  // pared sólida (colisiona)
};

class Dungeon {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.grid = [];
    this._buildSingleRoom();
    // "ruido" por tile para variar levemente el color del piso (estética).
    this.noise = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) row.push(Math.random());
      this.noise.push(row);
    }
  }

  get widthPx() { return this.cols * TILE; }
  get heightPx() { return this.rows * TILE; }

  _buildSingleRoom() {
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) {
        const isBorder =
          x === 0 || y === 0 || x === this.cols - 1 || y === this.rows - 1;
        row.push(isBorder ? Tiles.WALL : Tiles.FLOOR);
      }
      this.grid.push(row);
    }

    // Un par de "pilares" internos para probar colisiones de verdad.
    this._setBlock(6, 5, 2, 2, Tiles.WALL);
    this._setBlock(this.cols - 8, this.rows - 7, 2, 2, Tiles.WALL);
  }

  _setBlock(cx, cy, w, h, tile) {
    for (let y = cy; y < cy + h; y++) {
      for (let x = cx; x < cx + w; x++) {
        if (this.inBounds(x, y)) this.grid[y][x] = tile;
      }
    }
  }

  inBounds(cx, cy) {
    return cx >= 0 && cy >= 0 && cx < this.cols && cy < this.rows;
  }

  tileAt(cx, cy) {
    if (!this.inBounds(cx, cy)) return Tiles.WALL;
    return this.grid[cy][cx];
  }

  // ¿El punto en pixeles cae sobre una pared sólida?
  isSolidAtPx(px, py) {
    const cx = Math.floor(px / TILE);
    const cy = Math.floor(py / TILE);
    return this.tileAt(cx, cy) === Tiles.WALL;
  }

  // Centro (en px) de la sala, para spawnear al jugador.
  get spawnPoint() {
    return { x: this.widthPx / 2, y: this.heightPx / 2 };
  }
}
