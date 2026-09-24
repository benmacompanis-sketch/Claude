/**
 * Datos estructurados (Schema.org, JSON-LD) para buscadores.
 *
 * Regla: solo se publica información real. Cualquier dato que siga siendo un
 * [placeholder] o esté vacío se omite automáticamente. No se declaran habilitaciones,
 * servicios médicos ni certificaciones.
 */
import { real, tokens } from './filtros.js';

const podar = (valor) => {
  if (Array.isArray(valor)) {
    const lista = valor.map(podar).filter((v) => v !== undefined);
    return lista.length ? lista : undefined;
  }
  if (valor && typeof valor === 'object') {
    const obj = Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, podar(v)]).filter(([, v]) => v !== undefined));
    const claves = Object.keys(obj).filter((k) => k !== '@type');
    return claves.length ? obj : undefined;
  }
  return valor === '' ? undefined : valor;
};

export function schemaSitio(site, pagina = {}) {
  const base = String(site.url ?? '').replace(/\/$/, '');
  const u = site.ubicacion ?? {};
  const lat = real(u.coordenadas?.lat);
  const lng = real(u.coordenadas?.lng);
  const redes = Object.values(site.redes ?? {}).map((r) => real(r?.url)).filter(Boolean);
  const horarios = (site.horarios?.estructurados ?? []).map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.dias,
    opens: h.abre,
    closes: h.cierra,
  }));

  const residencia = {
    '@type': 'LocalBusiness',
    // Tipo complementario: residencia para personas mayores (sin implicar servicios médicos).
    additionalType: 'https://en.wikipedia.org/wiki/Retirement_home',
    '@id': `${base}/#residencia`,
    name: site.nombre,
    description: tokens(site.seo?.descripcion ?? '', site),
    url: `${base}/`,
    image: `${base}${site.seo?.imagen ?? ''}`,
    logo: `${base}/assets/marca/logo.png`,
    telephone: real(site.contacto?.telefono?.numero),
    email: real(site.contacto?.email),
    address: {
      '@type': 'PostalAddress',
      streetAddress: real(u.direccion),
      addressLocality: real(u.ciudad),
      addressRegion: real(u.provincia),
      postalCode: real(u.codigoPostal),
      addressCountry: real(u.pais),
    },
    geo: lat && lng ? { '@type': 'GeoCoordinates', latitude: Number(lat), longitude: Number(lng) } : undefined,
    areaServed: real(u.ciudad),
    openingHoursSpecification: horarios,
    sameAs: redes,
  };

  const sitio = {
    '@type': 'WebSite',
    '@id': `${base}/#sitio`,
    name: site.nombre,
    url: `${base}/`,
    inLanguage: site.idioma ?? 'es-AR',
    publisher: { '@id': `${base}/#residencia` },
  };

  const grafo = [residencia, sitio];

  if (pagina.migas?.length) {
    grafo.push({
      '@type': 'BreadcrumbList',
      itemListElement: pagina.migas.map((miga, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: miga.texto,
        item: `${base}${miga.url}`,
      })),
    });
  }

  if (pagina.faq?.length && site.seo?.faqSchema) {
    grafo.push({
      '@type': 'FAQPage',
      mainEntity: pagina.faq.map((p) => ({
        '@type': 'Question',
        name: tokens(p.pregunta, site),
        acceptedAnswer: { '@type': 'Answer', text: tokens(p.respuesta, site).replace(/\s+/g, ' ').trim() },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': grafo.map(podar).filter(Boolean) };
}
