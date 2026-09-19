import type { Idioma } from "./idioma";
import type { FiltroRevision } from "./revision";

const TEXTOS_ES = {
  nav: {
    panel: "Panel",
    metodologia: "Metodología",
    tagline: "salud de tu helpdesk",
    temaAria: "Cambiar entre tema claro y oscuro",
    idiomaAria: "Cambiar de idioma",
  },
  pie: {
    privacidad:
      "El CSV se procesa en tu navegador y nada se guarda en el servidor.",
    clasificacion: "Clasificación:",
  },
  subidor: {
    intro:
      "Sube el CSV exportado de tu helpdesk y obtén un panel de salud: tendencia del índice, categorías, urgencia y los tickets que conviene revisar a mano. Si solo quieres verlo funcionar, carga los datos demo.",
    sellos: ["Sin registro", "Datos en tu navegador", "Metodología abierta"],
    arrastra: "Arrastra aquí el CSV de tickets",
    elegir: "Elegir archivo",
    demo: "Cargar datos demo",
    plantilla: "Descargar plantilla",
    columnas:
      "Columnas mínimas: fecha, asunto y descripcion (también valen date, subject y description). Opcionales: estado, prioridad y tiempo_resolucion_horas (status, priority, resolution_hours). Da igual el idioma de los encabezados, incluso mezclados. Si no se detectan, podrás asignarlas a mano. Acepta CSV y Excel (.xlsx).",
    tier: "Tier de clasificación",
    tierAyuda:
      "fast responde en una pasada; smart vuelve a preguntar lo dudoso y tarda más.",
    sector: "Sector",
    sectores: {
      general: "General",
      clinica: "Clínica / salud",
      comercio: "Comercio con TPV",
      colegio: "Colegio / educación",
    },
    sectorAyuda: "Las instrucciones de urgencia se afinan al sector.",
    privacidad:
      "El CSV se procesa en tu navegador. Solo sale hacia classifier.dev el texto redactado de cada ticket (correos, teléfonos y DNI/NIE sustituidos antes de enviar). Nada se guarda en el servidor.",
  },
  vistaPrevia: {
    titulo: "Panel de salud",
    kpis: ["Índice", "Críticos", "Revisión"],
    pie: "Tendencia, categorías y revisión manual de tus tickets.",
  },
  mapeo: {
    titulo: "Asigna las columnas",
    intro:
      "No hemos reconocido todas las columnas obligatorias del archivo. Indica qué columna es cada campo y seguimos. No se envía nada hasta que pulses el botón.",
    archivo: (nombre: string) => `Archivo: ${nombre}`,
    campos: {
      fecha: "Fecha (obligatoria)",
      asunto: "Asunto (obligatorio)",
      descripcion: "Descripción (obligatoria)",
      estado: "Estado (opcional)",
      prioridad: "Prioridad (opcional)",
      tiempo_resolucion_horas: "Tiempo de resolución en horas (opcional)",
    },
    elegir: "Selecciona una columna",
    sinAsignar: "Sin asignar",
    vistaPrevia: "Primeras filas del archivo",
    ejemplo: (valor: string) => `Ejemplo: ${valor}`,
    aplicar: "Clasificar con este mapeo",
    cancelar: "Cancelar",
    faltanObligatorias:
      "Selecciona fecha, asunto y descripción para continuar.",
  },
  progreso: {
    preparando: "Preparando los tickets…",
    clasificando: "Clasificando con classifier.dev…",
    pasos: [
      {
        titulo: "Leer y redactar",
        detalle: "Se quitan correos, teléfonos y DNI/NIE del texto.",
      },
      {
        titulo: "Clasificar categoría",
        detalle: "hardware, software, redes, cuentas, facturación u otro.",
      },
      {
        titulo: "Clasificar urgencia",
        detalle: "crítico, alto, normal o bajo.",
      },
    ],
    lotes:
      "Dos pasadas por lote, hasta 1000 tickets por petición. No cierres la pestaña.",
    cancelar: "Cancelar",
  },
  deskmeter: {
    errorLectura: "No se pudo leer el archivo.",
    errorColumnas: "El CSV no tiene las columnas necesarias.",
    errorSinFilas: "No hay filas con una fecha válida en el CSV.",
    errorClasificar: "No se pudo clasificar el CSV.",
    errorExcel: "No se pudo leer el archivo de Excel (.xlsx).",
    repetidosReutilizados: (cantidad: number) =>
      `${cantidad} ticket(s) con texto idéntico comparten la clasificación de su texto.`,
    filasDescartadas: (cantidad: number) =>
      `${cantidad} fila(s) descartada(s) por fecha no válida.`,
    cancelado: "Proceso cancelado.",
    pasos: [
      {
        titulo: "1 · Sube el CSV",
        texto:
          "Se esperan las columnas fecha, asunto y descripcion (o date, subject y description). Si además trae estado, prioridad y tiempo_resolucion_horas, se aprovechan en el panel.",
      },
      {
        titulo: "2 · Se redacta y se clasifica",
        texto:
          "Antes de enviar nada se quitan correos, teléfonos y DNI/NIE. Cada ticket se clasifica en dos pasadas con classifier.dev: categoría y urgencia.",
      },
      {
        titulo: "3 · Lee el panel",
        texto:
          "Índice de salud por semana y por mes, mapa de calor de categorías, histograma y la lista de tickets con confianza baja para revisar a mano.",
      },
    ],
  },
  panel: {
    titulo: "Panel de salud",
    fuenteDemo: "Datos demo generados en local con clasificación simulada.",
    fuenteCsv: (nombre: string, total: number) =>
      `Fuente: ${nombre} · ${total} tickets clasificados con classifier.dev.`,
    modelo: (modelo: string, tier: string) =>
      `Clasificado con ${modelo} (tier ${tier}).`,
    procesarOtro: "Procesar otro CSV",
    semana: "semana",
    mes: "mes",
    tendenciaTitulo: "Tendencia del índice de salud",
    tendenciaDetalle: (periodo: string) =>
      `0 = peor salud, 100 = mejor. Cada punto es un${periodo === "mes" ? "" : "a"} ${periodo}.`,
    calorTitulo: (periodo: string) =>
      `Mapa de calor: categoría × ${periodo}`,
    calorDetalle: (periodo: string) =>
      `Tickets de cada categoría en cada ${periodo}. Cuanto más oscuro, más volumen.`,
    histogramaTitulo: "Histograma de tickets por categoría",
    histogramaDetalle: (periodo: string) =>
      `Recuento por ${periodo}, apilado por categoría.`,
    revisionTitulo: "Revisión manual",
    revisionContador: (revision: number, total: number) =>
      `${revision} de ${total} tickets con confianza menor que 0,7 (o sin score) en alguna dimensión.`,
    revisionDetalle: "Textos ya redactados: sin correos, teléfonos ni DNI/NIE.",
  },
  tarjetas: {
    indice: "Índice de salud",
    periodoActual: (periodo: string, etiqueta: string) =>
      `últim${periodo === "mes" ? "o" : "a"} ${periodo} · ${etiqueta}`,
    tickets: "Tickets",
    enPeriodos: (cantidad: number) => `en ${cantidad} periodos`,
    criticos: "Críticos / altos",
    ticketsCantidad: (cantidad: string) => `${cantidad} tickets`,
    revision: "Revisión manual",
    tiempo: "Tiempo medio",
    sinColumna: "sin columna tiempo_resolucion_horas",
    horas: "horas hasta la resolución",
    vsAnterior: "vs periodo anterior",
  },
  gauge: {
    sinDatos: "sin datos",
    baja: "salud baja",
    media: "salud media",
    alta: "salud buena",
  },
  tendencia: {
    indice: "Índice",
    media: (valor: string) => `media ${valor}`,
  },
  mapaCalor: {
    menos: "menos",
    mas: "más",
    total: "Total",
    vacio: "Sin datos que mostrar.",
    tooltip: (categoria: string, periodo: string, cantidad: number) =>
      `${categoria} · ${periodo}: ${cantidad} ticket(s)`,
  },
  revision: {
    filtros: [
      { id: "todas", etiqueta: "Todas" },
      { id: "categoria", etiqueta: "Categoría dudosa" },
      { id: "urgencia", etiqueta: "Urgencia dudosa" },
      { id: "baja", etiqueta: "Confianza < 50 %" },
      { id: "sin_score", etiqueta: "Sin score" },
    ] as { id: FiltroRevision; etiqueta: string }[],
    buscar: "Buscar en los tickets…",
    exportar: "Exportar CSV",
    contador: (visibles: number, total: number) =>
      `${visibles} de ${total} tickets con los filtros actuales.`,
    fecha: "Fecha",
    ticket: "Ticket",
    categoria: "Categoría",
    urgencia: "Urgencia",
    motivo: "Motivo",
    revisar: "Revisar:",
    sinAsunto: "(sin asunto)",
    mas: (limite: number, total: number) =>
      `Se muestran ${limite} de ${total} tickets en revisión.`,
    ninguna: "Ningún ticket necesita revisión manual.",
    motivos: { categoria: "categoría", urgencia: "urgencia", union: " y " },
  },
  comparar: {
    titulo: "Comparar con otro CSV",
    intro:
      "Sube un segundo export (por ejemplo, el periodo anterior) y compara índice, volumen, urgencia, revisión y tiempo.",
    boton: "Elegir CSV a comparar",
    cargando: "Clasificando el CSV de comparación…",
    quitar: "Quitar comparación",
    error: "No se pudo procesar el CSV de comparación.",
    actual: (nombre: string) => `Actual: ${nombre}`,
    anterior: (nombre: string) => `Anterior: ${nombre}`,
    columnas: {
      metrica: "Métrica",
      anterior: "Anterior",
      actual: "Actual",
      variacion: "Variación",
    },
    filas: {
      indice: "Índice de salud (último periodo)",
      tickets: "Tickets",
      criticos: "Críticos / altos",
      revision: "Revisión manual",
      tiempo: "Tiempo medio",
    },
    categorias: "Tickets por categoría",
    sinDato: "—",
  },
  porQue: {
    kicker: "La diferencia está en la forma",
    titulo: "Por qué Deskmeter",
    intro:
      "El mismo objetivo que un panel de helpdesk al uso, sin el camino corporativo: ni registro, ni llamada, ni una copia de tus tickets en otro servidor.",
    diferencias: [
      {
        titulo: "Instantáneo y público",
        texto:
          "Abres la URL, subes el CSV y el panel está listo en segundos. Sin demo de ventas, sin formulario de contacto y sin esperar 24-48 horas.",
      },
      {
        titulo: "Sin backend ni retención",
        texto:
          "El CSV se procesa en tu navegador y no se persiste nada: recargas y desaparece. Algunos paneles conservan tu export hasta 30 días.",
      },
      {
        titulo: "Metodología abierta",
        texto:
          "El índice de salud publica sus pesos, umbrales y límites en /metodologia, con el código que lo calcula versionado. No es un informe cerrado.",
      },
    ],
    comparativaTitulo: "Deskmeter",
    comparativaOtras: "Panel corporativo típico",
    comparativa: [
      ["Primer dato", "Segundos", "Demo comercial o 24-48 h"],
      ["Acceso", "URL pública, sin registro", "Formulario de contacto"],
      ["Procesado del CSV", "En tu navegador", "Se sube a su nube"],
      ["Retención", "Ninguna", "Hasta 30 días (según proveedor)"],
      ["Índice de salud", "Fórmula abierta y versionada", "Informe cerrado"],
      ["Para empezar", "Abrir la URL", "Agendar una llamada"],
    ],
    nota: "Comparación con el camino típico de un panel corporativo de helpdesk; los detalles varían según proveedor.",
    enlace: "Ver la metodología abierta",
    enlaceMetodologia: "/metodologia",
  },
  clasificar: {
    sinConexion: "No se pudo contactar con classifier.dev.",
    respuesta: (estado: number) => `classifier.dev respondió ${estado}.`,
    inesperada: "Respuesta inesperada de classifier.dev.",
  },
  csvErrores: {
    vacio: "El archivo está vacío.",
    faltan: (columnas: string) =>
      `Faltan columnas obligatorias: ${columnas}. Se esperan fecha (date), asunto (subject) y descripcion (description).`,
    columnasDetectadas: (columnas: string) =>
      `Columnas detectadas: ${columnas}. Puedes descargar la plantilla de ejemplo para comparar.`,
    limite: (limite: number) =>
      `El CSV supera el límite de ${limite} filas; se procesan las primeras ${limite}.`,
    fila: (fila: number, mensaje: string) => `Fila ${fila}: ${mensaje}`,
    fechaInvalida: (valor: string) => `Fecha no válida: "${valor}"`,
  },
  api: {
    cuerpoJson: "El cuerpo debe ser JSON.",
    dimension: 'La dimensión debe ser "categoria" o "urgencia".',
    tier: 'El tier debe ser "fast" o "smart".',
    lote: (maximo: number) =>
      `Cada lote admite entre 1 y ${maximo} textos.`,
    texto:
      "Cada texto debe ser una cadena no vacía de hasta 32.000 caracteres.",
    sinConexion: "No se pudo contactar con classifier.dev.",
    respuesta: (estado: number) => `classifier.dev respondió ${estado}.`,
  },
  revisionCsv: {
    cabecera: [
      "fecha",
      "asunto",
      "texto_redactado",
      "categoria",
      "confianza_categoria",
      "urgencia",
      "confianza_urgencia",
      "motivos_revision",
    ],
  },
};

export type Textos = typeof TEXTOS_ES;

const TEXTOS_EN: Textos = {
  nav: {
    panel: "Dashboard",
    metodologia: "Methodology",
    tagline: "your helpdesk health",
    temaAria: "Switch between light and dark theme",
    idiomaAria: "Switch language",
  },
  pie: {
    privacidad:
      "The CSV is processed in your browser and nothing is stored on the server.",
    clasificacion: "Classification:",
  },
  subidor: {
    intro:
      "Upload your helpdesk's exported CSV and get a health dashboard: index trend, categories, urgency and the tickets worth reviewing by hand. If you just want to see it working, load the demo data.",
    sellos: ["No sign-up", "Data in your browser", "Open methodology"],
    arrastra: "Drag your ticket CSV here",
    elegir: "Choose file",
    demo: "Load demo data",
    plantilla: "Download template",
    columnas:
      "Required columns: date, subject and description (fecha, asunto and descripcion also work). Optional: status, priority and resolution_hours (estado, prioridad, tiempo_resolucion_horas). Headers may be in either language, even mixed. If they are not detected you can map them by hand. Accepts CSV and Excel (.xlsx).",
    tier: "Classification tier",
    tierAyuda:
      "fast answers in a single pass; smart re-asks the doubtful ones and takes longer.",
    sector: "Sector",
    sectores: {
      general: "General",
      clinica: "Clinic / healthcare",
      comercio: "Retail with POS",
      colegio: "School / education",
    },
    sectorAyuda: "Urgency instructions are tuned to the sector.",
    privacidad:
      "The CSV is processed in your browser. Only the redacted text of each ticket leaves towards classifier.dev (emails, phones and ID numbers replaced before sending). Nothing is stored on the server.",
  },
  vistaPrevia: {
    titulo: "Health dashboard",
    kpis: ["Index", "Critical", "Review"],
    pie: "Trend, categories and manual review for your tickets.",
  },
  mapeo: {
    titulo: "Map the columns",
    intro:
      "We could not recognise every required column in the file. Tell us which column is which and we continue. Nothing is sent until you press the button.",
    archivo: (nombre: string) => `File: ${nombre}`,
    campos: {
      fecha: "Date (required)",
      asunto: "Subject (required)",
      descripcion: "Description (required)",
      estado: "Status (optional)",
      prioridad: "Priority (optional)",
      tiempo_resolucion_horas: "Resolution time in hours (optional)",
    },
    elegir: "Select a column",
    sinAsignar: "Not assigned",
    vistaPrevia: "First rows of the file",
    ejemplo: (valor: string) => `Example: ${valor}`,
    aplicar: "Classify with this mapping",
    cancelar: "Cancel",
    faltanObligatorias: "Select date, subject and description to continue.",
  },
  progreso: {
    preparando: "Preparing the tickets…",
    clasificando: "Classifying with classifier.dev…",
    pasos: [
      {
        titulo: "Read and redact",
        detalle: "Emails, phones and ID numbers are stripped from the text.",
      },
      {
        titulo: "Classify category",
        detalle: "hardware, software, networking, accounts, billing or other.",
      },
      {
        titulo: "Classify urgency",
        detalle: "critical, high, normal or low.",
      },
    ],
    lotes:
      "Two passes per batch, up to 1000 tickets per request. Don't close the tab.",
    cancelar: "Cancel",
  },
  deskmeter: {
    errorLectura: "The file could not be read.",
    errorColumnas: "The CSV is missing the required columns.",
    errorSinFilas: "There are no rows with a valid date in the CSV.",
    errorClasificar: "The CSV could not be classified.",
    errorExcel: "The Excel file (.xlsx) could not be read.",
    repetidosReutilizados: (cantidad: number) =>
      `${cantidad} ticket(s) with identical text share the classification of their text.`,
    filasDescartadas: (cantidad: number) =>
      `${cantidad} row(s) dropped for an invalid date.`,
    cancelado: "Process cancelled.",
    pasos: [
      {
        titulo: "1 · Upload the CSV",
        texto:
          "Required columns: date, subject and description (or fecha, asunto and descripcion). If it also carries status, priority and resolution_hours, the dashboard uses them.",
      },
      {
        titulo: "2 · It gets redacted and classified",
        texto:
          "Before anything is sent, emails, phones and ID numbers are removed. Each ticket is classified in two passes with classifier.dev: category and urgency.",
      },
      {
        titulo: "3 · Read the dashboard",
        texto:
          "Health index per week and month, category heatmap, histogram and the list of low-confidence tickets to review by hand.",
      },
    ],
  },
  panel: {
    titulo: "Health dashboard",
    fuenteDemo: "Demo data generated locally with simulated classification.",
    fuenteCsv: (nombre: string, total: number) =>
      `Source: ${nombre} · ${total} tickets classified with classifier.dev.`,
    modelo: (modelo: string, tier: string) =>
      `Classified with ${modelo} (tier ${tier}).`,
    procesarOtro: "Process another CSV",
    semana: "week",
    mes: "month",
    tendenciaTitulo: "Health index trend",
    tendenciaDetalle: (periodo: string) =>
      `0 = worst health, 100 = best. Each point is one ${periodo}.`,
    calorTitulo: (periodo: string) => `Category × ${periodo} heatmap`,
    calorDetalle: (periodo: string) =>
      `Tickets per category in each ${periodo}. Darker means more volume.`,
    histogramaTitulo: "Tickets per category histogram",
    histogramaDetalle: (periodo: string) =>
      `Count per ${periodo}, stacked by category.`,
    revisionTitulo: "Manual review",
    revisionContador: (revision: number, total: number) =>
      `${revision} of ${total} tickets with confidence below 0.7 (or no score) in either dimension.`,
    revisionDetalle:
      "Texts already redacted: no emails, phones or ID numbers.",
  },
  tarjetas: {
    indice: "Health index",
    periodoActual: (periodo: string, etiqueta: string) =>
      `last ${periodo} · ${etiqueta}`,
    tickets: "Tickets",
    enPeriodos: (cantidad: number) => `across ${cantidad} periods`,
    criticos: "Critical / high",
    ticketsCantidad: (cantidad: string) => `${cantidad} tickets`,
    revision: "Manual review",
    tiempo: "Average time",
    sinColumna: "no tiempo_resolucion_horas column",
    horas: "hours to resolution",
    vsAnterior: "vs previous period",
  },
  gauge: {
    sinDatos: "no data",
    baja: "poor health",
    media: "fair health",
    alta: "good health",
  },
  tendencia: {
    indice: "Index",
    media: (valor: string) => `avg ${valor}`,
  },
  mapaCalor: {
    menos: "less",
    mas: "more",
    total: "Total",
    vacio: "No data to show.",
    tooltip: (categoria: string, periodo: string, cantidad: number) =>
      `${categoria} · ${periodo}: ${cantidad} ticket(s)`,
  },
  revision: {
    filtros: [
      { id: "todas", etiqueta: "All" },
      { id: "categoria", etiqueta: "Doubtful category" },
      { id: "urgencia", etiqueta: "Doubtful urgency" },
      { id: "baja", etiqueta: "Confidence < 50%" },
      { id: "sin_score", etiqueta: "No score" },
    ],
    buscar: "Search tickets…",
    exportar: "Export CSV",
    contador: (visibles: number, total: number) =>
      `${visibles} of ${total} tickets with the current filters.`,
    fecha: "Date",
    ticket: "Ticket",
    categoria: "Category",
    urgencia: "Urgency",
    motivo: "Reason",
    revisar: "Review:",
    sinAsunto: "(no subject)",
    mas: (limite: number, total: number) =>
      `Showing ${limite} of ${total} tickets in review.`,
    ninguna: "No ticket needs manual review.",
    motivos: { categoria: "category", urgencia: "urgency", union: " and " },
  },
  comparar: {
    titulo: "Compare with another CSV",
    intro:
      "Upload a second export (for instance, the previous period) and compare index, volume, urgency, review and time.",
    boton: "Choose CSV to compare",
    cargando: "Classifying the comparison CSV…",
    quitar: "Remove comparison",
    error: "The comparison CSV could not be processed.",
    actual: (nombre: string) => `Current: ${nombre}`,
    anterior: (nombre: string) => `Previous: ${nombre}`,
    columnas: {
      metrica: "Metric",
      anterior: "Previous",
      actual: "Current",
      variacion: "Change",
    },
    filas: {
      indice: "Health index (last period)",
      tickets: "Tickets",
      criticos: "Critical / high",
      revision: "Manual review",
      tiempo: "Average time",
    },
    categorias: "Tickets per category",
    sinDato: "—",
  },
  porQue: {
    kicker: "The difference is in the form",
    titulo: "Why Deskmeter",
    intro:
      "The same goal as a typical helpdesk dashboard, without the enterprise path: no sign-up, no sales call, and no copy of your tickets on someone else's server.",
    diferencias: [
      {
        titulo: "Instant and public",
        texto:
          "Open the URL, upload the CSV and the dashboard is ready in seconds. No sales demo, no contact form, no 24-48 hour wait.",
      },
      {
        titulo: "No backend, no retention",
        texto:
          "The CSV is processed in your browser and nothing is persisted: reload and it's gone. Some dashboards keep your export for up to 30 days.",
      },
      {
        titulo: "Open methodology",
        texto:
          "The health index publishes its weights, thresholds and limits at /en/methodology, with the code that computes it under version control. Not a closed report.",
      },
    ],
    comparativaTitulo: "Deskmeter",
    comparativaOtras: "Typical enterprise panel",
    comparativa: [
      ["First data", "Seconds", "Sales demo or 24-48 h"],
      ["Access", "Public URL, no sign-up", "Contact form"],
      ["CSV processing", "In your browser", "Uploaded to their cloud"],
      ["Retention", "None", "Up to 30 days (provider-dependent)"],
      ["Health index", "Open, versioned formula", "Closed report"],
      ["To get started", "Open the URL", "Book a call"],
    ],
    nota: "Comparison with the typical enterprise helpdesk dashboard path; details vary by provider.",
    enlace: "See the open methodology",
    enlaceMetodologia: "/en/methodology",
  },
  clasificar: {
    sinConexion: "Could not reach classifier.dev.",
    respuesta: (estado: number) => `classifier.dev responded ${estado}.`,
    inesperada: "Unexpected response from classifier.dev.",
  },
  csvErrores: {
    vacio: "The file is empty.",
    faltan: (columnas: string) =>
      `Missing required columns: ${columnas}. Expected date (fecha), subject (asunto) and description (descripcion).`,
    columnasDetectadas: (columnas: string) =>
      `Columns found: ${columnas}. You can download the sample template to compare.`,
    limite: (limite: number) =>
      `The CSV exceeds the ${limite}-row limit; processing the first ${limite}.`,
    fila: (fila: number, mensaje: string) => `Row ${fila}: ${mensaje}`,
    fechaInvalida: (valor: string) => `Invalid date: "${valor}"`,
  },
  api: {
    cuerpoJson: "The body must be JSON.",
    dimension: 'The dimension must be "categoria" or "urgencia".',
    tier: 'The tier must be "fast" or "smart".',
    lote: (maximo: number) =>
      `Each batch accepts between 1 and ${maximo} texts.`,
    texto:
      "Each text must be a non-empty string of up to 32,000 characters.",
    sinConexion: "Could not reach classifier.dev.",
    respuesta: (estado: number) => `classifier.dev responded ${estado}.`,
  },
  revisionCsv: {
    cabecera: [
      "date",
      "subject",
      "redacted_text",
      "category",
      "category_confidence",
      "urgency",
      "urgency_confidence",
      "review_reasons",
    ],
  },
};

export const TEXTOS: Record<Idioma, Textos> = {
  es: TEXTOS_ES,
  en: TEXTOS_EN,
};

export function textosDe(idioma: Idioma): Textos {
  return TEXTOS[idioma] ?? TEXTOS_ES;
}

export const TEXTOS_CSV: Record<Idioma, Textos["csvErrores"]> = {
  es: TEXTOS_ES.csvErrores,
  en: TEXTOS_EN.csvErrores,
};

export const TEXTOS_CLASIFICAR: Record<Idioma, Textos["clasificar"]> = {
  es: TEXTOS_ES.clasificar,
  en: TEXTOS_EN.clasificar,
};

export const TEXTOS_API: Record<Idioma, Textos["api"]> = {
  es: TEXTOS_ES.api,
  en: TEXTOS_EN.api,
};
