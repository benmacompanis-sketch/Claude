# Fotos del sitio

**Para reemplazar una ilustración provisional por una foto real**, guardá la foto con el
mismo nombre en la subcarpeta equivalente, fuera de `_provisionales/`:

| Ilustración provisional | Foto real |
|---|---|
| `_provisionales/inicio/hero.svg` | `inicio/hero.jpg` |
| `_provisionales/instalaciones/habitacion-1.svg` | `instalaciones/habitacion-1.jpg` |
| `_provisionales/equipo/direccion.svg` | `equipo/direccion.jpg` |

Sirven `.jpg`, `.jpeg`, `.png` y `.webp`. No hace falta achicarlas: el sitio genera
automáticamente versiones livianas (AVIF y WebP) en varios tamaños. Conviene que tengan
al menos 1600 px de ancho.

Después de reemplazar una foto, revisá su texto alternativo (`alt`) en
`src/_data/contenido/`, para que describa lo que se ve en la foto real.

La tabla completa de qué foto va en cada lugar está en el `README.md` del proyecto.
