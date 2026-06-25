// assets.js — cargador central de imágenes.
// Agregá una entrada al `manifest` cuando tengas el PNG en su carpeta.
// Mientras un asset no exista, el juego usa su dibujo por código (fallback),
// así nada se rompe y los reemplazos van entrando de a uno.
const Assets = (() => {
  const images = {};

  // name -> ruta del archivo. Descomentá / agregá a medida que lleguen.
  const manifest = {
    // titleArt: "assets/art/portada.png",     // portada del menú (16:9, opaca)
    // player:   "assets/sprites/portador.png", // 64x64, transparente
    // shadow:   "assets/sprites/sombra.png",   // 48x48, transparente
    // floor:    "assets/tiles/piso.png",       // 48x48, opaca, tileable
    // wall:     "assets/tiles/pared.png",      // 48x48
    // brazier:  "assets/props/brasero.png",    // 48x96, transparente (llama arriba)
  };

  function load() {
    for (const name in manifest) {
      const img = new Image();
      img.onload = () => { images[name] = img; };
      img.onerror = () => { /* sin asset: se usa el fallback por código */ };
      img.src = manifest[name];
    }
  }

  function get(name) {
    return images[name] || null;
  }

  return { load, get, manifest };
})();
