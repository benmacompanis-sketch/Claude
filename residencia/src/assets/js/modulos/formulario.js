/**
 * Formulario de contacto.
 * - Validación clara, en castellano, al salir de cada campo y al enviar.
 * - Resumen de errores accesible y foco en el primer campo a corregir.
 * - Estados de envío, éxito y error.
 * - Envío configurable en src/_data/site.yml → formulario.modo:
 *     demo | netlify | endpoint | whatsapp
 */
export default function iniciarFormulario() {
  const form = document.querySelector('[data-form]');
  if (!form) return;

  form.noValidate = true;

  const campos = [...form.querySelectorAll('input, select, textarea')].filter(
    (campo) => campo.name && !['hidden', 'radio', 'submit'].includes(campo.type) && campo.name !== 'empresa',
  );
  const resumen = form.querySelector('[data-form-summary]');
  const listaResumen = form.querySelector('[data-form-summary-list]');
  const estado = form.querySelector('[data-form-status]');
  const exito = document.querySelector('[data-form-success]');
  const fallo = document.querySelector('[data-form-error]');
  const reintentar = document.querySelector('[data-form-retry]');

  precargarMotivo(form);
  iniciarContador(form);

  /* ---------- Validación ---------- */
  function mensajeDe(campo) {
    const v = campo.validity;
    const etiqueta = (campo.dataset.label ?? 'este dato').toLowerCase();
    if (v.valueMissing || campo.validationMessage === 'vacío') {
      if (campo.type === 'checkbox') return 'Necesitamos tu autorización para poder responderte.';
      if (campo.tagName === 'SELECT') return 'Elegí el motivo de tu consulta.';
      return `Completá tu ${etiqueta}.`;
    }
    if (campo.name === 'telefono') return 'Revisá el teléfono: escribilo con característica, por ejemplo 11 2345-6789.';
    if (campo.type === 'email') return 'Revisá el email: parece que le falta algo (por ejemplo, nombre@correo.com).';
    if (campo.name === 'edad') return 'Ingresá la edad en años, solo con números.';
    if (v.tooLong) return `Es un poco largo: hasta ${campo.maxLength} caracteres.`;
    return 'Revisá este dato.';
  }

  function errorDe(campo) {
    const ids = (campo.getAttribute('aria-describedby') ?? '').split(/\s+/);
    const id = ids.find((valor) => valor.endsWith('-error'));
    return id ? document.getElementById(id) : null;
  }

  function validar(campo, mostrar = true) {
    let personalizado = '';
    if (campo.name === 'telefono' && campo.value && campo.value.replace(/\D/g, '').length < 8) personalizado = 'corto';
    // Un campo obligatorio no se da por completo con solo espacios.
    if ((campo.type === 'text' || campo.tagName === 'TEXTAREA') && campo.required && campo.value && !campo.value.trim()) {
      personalizado = 'vacío';
    }
    campo.setCustomValidity(personalizado);
    const valido = campo.checkValidity();
    if (mostrar) {
      const contenedor = campo.closest('.field');
      campo.setAttribute('aria-invalid', String(!valido));
      contenedor?.classList.toggle('field--invalid', !valido);
      contenedor?.classList.toggle('field--valid', valido && Boolean(campo.value) && campo.type !== 'checkbox');
      const error = errorDe(campo);
      if (error) error.textContent = valido ? '' : mensajeDe(campo);
    }
    return valido;
  }

  for (const campo of campos) {
    campo.addEventListener('blur', () => {
      if (campo.value || campo.dataset.tocado) {
        campo.dataset.tocado = 'si';
        validar(campo);
      }
    });
    const revalidar = () => {
      if (campo.getAttribute('aria-invalid') === 'true') validar(campo);
    };
    campo.addEventListener('input', revalidar);
    campo.addEventListener('change', revalidar);
  }

  function mostrarResumen(invalidos) {
    listaResumen.replaceChildren(
      ...invalidos.map((campo) => {
        const item = document.createElement('li');
        const enlace = document.createElement('a');
        enlace.href = `#${campo.id}`;
        enlace.textContent = mensajeDe(campo);
        enlace.addEventListener('click', (evento) => {
          evento.preventDefault();
          campo.focus();
        });
        item.append(enlace);
        return item;
      }),
    );
    resumen.hidden = false;
  }

  /* ---------- Envío ---------- */
  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (form.elements.empresa?.value) return; // Probablemente un bot.

    const invalidos = campos.filter((campo) => !validar(campo));
    if (invalidos.length) {
      mostrarResumen(invalidos);
      estado.textContent = `Hay ${invalidos.length} ${invalidos.length === 1 ? 'dato para revisar' : 'datos para revisar'}.`;
      invalidos[0].focus();
      return;
    }

    resumen.hidden = true;
    form.classList.add('is-sending');
    form.setAttribute('aria-busy', 'true');
    estado.textContent = 'Enviando tu consulta…';

    try {
      const modo = await enviar(form);
      mostrarExito(modo);
    } catch (error) {
      console.error('[residencia] Error al enviar el formulario:', error);
      mostrarFallo();
    } finally {
      form.classList.remove('is-sending');
      form.removeAttribute('aria-busy');
    }
  });

  function mostrarExito(modo) {
    const nombre = form.elements.nombre.value.trim().split(' ')[0];
    const titulo = exito.querySelector('[data-success-title]');
    const texto = exito.querySelector('[data-success-text]');
    if (nombre && titulo) titulo.textContent = `¡Gracias, ${nombre}!`;
    if (modo === 'whatsapp' && texto) {
      texto.textContent = 'Te abrimos WhatsApp con tu consulta lista para enviar. Si no se abrió, tocá el botón «Escribir por WhatsApp».';
    }
    form.hidden = true;
    exito.hidden = false;
    exito.focus();
    exito.scrollIntoView({ block: 'center', behavior: suave() });
  }

  function mostrarFallo() {
    estado.textContent = '';
    fallo.hidden = false;
    fallo.focus();
    fallo.scrollIntoView({ block: 'center', behavior: suave() });
  }

  reintentar?.addEventListener('click', () => {
    fallo.hidden = true;
    form.querySelector('[data-form-submit]')?.focus();
  });
}

const suave = () => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

async function enviar(form) {
  const modo = form.dataset.mode ?? 'demo';
  const datos = new FormData(form);

  if (modo === 'netlify') {
    const respuesta = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(datos).toString(),
    });
    if (!respuesta.ok) throw new Error(`Netlify respondió ${respuesta.status}`);
    return modo;
  }

  if (modo === 'endpoint') {
    const url = form.dataset.endpoint;
    if (!url) throw new Error('Falta configurar formulario.endpoint en site.yml');
    const respuesta = await fetch(url, { method: 'POST', headers: { Accept: 'application/json' }, body: datos });
    if (!respuesta.ok) throw new Error(`El servicio respondió ${respuesta.status}`);
    return modo;
  }

  if (modo === 'whatsapp') {
    const base = (form.dataset.wa ?? 'https://wa.me/').split('?')[0];
    window.open(`${base}?text=${encodeURIComponent(mensajeWhatsapp(form))}`, '_blank', 'noopener');
    return modo;
  }

  // Modo demostración: simula el envío (no manda nada).
  await new Promise((resolver) => setTimeout(resolver, 900));
  return modo;
}

function mensajeWhatsapp(form) {
  const f = form.elements;
  const motivo = f.motivo.selectedOptions[0]?.textContent ?? '';
  const lineas = [
    'Hola, les escribo desde la web.',
    `Nombre: ${f.nombre.value.trim()} ${f.apellido.value.trim()}`,
    `Teléfono: ${f.telefono.value.trim()}`,
    f.email.value.trim() && `Email: ${f.email.value.trim()}`,
    motivo && `Motivo: ${motivo}`,
    f.edad.value && `Edad de mi familiar: ${f.edad.value}`,
    f.tipo?.value && `Tipo de residencia: ${f.tipo.value}`,
    f.mensaje.value.trim() && `Mensaje: ${f.mensaje.value.trim()}`,
  ];
  return lineas.filter(Boolean).join('\n');
}

/** Si se llega con ?motivo=visita (u otro), se preselecciona en el formulario. */
function precargarMotivo(form) {
  const motivo = new URLSearchParams(window.location.search).get('motivo');
  if (!motivo) return;
  const select = form.elements.motivo;
  if (select && [...select.options].some((opcion) => opcion.value === motivo)) select.value = motivo;
  if (motivo === 'temporaria') {
    const temporaria = [...form.querySelectorAll('input[name="tipo"]')].find((radio) => radio.value === 'Temporaria');
    if (temporaria) temporaria.checked = true;
  }
}

function iniciarContador(form) {
  const mensaje = form.elements.mensaje;
  const contador = form.querySelector('[data-counter]');
  if (!mensaje || !contador) return;
  const actualizar = () => {
    contador.textContent = `${mensaje.value.length} de ${mensaje.maxLength} caracteres`;
  };
  mensaje.addEventListener('input', actualizar);
}
