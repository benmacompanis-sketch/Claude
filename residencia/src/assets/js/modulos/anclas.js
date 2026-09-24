/**
 * Si la dirección apunta a una pregunta (por ejemplo /preguntas-frecuentes/#ingreso-2),
 * la abre automáticamente.
 */
export function abrirPreguntaDesdeAncla() {
  const abrir = () => {
    if (!window.location.hash) return;
    let destino;
    try {
      destino = document.querySelector(decodeURIComponent(window.location.hash));
    } catch {
      return;
    }
    if (destino instanceof HTMLDetailsElement) destino.open = true;
  };
  abrir();
  window.addEventListener('hashchange', abrir);
}
