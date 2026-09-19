import { componerTicket } from "./clasificar";
import { etiquetasCategoria, etiquetasUrgencia } from "./etiquetas";
import type { Idioma } from "./idioma";
import { textoClasificable } from "./pii";
import type { Categoria, Ticket, TicketCrudo, Urgencia } from "./tipos";

const CATEGORIAS_PESO: [Categoria, number][] = [
  ["software", 0.3],
  ["cuentas_accesos", 0.2],
  ["redes", 0.18],
  ["hardware", 0.17],
  ["facturacion", 0.1],
  ["otro", 0.05],
];

const URGENCIAS_POR_CATEGORIA: Record<Categoria, [Urgencia, number][]> = {
  redes: [
    ["critico", 0.18],
    ["alto", 0.25],
    ["normal", 0.39],
    ["bajo", 0.18],
  ],
  software: [
    ["critico", 0.08],
    ["alto", 0.22],
    ["normal", 0.5],
    ["bajo", 0.2],
  ],
  cuentas_accesos: [
    ["critico", 0.05],
    ["alto", 0.14],
    ["normal", 0.51],
    ["bajo", 0.3],
  ],
  hardware: [
    ["critico", 0.1],
    ["alto", 0.24],
    ["normal", 0.41],
    ["bajo", 0.25],
  ],
  facturacion: [
    ["critico", 0.03],
    ["alto", 0.11],
    ["normal", 0.46],
    ["bajo", 0.4],
  ],
  otro: [
    ["critico", 0.02],
    ["alto", 0.08],
    ["normal", 0.4],
    ["bajo", 0.5],
  ],
};

interface Plantilla {
  asunto: string;
  descripcion: string;
}

const PLANTILLAS: Record<Idioma, Record<Categoria, Plantilla[]>> = {
  es: {
    hardware: [
      {
        asunto: "La impresora de planta 2 no imprime",
        descripcion:
          "Desde esta mañana los trabajos se quedan en cola y la luz parpadea en naranja. Ya hemos reiniciado la impresora y cambiado el tóner.",
      },
      {
        asunto: "Portátil no enciende tras la actualización",
        descripcion:
          "El portátil se apagó durante la actualización y ahora no pasa del logotipo. Necesito recuperar los archivos del escritorio cuanto antes.",
      },
      {
        asunto: "Dos monitores parpadean al conectarlos a la base",
        descripcion:
          "Al usar la docking station las pantallas parpadean cada pocos segundos. Con el cable directo funciona bien, así que sospecho del adaptador.",
      },
    ],
    software: [
      {
        asunto: "Error al exportar el informe mensual",
        descripcion:
          "Al pulsar exportar aparece un error inesperado y la aplicación se cierra. Ocurre con cualquier rango de fechas desde la última actualización.",
      },
      {
        asunto: "La aplicación de facturación va muy lenta",
        descripcion:
          "Desde hace unos días las pantallas tardan más de un minuto en cargar. El resto de aplicaciones funcionan con normalidad.",
      },
      {
        asunto: "No puedo instalar la nueva versión del ERP",
        descripcion:
          "El instalador se queda al 40 % y muestra un aviso de permisos insuficientes. Lo he probado con permisos de administrador y sigue igual.",
      },
    ],
    redes: [
      {
        asunto: "Sin conexión a internet en toda la oficina",
        descripcion:
          "El router muestra la luz roja y nadie del equipo puede navegar ni acceder a recursos compartidos. Es urgente porque atendemos clientes por teléfono.",
      },
      {
        asunto: "La VPN se desconecta cada pocos minutos",
        descripcion:
          "Trabajando desde casa la VPN se cae cada cinco o diez minutos y tengo que volver a conectarme. Con cable va algo mejor que con wifi.",
      },
      {
        asunto: "El correo no sincroniza en el móvil",
        descripcion:
          "Desde ayer no recibo correo en el teléfono corporativo, aunque en el ordenador sí. No he cambiado la contraseña ni la configuración.",
      },
    ],
    cuentas_accesos: [
      {
        asunto: "Contraseña caducada y no puedo cambiarla",
        descripcion:
          "Al iniciar sesión me pide cambiar la contraseña, pero la nueva no cumple los requisitos y no me dice cuáles son. Llevo dos días sin poder entrar al correo.",
      },
      {
        asunto: "Alta de usuario para la nueva incorporación",
        descripcion:
          "Necesitamos dar de alta a una persona que entra el lunes: correo, acceso a la carpeta compartida de proyectos y al sistema de tickets.",
      },
      {
        asunto: "Permisos insuficientes en la carpeta de dirección",
        descripcion:
          "Me han cambiado de departamento y necesito acceso de lectura a la carpeta de dirección para preparar los informes trimestrales.",
      },
    ],
    facturacion: [
      {
        asunto: "Factura duplicada del mes pasado",
        descripcion:
          "Nos ha llegado dos veces la factura del servicio de soporte. Adjunto los dos números de referencia para que anulen el duplicado.",
      },
      {
        asunto: "Cambio de datos de facturación",
        descripcion:
          "Hemos cambiado el CIF y la dirección fiscal de la empresa. Necesitamos actualizar los datos para que las próximas facturas salgan correctamente.",
      },
      {
        asunto: "Cargo no reconocido en la renovación de licencias",
        descripcion:
          "El importe de la renovación es superior al acordado. Queremos revisar el desglose de licencias antes de proceder al pago.",
      },
    ],
    otro: [
      {
        asunto: "Solicitud de formación sobre la herramienta interna",
        descripcion:
          "El equipo nuevo necesita una sesión introductoria sobre la herramienta de gestión de proyectos. ¿Es posible agendar una hora la próxima semana?",
      },
      {
        asunto: "Petición de segundo teclado para puesto compartido",
        descripcion:
          "El puesto compartido de recepción solo tiene un teclado y varias personas lo usan a diario. Sería útil disponer de un segundo juego.",
      },
      {
        asunto: "Duda sobre el procedimiento de bajas",
        descripcion:
          "¿Cuál es el circuito para dar de baja a un usuario que deja la empresa? Queremos dejarlo documentado para el equipo de administración.",
      },
    ],
  },
  en: {
    hardware: [
      {
        asunto: "The printer on the 2nd floor won't print",
        descripcion:
          "Since this morning jobs stay queued and the light blinks orange. We already restarted the printer and replaced the toner.",
      },
      {
        asunto: "Laptop won't boot after the update",
        descripcion:
          "It shut down mid-update and now it doesn't get past the logo. I need the files on the desktop back as soon as possible.",
      },
      {
        asunto: "Both monitors flicker on the dock",
        descripcion:
          "Using the docking station the screens flicker every few seconds. Direct cable works fine, so I suspect the adapter.",
      },
    ],
    software: [
      {
        asunto: "Error exporting the monthly report",
        descripcion:
          "Pressing export throws an unexpected error and the app closes. It happens with any date range since the last update.",
      },
      {
        asunto: "The billing app is very slow",
        descripcion:
          "For a few days now screens take over a minute to load. Every other app works fine.",
      },
      {
        asunto: "Can't install the new ERP version",
        descripcion:
          "The installer stops at 40% with a permissions warning. I tried as administrator and it's the same.",
      },
    ],
    redes: [
      {
        asunto: "No internet in the whole office",
        descripcion:
          "The router shows a red light and nobody on the team can browse or reach shared drives. This is urgent: we attend customers by phone.",
      },
      {
        asunto: "VPN drops every few minutes",
        descripcion:
          "Working from home the VPN disconnects every five or ten minutes and I have to reconnect. Cable is slightly better than wifi.",
      },
      {
        asunto: "Email won't sync on my phone",
        descripcion:
          "Since yesterday I don't get email on the corporate phone, though it works on the computer. I haven't changed the password or settings.",
      },
    ],
    cuentas_accesos: [
      {
        asunto: "Expired password and I can't change it",
        descripcion:
          "Logging in asks me to change the password, but the new one doesn't meet the requirements and it won't tell me which. I've been locked out of email for two days.",
      },
      {
        asunto: "New user account for the new hire",
        descripcion:
          "We need an account for someone starting Monday: email, access to the shared projects folder and the ticketing system.",
      },
      {
        asunto: "Not enough permissions in the management folder",
        descripcion:
          "I moved departments and need read access to the management folder to prepare the quarterly reports.",
      },
    ],
    facturacion: [
      {
        asunto: "Duplicate invoice from last month",
        descripcion:
          "The support service invoice arrived twice. I'm attaching both reference numbers so you can cancel the duplicate.",
      },
      {
        asunto: "Billing details update",
        descripcion:
          "We changed the company tax ID and billing address. Please update the details so future invoices are correct.",
      },
      {
        asunto: "Unrecognized charge on the license renewal",
        descripcion:
          "The renewal amount is higher than agreed. We want to review the license breakdown before paying.",
      },
    ],
    otro: [
      {
        asunto: "Training request for the internal tool",
        descripcion:
          "The new team needs an introductory session on the project management tool. Could we schedule an hour next week?",
      },
      {
        asunto: "Second keyboard for the shared desk",
        descripcion:
          "The reception shared desk only has one keyboard and several people use it daily. A second set would help.",
      },
      {
        asunto: "Question about the offboarding process",
        descripcion:
          "What's the process to deactivate a user who's leaving? We want to document it for the admin team.",
      },
    ],
  },
};

const FRAGMENTOS_PII: Record<Idioma, string[]> = {
  es: [
    " Podéis escribirme a maria.lopez@empresa.es o llamarme al 612 345 678.",
    " Mi DNI es 12345678Z por si hace falta para tramitar la incidencia.",
    " Mi extensión es la 954 12 34 56 y el correo de contacto es soporte@empresa.com.",
  ],
  en: [
    " You can reach me at maria.lopez@company.com or 612 345 678.",
    " My ID is 12345678Z if you need it to process the ticket.",
    " My extension is 954 12 34 56 and the contact email is support@company.com.",
  ],
};

const DETALLES: Record<Idioma, string[]> = {
  es: [
    "Afecta solo a mi puesto.",
    "Le pasa a más gente del equipo.",
    "Llevo así desde ayer.",
    "Es la segunda vez esta semana.",
    "He probado a reiniciar sin éxito.",
    "Adjunto captura por si ayuda.",
    "Está bloqueando tareas del equipo.",
    "No corre prisa, pero quiero resolverlo.",
  ],
  en: [
    "It only affects my desk.",
    "More people on the team have the same issue.",
    "It has been like this since yesterday.",
    "It is the second time this week.",
    "I tried restarting with no luck.",
    "I am attaching a screenshot in case it helps.",
    "It is blocking team tasks.",
    "It is not urgent, but I would like it fixed.",
  ],
};

const PRIORIDAD: Record<Idioma, Record<Urgencia, string>> = {
  es: { critico: "urgente", alto: "alta", normal: "media", bajo: "baja" },
  en: { critico: "urgent", alto: "high", normal: "medium", bajo: "low" },
};

const ESTADOS: Record<Idioma, { cerrado: string; abierto: string; enProgreso: string }> = {
  es: { cerrado: "cerrado", abierto: "abierto", enProgreso: "en_progreso" },
  en: { cerrado: "closed", abierto: "open", enProgreso: "in_progress" },
};

function prng(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let valor = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    valor = (valor + Math.imul(valor ^ (valor >>> 7), 61 | valor)) ^ valor;
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
  };
}

function hashTexto(texto: string): number {
  let hash = 2166136261;
  for (let indice = 0; indice < texto.length; indice++) {
    hash ^= texto.charCodeAt(indice);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function elegir<T>(opciones: [T, number][], valor: number): T {
  let acumulado = 0;
  for (const [opcion, peso] of opciones) {
    acumulado += peso;
    if (valor <= acumulado) return opcion;
  }
  return opciones[opciones.length - 1][0];
}

function confianza(aleatorio: () => number): number | null {
  const valor = aleatorio();
  if (valor < 0.72) return Number((0.72 + aleatorio() * 0.27).toFixed(2));
  if (valor < 0.86) return Number((0.45 + aleatorio() * 0.24).toFixed(2));
  return null;
}

function horasResolucion(urgencia: Urgencia, aleatorio: () => number): number {
  const rangos: Record<Urgencia, [number, number]> = {
    critico: [1, 8],
    alto: [4, 24],
    normal: [8, 72],
    bajo: [16, 120],
  };
  const [minimo, maximo] = rangos[urgencia];
  return Number((minimo + aleatorio() * (maximo - minimo)).toFixed(1));
}

export function generarTicketsDemo(
  cantidad = 180,
  fechaFin = new Date(),
  idioma: Idioma = "es",
): Ticket[] {
  const aleatorio = prng(20260918);
  const tickets: Ticket[] = [];
  const promptsCategoria = new Map(
    etiquetasCategoria(idioma).map((etiqueta) => [etiqueta.valor, etiqueta.prompt]),
  );
  const promptsUrgencia = new Map(
    etiquetasUrgencia(idioma).map((etiqueta) => [etiqueta.valor, etiqueta.prompt]),
  );
  const plantillas = PLANTILLAS[idioma];
  const fragmentos = FRAGMENTOS_PII[idioma];
  const detalles = DETALLES[idioma];
  const estados = ESTADOS[idioma];

  for (let indice = 0; indice < cantidad; indice++) {
    const diasAtras = Math.floor(aleatorio() * 97);
    const fecha = new Date(
      fechaFin.getFullYear(),
      fechaFin.getMonth(),
      fechaFin.getDate() - diasAtras,
      8 + Math.floor(aleatorio() * 10),
      Math.floor(aleatorio() * 60),
    );

    const categoria = elegir(CATEGORIAS_PESO, aleatorio());
    const opciones = plantillas[categoria];
    const plantilla = opciones[Math.floor(aleatorio() * opciones.length)];
    const detalle = detalles[Math.floor(aleatorio() * detalles.length)];
    const referencia = `Ref. INC-${String(indice + 1).padStart(4, "0")}.`;

    let descripcion = `${plantilla.descripcion} ${detalle} ${referencia}`;
    if (aleatorio() < 0.16) {
      descripcion += fragmentos[Math.floor(aleatorio() * fragmentos.length)];
    }

    const textoRedactado = textoClasificable(
      plantilla.asunto,
      descripcion,
      undefined,
      idioma,
    );
    const clasificacion = prng(
      hashTexto(`${idioma}|${plantilla.asunto}|${plantilla.descripcion}`),
    );
    const urgencia = elegir(URGENCIAS_POR_CATEGORIA[categoria], clasificacion());
    const confianzaCategoria = confianza(clasificacion);
    const confianzaUrgencia = confianza(clasificacion);

    const resuelto = aleatorio() < 0.78;
    const crudo: TicketCrudo = {
      id: `demo-${indice + 1}`,
      fecha,
      asunto: plantilla.asunto,
      descripcion,
      estado: resuelto
        ? estados.cerrado
        : aleatorio() < 0.5
          ? estados.abierto
          : estados.enProgreso,
      prioridad: PRIORIDAD[idioma][urgencia],
      tiempoResolucionHoras: resuelto
        ? horasResolucion(urgencia, aleatorio)
        : undefined,
    };

    tickets.push(
      componerTicket(
        crudo,
        {
          etiqueta: promptsCategoria.get(categoria) ?? categoria,
          confianza: confianzaCategoria,
        },
        {
          etiqueta: promptsUrgencia.get(urgencia) ?? urgencia,
          confianza: confianzaUrgencia,
        },
        textoRedactado,
        idioma,
      ),
    );
  }

  return tickets;
}
