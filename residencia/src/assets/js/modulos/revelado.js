/**
 * Aparición suave de los bloques marcados con data-reveal al entrar en pantalla.
 * - Lo que ya está a la vista al cargar se muestra de inmediato (sin parpadeos).
 * - Si la persona pidió reducir el movimiento, no se anima nada.
 * - Sin JavaScript, todo el contenido está visible desde el principio.
 */
export function iniciarRevelado() {
  const elementos = [...document.querySelectorAll('[data-reveal]')];
  if (!elementos.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const alto = window.innerHeight;
  const pendientes = elementos.filter((el) => {
    const caja = el.getBoundingClientRect();
    const aLaVista = caja.top < alto * 0.95 && caja.bottom > 0;
    if (aLaVista) el.classList.add('is-visible');
    return !aLaVista;
  });

  document.documentElement.classList.add('reveal-activo');

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          observador.unobserve(entrada.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.1 },
  );

  pendientes.forEach((el) => observador.observe(el));

  // Por las dudas: antes de imprimir, todo visible.
  window.addEventListener('beforeprint', () => elementos.forEach((el) => el.classList.add('is-visible')));
}
