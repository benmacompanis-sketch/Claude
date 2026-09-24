/**
 * Mapa "a pedido": Google Maps solo se carga cuando la persona toca el botón.
 * Así la página es más rápida y no se comparten datos con Google sin necesidad.
 */
const PERMITIDOS = /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i;

export default function iniciarMapa() {
  document.querySelectorAll('[data-map]').forEach((mapa) => {
    const url = mapa.dataset.embed;
    const boton = mapa.querySelector('[data-map-load]');
    if (!url || !boton) return;
    if (!PERMITIDOS.test(url)) {
      console.warn('[residencia] La URL del mapa debe ser la de "Insertar un mapa" de Google Maps.');
      return;
    }

    boton.addEventListener(
      'click',
      () => {
        mapa.classList.add('is-loading');
        boton.querySelector('span').textContent = 'Cargando mapa…';
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.title = 'Mapa con la ubicación de la residencia';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.allowFullscreen = true;
        iframe.addEventListener('load', () => {
          mapa.classList.remove('is-loading');
          mapa.querySelector('.map__overlay')?.setAttribute('hidden', '');
          iframe.focus({ preventScroll: true });
        });
        mapa.querySelector('[data-map-frame]').append(iframe);
      },
      { once: true },
    );
  });
}
