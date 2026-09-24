/**
 * JavaScript del sitio. Todo es una mejora progresiva: sin JavaScript, el
 * contenido se ve completo, los enlaces funcionan y el menú abre igual.
 *
 * Los módulos que solo usan algunas páginas se descargan bajo demanda.
 */
import { iniciarMenu } from './modulos/menu.js';
import { iniciarEncabezado } from './modulos/encabezado.js';
import { iniciarRevelado } from './modulos/revelado.js';
import { iniciarWhatsapp } from './modulos/whatsapp.js';
import { abrirPreguntaDesdeAncla } from './modulos/anclas.js';

iniciarMenu();
iniciarEncabezado();
iniciarRevelado();
iniciarWhatsapp();
abrirPreguntaDesdeAncla();

const bajoDemanda = [
  ['[data-gallery]', () => import('./modulos/galeria.js')],
  ['[data-form]', () => import('./modulos/formulario.js')],
  ['[data-map]', () => import('./modulos/mapa.js')],
  ['[data-faq-search]', () => import('./modulos/preguntas.js')],
];

for (const [selector, cargar] of bajoDemanda) {
  if (document.querySelector(selector)) {
    cargar()
      .then((modulo) => modulo.default())
      .catch((error) => console.error('[residencia] No se pudo iniciar un módulo:', error));
  }
}
