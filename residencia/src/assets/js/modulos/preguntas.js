/**
 * Buscador de preguntas frecuentes: filtra mientras se escribe, sin distinguir
 * mayúsculas ni tildes ("dia" encuentra "día").
 */
const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export default function iniciarPreguntas() {
  const buscador = document.querySelector('[data-faq-search]');
  const campo = buscador?.querySelector('[data-faq-input]');
  const grupos = [...document.querySelectorAll('[data-faq-group]')];
  const vacio = document.querySelector('[data-faq-empty]');
  const estado = document.querySelector('[data-faq-status]');
  if (!buscador || !campo || !grupos.length) return;

  buscador.hidden = false;

  const preguntas = grupos.flatMap((grupo) =>
    [...grupo.querySelectorAll('details')].map((detalle) => ({ detalle, grupo, texto: normalizar(detalle.textContent) })),
  );

  let espera;
  campo.addEventListener('input', () => {
    clearTimeout(espera);
    espera = setTimeout(filtrar, 120);
  });

  function filtrar() {
    const palabras = normalizar(campo.value.trim()).split(/\s+/).filter(Boolean);
    let encontradas = 0;

    for (const pregunta of preguntas) {
      const coincide = palabras.every((palabra) => pregunta.texto.includes(palabra));
      pregunta.detalle.hidden = !coincide;
      if (coincide) encontradas += 1;
    }

    // Con pocos resultados, se abren solos para ver la respuesta enseguida.
    for (const pregunta of preguntas) {
      pregunta.detalle.open = palabras.length > 0 && !pregunta.detalle.hidden && encontradas <= 3;
    }

    grupos.forEach((grupo) => {
      grupo.hidden = ![...grupo.querySelectorAll('details')].some((detalle) => !detalle.hidden);
    });

    vacio.hidden = encontradas > 0;
    if (!palabras.length) estado.textContent = '';
    else if (encontradas) estado.textContent = `${encontradas} ${encontradas === 1 ? 'pregunta encontrada' : 'preguntas encontradas'}.`;
    else estado.textContent = 'No encontramos preguntas con esas palabras.';
  }
}
