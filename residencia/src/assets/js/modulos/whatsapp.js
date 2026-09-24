/**
 * Botón flotante de WhatsApp: se oculta cuando en pantalla ya hay otro acceso
 * a WhatsApp (pie, bloque de visita, cierre, contacto), para no tapar contenido
 * ni repetir botones.
 */
export function iniciarWhatsapp() {
  const boton = document.querySelector('[data-wa-float]');
  if (!boton || !('IntersectionObserver' in window)) return;

  const zonas = document.querySelectorAll('.hero, [data-footer], .visit, .closing, .contact');
  if (!zonas.length) return;

  const visibles = new Set();
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) visibles.add(entrada.target);
        else visibles.delete(entrada.target);
      }
      const ocultar = visibles.size > 0;
      boton.classList.toggle('is-hidden', ocultar);
      if (ocultar) boton.setAttribute('tabindex', '-1');
      else boton.removeAttribute('tabindex');
    },
    { threshold: 0.12 },
  );

  zonas.forEach((zona) => observador.observe(zona));
}
