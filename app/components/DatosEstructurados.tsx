interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export function JsonLd({ datos }: { datos: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
    />
  );
}

export function aplicacionJsonLd(idioma: "es" | "en"): Record<string, unknown> {
  const enEspanol = idioma === "es";
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Deskmeter",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: idioma,
    description: enEspanol
      ? "Panel de salud de un helpdesk a partir del CSV de tickets, con clasificación en dos pasadas vía classifier.dev y un índice de salud de metodología abierta."
      : "Helpdesk health dashboard built from an exported ticket CSV, with two-pass classification via classifier.dev and an open-methodology health index.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    featureList: enEspanol
      ? [
          "Clasificación de tickets por categoría y urgencia",
          "Índice de salud por semana y por mes",
          "Mapa de calor de categorías",
          "Tickets marcados para revisión manual",
          "Redacción de correos, teléfonos y DNI/NIE antes de clasificar",
          "Sin registro, sin API key y sin datos guardados",
        ]
      : [
          "Ticket classification by category and urgency",
          "Health index per week and per month",
          "Category heatmap",
          "Tickets flagged for manual review",
          "Emails, phones and ID numbers redacted before classification",
          "No sign-up, no API key, no stored data",
        ],
  };
}

export function migasJsonLd(
  migas: { nombre: string; ruta: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: migas.map((miga, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      name: miga.nombre,
      item: miga.ruta,
    })),
  };
}

export function faqJsonLd(
  preguntas: PreguntaFrecuente[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((pregunta) => ({
      "@type": "Question",
      name: pregunta.pregunta,
      acceptedAnswer: { "@type": "Answer", text: pregunta.respuesta },
    })),
  };
}
