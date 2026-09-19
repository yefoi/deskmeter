import { componerTicket } from "./clasificar";
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

const ETIQUETA_CATEGORIA: Record<Categoria, string> = {
  hardware: "hardware",
  software: "software",
  redes: "redes",
  cuentas_accesos: "cuentas y accesos",
  facturacion: "facturación",
  otro: "otro",
};

const ETIQUETA_URGENCIA: Record<Urgencia, string> = {
  critico: "crítico",
  alto: "alto",
  normal: "normal",
  bajo: "bajo",
};

const PRIORIDAD_POR_URGENCIA: Record<Urgencia, string> = {
  critico: "urgente",
  alto: "alta",
  normal: "media",
  bajo: "baja",
};

interface Plantilla {
  asunto: string;
  descripcion: string;
}

const PLANTILLAS: Record<Categoria, Plantilla[]> = {
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
};

const FRAGMENTOS_PII = [
  " Podéis escribirme a maria.lopez@empresa.es o llamarme al 612 345 678.",
  " Mi DNI es 12345678Z por si hace falta para tramitar la incidencia.",
  " Mi extensión es la 954 12 34 56 y el correo de contacto es soporte@empresa.com.",
];

function prng(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let valor = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    valor = (valor + Math.imul(valor ^ (valor >>> 7), 61 | valor)) ^ valor;
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
  };
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

export function generarTicketsDemo(cantidad = 180, fechaFin = new Date()): Ticket[] {
  const aleatorio = prng(20260918);
  const tickets: Ticket[] = [];

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
    const urgencia = elegir(URGENCIAS_POR_CATEGORIA[categoria], aleatorio());
    const plantilla =
      PLANTILLAS[categoria][Math.floor(aleatorio() * PLANTILLAS[categoria].length)];

    let descripcion = plantilla.descripcion;
    if (aleatorio() < 0.16) {
      descripcion += FRAGMENTOS_PII[Math.floor(aleatorio() * FRAGMENTOS_PII.length)];
    }

    const resuelto = aleatorio() < 0.78;
    const crudo: TicketCrudo = {
      id: `demo-${indice + 1}`,
      fecha,
      asunto: plantilla.asunto,
      descripcion,
      estado: resuelto ? "cerrado" : aleatorio() < 0.5 ? "abierto" : "en_progreso",
      prioridad: PRIORIDAD_POR_URGENCIA[urgencia],
      tiempoResolucionHoras: resuelto
        ? horasResolucion(urgencia, aleatorio)
        : undefined,
    };

    tickets.push(
      componerTicket(
        crudo,
        { etiqueta: ETIQUETA_CATEGORIA[categoria], confianza: confianza(aleatorio) },
        { etiqueta: ETIQUETA_URGENCIA[urgencia], confianza: confianza(aleatorio) },
        textoClasificable(crudo.asunto, crudo.descripcion),
      ),
    );
  }

  return tickets;
}
