/**
 * Menú del celular.
 * Abre con el atributo nativo "popover" (instantáneo y sin depender de este
 * archivo). Acá se suman: estado aria-expanded, foco accesible, cierre al
 * elegir un enlace y una alternativa para navegadores sin "popover".
 */
export function iniciarMenu() {
  const menu = document.querySelector('[data-menu]');
  const boton = document.querySelector('[data-menu-toggle]');
  if (!menu || !boton) return;

  const soportaPopover = typeof menu.showPopover === 'function';
  const escritorio = window.matchMedia('(min-width: 75em)');
  let fondo = null;

  const estaAbierto = () => (soportaPopover ? menu.matches(':popover-open') : menu.classList.contains('is-open'));

  const primerEnlace = () => menu.querySelector('.menu__link');

  function alAbrir() {
    boton.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-abierto');
    // El foco entra al menú sin mover la página.
    requestAnimationFrame(() => primerEnlace()?.focus({ preventScroll: true }));
  }

  function alCerrar() {
    boton.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-abierto');
    if (menu.contains(document.activeElement) || document.activeElement === document.body) {
      boton.focus({ preventScroll: true });
    }
  }

  function cerrar() {
    if (!estaAbierto()) return;
    if (soportaPopover) {
      menu.hidePopover();
    } else {
      menu.classList.remove('is-open');
      fondo?.remove();
      fondo = null;
      alCerrar();
    }
  }

  if (soportaPopover) {
    menu.addEventListener('toggle', (evento) => {
      if (evento.newState === 'open') alAbrir();
      else alCerrar();
    });
  } else {
    // Alternativa para navegadores sin "popover".
    boton.removeAttribute('popovertarget');
    menu.querySelectorAll('[popovertarget]').forEach((el) => el.removeAttribute('popovertarget'));
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', 'true');
    menu.setAttribute('aria-label', 'Menú');

    boton.addEventListener('click', () => {
      if (estaAbierto()) {
        cerrar();
        return;
      }
      menu.classList.add('is-open');
      fondo = document.createElement('div');
      fondo.className = 'menu-fondo';
      fondo.addEventListener('click', cerrar);
      document.body.append(fondo);
      alAbrir();
    });
    menu.querySelectorAll('[data-menu-close]').forEach((el) => el.addEventListener('click', cerrar));
    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape') cerrar();
    });
  }

  // Al elegir un enlace, el menú se cierra (importante para las anclas de la misma página).
  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a[href]')) cerrar();
  });

  // Mantiene el foco dentro del menú mientras está abierto (navegación con teclado).
  menu.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Tab' || !estaAbierto()) return;
    const enfocables = [...menu.querySelectorAll('a[href]:not([tabindex="-1"]), button:not([disabled])')].filter(
      (el) => el.offsetParent !== null,
    );
    if (!enfocables.length) return;
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  });

  // Si la ventana pasa a tamaño escritorio, el menú del celular deja de tener sentido.
  escritorio.addEventListener('change', (consulta) => {
    if (consulta.matches) cerrar();
  });
}
