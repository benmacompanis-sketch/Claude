/**
 * Galería de instalaciones: visor de fotos a pantalla completa y navegación
 * por espacios que acompaña el scroll.
 *
 * - Teclado: flechas para moverse, Esc para cerrar.
 * - Celular: deslizar para cambiar de foto.
 * - Accesible: usa <dialog> modal (el foco queda adentro y vuelve a la foto al cerrar).
 */
export default function iniciarGaleria() {
  iniciarChips();
  iniciarVisor();
}

function iniciarVisor() {
  const dialogo = document.querySelector('[data-lightbox]');
  const fotos = [...document.querySelectorAll('[data-lightbox-item]')];
  if (!dialogo || !fotos.length || typeof dialogo.showModal !== 'function') return;

  const escenario = dialogo.querySelector('[data-lb-stage]');
  const leyenda = dialogo.querySelector('[data-lb-caption]');
  const contador = dialogo.querySelector('[data-lb-count]');
  const cerrar = dialogo.querySelector('[data-lb-close]');
  const anterior = dialogo.querySelector('[data-lb-prev]');
  const siguiente = dialogo.querySelector('[data-lb-next]');

  let actual = 0;
  let origen = null;

  const copiaDe = (indice) => {
    const original = fotos[indice].querySelector('picture') ?? fotos[indice].querySelector('img');
    if (!original) return null;
    const copia = original.cloneNode(true);
    copia.querySelectorAll('source, img').forEach((nodo) => {
      if (nodo.hasAttribute('sizes')) nodo.setAttribute('sizes', '100vw');
    });
    const img = copia.tagName === 'IMG' ? copia : copia.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.removeAttribute('class');
      img.removeAttribute('style');
      img.draggable = false;
    }
    return copia;
  };

  const precargar = (indice) => {
    const copia = copiaDe((indice + fotos.length) % fotos.length);
    const img = copia?.tagName === 'IMG' ? copia : copia?.querySelector('img');
    if (!img) return;
    const precarga = new Image();
    precarga.sizes = '100vw';
    precarga.srcset = copia.querySelector?.('source[type="image/avif"]')?.srcset ?? img.srcset;
    precarga.src = img.src;
  };

  function mostrar(indice) {
    actual = (indice + fotos.length) % fotos.length;
    const copia = copiaDe(actual);
    if (copia) escenario.replaceChildren(copia);
    leyenda.textContent = fotos[actual].dataset.caption ?? '';
    contador.textContent = `${actual + 1} de ${fotos.length}`;
    precargar(actual + 1);
  }

  function abrir(indice, disparador) {
    origen = disparador;
    mostrar(indice);
    dialogo.showModal();
    document.documentElement.style.overflow = 'hidden';
    cerrar.focus();
  }

  fotos.forEach((foto, indice) => {
    foto.addEventListener('click', () => abrir(indice, foto));
  });

  cerrar.addEventListener('click', () => dialogo.close());
  anterior.addEventListener('click', () => mostrar(actual - 1));
  siguiente.addEventListener('click', () => mostrar(actual + 1));

  dialogo.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowRight') {
      evento.preventDefault();
      mostrar(actual + 1);
    } else if (evento.key === 'ArrowLeft') {
      evento.preventDefault();
      mostrar(actual - 1);
    }
  });

  // Tocar el fondo (fuera de la foto) cierra el visor.
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo || evento.target === escenario) dialogo.close();
  });

  dialogo.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    escenario.replaceChildren();
    origen?.focus({ preventScroll: true });
  });

  // Deslizar con el dedo para cambiar de foto.
  let inicioX = null;
  let inicioY = null;
  escenario.addEventListener(
    'touchstart',
    (evento) => {
      inicioX = evento.touches[0].clientX;
      inicioY = evento.touches[0].clientY;
    },
    { passive: true },
  );
  escenario.addEventListener(
    'touchend',
    (evento) => {
      if (inicioX === null) return;
      const dx = evento.changedTouches[0].clientX - inicioX;
      const dy = evento.changedTouches[0].clientY - inicioY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) mostrar(actual + (dx < 0 ? 1 : -1));
      inicioX = null;
      inicioY = null;
    },
    { passive: true },
  );
}

/** Marca el espacio que se está viendo en la barra de navegación por espacios. */
function iniciarChips() {
  const barra = document.querySelector('[data-chips]');
  const capitulos = [...document.querySelectorAll('[data-chapter]')];
  if (!barra || !capitulos.length || !('IntersectionObserver' in window)) return;

  const lista = barra.querySelector('.chips__list');
  const chips = new Map([...barra.querySelectorAll('[data-chip]')].map((chip) => [chip.dataset.chip, chip]));

  const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  const activar = (id) => {
    chips.forEach((chip, clave) => {
      if (clave === id) chip.setAttribute('aria-current', 'true');
      else chip.removeAttribute('aria-current');
    });
    const chip = chips.get(id);
    if (!lista) return;
    const destino = chip ? chip.offsetLeft - lista.clientWidth / 2 + chip.clientWidth / 2 : 0;
    lista.scrollTo({ left: Math.max(0, destino), behavior: suave });
  };

  const visibles = new Set();
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) {
          visibles.add(entrada.target);
          activar(entrada.target.id);
        } else {
          visibles.delete(entrada.target);
        }
      }
      // Por encima del primer espacio (arriba de todo) no hay ninguno marcado.
      if (!visibles.size && capitulos[0].getBoundingClientRect().top > window.innerHeight * 0.4) activar(null);
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );

  capitulos.forEach((capitulo) => observador.observe(capitulo));
}
