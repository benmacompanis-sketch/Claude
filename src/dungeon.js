// dungeon.js — mazmorra procedural basada en grilla de tiles.
// Genera salas conectadas por pasillos, coloca braseros (luz) y una escalera de salida.

const TILE = 48;

const Tiles = {
  VOID: 0,   // roca sólida sin excavar (colisiona, no se dibuja como sala)
  FLOOR: 1,  // piso caminable
  WALL: 2,   // pared de sala (colisiona, se dibuja)
  STAIRS: 3, // bajada al siguiente nivel (piso especial)
};

class Room {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
  }
  get cx() { return Math.floor(this.x + this.w / 2); }
  get cy() { return Math.floor(this.y + this.h / 2); }
  intersects(o, pad = 1) {
    return (
      this.x - pad < o.x + o.w && this.x + this.w + pad > o.x &&
      this.y - pad < o.y + o.h && this.y + this.h + pad > o.y
    );
  }
}

class Dungeon {
  // `depth` = qué tan profundo estamos (sube la dificultad/tamaño en el futuro).
  constructor(cols, rows, depth = 1) {
    this.cols = cols;
    this.rows = rows;
    this.depth = depth;
    this.grid = [];
    this.rooms = [];
    this.braziers = [];     // { x, y (px), taken:false, donated:false }
    this.spawn = { x: 0, y: 0 };
    this.stairs = { cx: 0, cy: 0 };
    this._generate();
    this._buildNoise();
  }

  get widthPx() { return this.cols * TILE; }
  get heightPx() { return this.rows * TILE; }
  get spawnPoint() { return this.spawn; }

  _generate() {
    // Todo macizo al principio.
    for (let y = 0; y < this.rows; y++) {
      this.grid.push(new Array(this.cols).fill(Tiles.VOID));
    }

    // Intentar colocar salas sin solaparse.
    const maxRooms = 9;
    for (let i = 0; i < maxRooms * 4 && this.rooms.length < maxRooms; i++) {
      const w = randInt(5, 9);
      const h = randInt(4, 7);
      const x = randInt(1, this.cols - w - 1);
      const y = randInt(1, this.rows - h - 1);
      const room = new Room(x, y, w, h);
      if (this.rooms.some((r) => room.intersects(r))) continue;
      this._carveRoom(room);
      // Conectar con la sala anterior por un pasillo en L.
      if (this.rooms.length > 0) {
        const prev = this.rooms[this.rooms.length - 1];
        this._carveCorridor(prev.cx, prev.cy, room.cx, room.cy);
      }
      this.rooms.push(room);
    }

    // Bordes de sala = WALL alrededor de cualquier FLOOR.
    this._wrapWalls();

    // Spawn en la primera sala, escalera en la última (la más lejana).
    const first = this.rooms[0];
    this.spawn = { x: (first.cx + 0.5) * TILE, y: (first.cy + 0.5) * TILE };
    const last = this.rooms[this.rooms.length - 1];
    this.stairs = { cx: last.cx, cy: last.cy };
    this.grid[last.cy][last.cx] = Tiles.STAIRS;

    // Braseros: uno en algunas salas intermedias.
    for (let i = 1; i < this.rooms.length - 1; i++) {
      if (Math.random() < 0.7) {
        const r = this.rooms[i];
        const bx = randInt(r.x + 1, r.x + r.w - 2);
        const by = randInt(r.y + 1, r.y + r.h - 2);
        this.braziers.push({
          x: (bx + 0.5) * TILE,
          y: (by + 0.5) * TILE,
          taken: false,
          donated: false,
        });
      }
    }
  }

  _carveRoom(room) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        this.grid[y][x] = Tiles.FLOOR;
      }
    }
  }

  _carveCorridor(x1, y1, x2, y2) {
    if (Math.random() < 0.5) {
      this._hLine(x1, x2, y1);
      this._vLine(y1, y2, x2);
    } else {
      this._vLine(y1, y2, x1);
      this._hLine(x1, x2, y2);
    }
  }

  _hLine(x1, x2, y) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      if (this.inBounds(x, y)) this.grid[y][x] = Tiles.FLOOR;
    }
  }
  _vLine(y1, y2, x) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      if (this.inBounds(x, y)) this.grid[y][x] = Tiles.FLOOR;
    }
  }

  // Cualquier VOID adyacente a un FLOOR se vuelve WALL (marco visible de las salas).
  _wrapWalls() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] !== Tiles.VOID) continue;
        let touchesFloor = false;
        for (let dy = -1; dy <= 1 && !touchesFloor; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const t = this.tileAt(x + dx, y + dy);
            if (t === Tiles.FLOOR || t === Tiles.STAIRS) { touchesFloor = true; break; }
          }
        }
        if (touchesFloor) this.grid[y][x] = Tiles.WALL;
      }
    }
  }

  _buildNoise() {
    this.noise = [];
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) row.push(Math.random());
      this.noise.push(row);
    }
  }

  inBounds(cx, cy) {
    return cx >= 0 && cy >= 0 && cx < this.cols && cy < this.rows;
  }

  tileAt(cx, cy) {
    if (!this.inBounds(cx, cy)) return Tiles.VOID;
    return this.grid[cy][cx];
  }

  isSolidAtPx(px, py) {
    const t = this.tileAt(Math.floor(px / TILE), Math.floor(py / TILE));
    return t === Tiles.WALL || t === Tiles.VOID;
  }

  isStairsAtPx(px, py) {
    return this.tileAt(Math.floor(px / TILE), Math.floor(py / TILE)) === Tiles.STAIRS;
  }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
