/**
 * Encabezado: al bajar, la barra se "asienta" con una línea y una sombra suave.
 * No cambia de alto (así no se mueve el contenido).
 */
export function iniciarEncabezado() {
  const encabezado = document.querySelector('[data-header]');
  if (!encabezado) return;

  const franja = encabezado.querySelector('.topbar');
  let alturaFranja = franja?.offsetHeight ?? 0;
  let pendiente = false;

  const actualizar = () => {
    encabezado.classList.toggle('is-scrolled', window.scrollY > alturaFranja + 4);
    pendiente = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(actualizar);
      }
    },
    { passive: true },
  );

  window.addEventListener(
    'resize',
    () => {
      alturaFranja = franja?.offsetHeight ?? 0;
    },
    { passive: true },
  );

  actualizar();
}
