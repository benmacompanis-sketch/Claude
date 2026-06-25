# Guía de producción de arte — Estilo "ASCUA"

Esta guía existe para que **cientos de imágenes salgan del mismo molde**. La consistencia
es lo que hace que un juego se vea profesional y no "hecho con IA". Seguila al pie.

---

## 1. La regla de oro: el estilo "ASCUA"

> Todo es **silueta casi negra**. Solo la **luz revela el color**.
> Paleta cerrada, chiaroscuro extremo, formas limpias y legibles.

**Paleta (usá estos colores, nada más):**
| Rol | Hex |
|-----|-----|
| Vacío / negro profundo | `#05060a` `#0a0b12` |
| Piedra en sombra | `#14161f` |
| Luz cálida (highlights) | `#ffb24d` → `#fff1c2` |
| Ámbar medio (la llama) | `#d8852a` |
| Cian frío (Sombras/acentos) | `#9ed6ff` `#6fb0d8` |
| Peligro (muy poco) | `#b42a2a` |

**Nota técnica CLAVE:** el brillo y la luz se los pone **el motor del juego en vivo**.
Por eso los sprites deben venir **oscuros, casi en silueta**, con apenas un borde cálido.
NO horneés un gran resplandor dentro del sprite: si lo hacés, choca con nuestra iluminación.

---

## 2. La "receta" de prompt (pegala en CADA sprite)

Sufijo fijo para Pixellab / pixel art (copiá-pegá siempre):

```
detailed pixel art, top-down 3/4 view, near-black silhouette revealed by a single
warm torch light, heavy chiaroscuro, limited palette of deep blue-black plus warm
amber and gold highlights plus cold cyan accents, moody, high contrast, clean
readable shapes, transparent background, no text, no UI, no big glow baked in
```

**Truco de consistencia:** cuando generes una imagen que te encante, fijá su **semilla**
(Pixellab) o su **`--sref`** (Midjourney) y reusala en TODAS las demás.

---

## 3. Herramientas
- **Pixellab.ai** → personajes, Sombras, tiles, props (el grueso). Soporta transparencia,
  frames de animación y estilo consistente. **Esta es la principal.**
- **Midjourney** (o Flux) → solo la **portada / key art**. Más fidelidad para el marketing.

---

## 4. Shot list (generá en este orden — de mayor impacto a menor)

Cada archivo va con su **nombre y carpeta exactos**: respetalos, así entran solos al juego.

### TANDA 1 — Portada del menú  ⭐ (lo que más mata el "look IA")
- **Archivo:** `assets/art/portada.png` · **Medida:** 1920×1080 (16:9) · **Fondo:** opaco
- **Herramienta:** Midjourney
- **Prompt:**
  ```
  key art, a lone hooded torchbearer seen from behind, standing at the edge of a vast
  pitch-black underground abyss, holding a single torch that is the ONLY light source,
  dramatic chiaroscuro, dark fantasy, bold graphic shapes, deep blue-black palette with
  warm amber glow and faint cold cyan accents in the dark, atmospheric, cinematic, empty
  space at the top for a title --ar 16:9 --style raw
  ```
  (Dejá la zona superior despejada: ahí va el título que dibuja el juego.)

### TANDA 2 — El Portador (personaje)  ⭐
- **Archivo:** `assets/sprites/portador.png` · **Medida:** 64×64 · **Fondo:** transparente
- **Herramienta:** Pixellab
- **Prompt:** `a hooded figure in a tattered cloak holding a small torch, seen top-down 3/4,`
  + (sufijo fijo). Pose: idle, de pie.
- *Más adelante:* una tira de caminata de 4 frames (te la pido cuando lleguemos).

### TANDA 3 — El mundo (tiles)
- `assets/tiles/piso.png` · 48×48 · **opaco, tileable** (que pegue consigo mismo sin costura)
  - `cracked dark stone dungeon floor tile, seamless, subtle` + (sufijo, pero **sin** "transparent background", acá es opaco)
- `assets/tiles/pared.png` · 48×48 · borde superior con una cara iluminable
  - `dark stone dungeon wall block, top edge catches faint warm light` + (sufijo)
- *Opcional:* 2–3 variantes de piso para que no se repita.

### TANDA 4 — Enemigos y props
- `assets/sprites/sombra.png` · 48×48 · transparente
  - `a wraith made of black smoke, faint cold cyan glowing eyes, wispy edges, top-down` + (sufijo)
- `assets/props/brasero.png` · 48×96 · transparente · **la llama arriba**
  - `a tall iron brazier with a warm flame on top, dungeon prop, top-down 3/4` + (sufijo)
- *Más adelante:* escalera, ítems, pociones de luz.

### TANDA 5 (futuro) — UI y tipografía
- Una **fuente de display** (`.ttf`/`.otf` libre, con carácter) para el título y los menús
  → es lo que termina de borrar el look "default". Pasámela y la integro.
- Marcos de UI, íconos.

---

## 5. Cómo me los mandás
1. Generás la tanda respetando **nombre, medida y fondo**.
2. Me subís los PNG acá en el chat.
3. Yo los pongo en su carpeta, activo su línea en `src/assets.js` y **verifico con un
   screenshot** que entren bien y se vean con la iluminación del juego.
4. Si algo no compone bien (muy brillante, mala perspectiva), te digo exactamente qué ajustar.

> No hace falta que salgan perfectos a la primera. Generá varias, mandá la mejor, y
> afinamos. Calidad > velocidad.
