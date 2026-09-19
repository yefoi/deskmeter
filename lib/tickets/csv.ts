import Papa from "papaparse";
import type { Idioma } from "./idioma";
import { TEXTOS_CSV } from "./textos";
import type { TicketCrudo } from "./tipos";
import { parsearFecha } from "./fechas";

export type ColumnaLogica =
  | "fecha"
  | "asunto"
  | "descripcion"
  | "estado"
  | "prioridad"
  | "tiempo_resolucion_horas";

export const COLUMNAS_OBLIGATORIAS: ColumnaLogica[] = [
  "fecha",
  "asunto",
  "descripcion",
];

export const LIMITE_FILAS = 5000;

const ALIAS: Record<ColumnaLogica, string[]> = {
  fecha: [
    "fecha",
    "date",
    "fecha_apertura",
    "fecha_creacion",
    "fecha_de_apertura",
    "fecha_de_creacion",
    "creado",
    "created",
    "opened",
    "created_at",
    "opened_at",
    "date_created",
    "creation_date",
    "created_date",
    "created_time",
    "opened_time",
    "opening_date",
    "open_date",
  ],
  asunto: [
    "asunto",
    "subject",
    "titulo",
    "title",
    "resumen",
    "summary",
    "asunto_del_ticket",
    "ticket_subject",
  ],
  descripcion: [
    "descripcion",
    "description",
    "detalle",
    "cuerpo",
    "body",
    "mensaje",
    "message",
    "contenido",
    "content",
    "details",
    "descripcion_del_ticket",
    "detalle_del_ticket",
  ],
  estado: ["estado", "status", "situacion", "state", "ticket_status", "estado_del_ticket"],
  prioridad: ["prioridad", "priority", "severity", "urgencia", "ticket_priority", "prioridad_del_ticket"],
  tiempo_resolucion_horas: [
    "tiempo_resolucion_horas",
    "tiempo_de_resolucion_horas",
    "horas_resolucion",
    "resolucion_horas",
    "tiempo_resolucion",
    "tiempo_de_resolucion",
    "duracion_horas",
    "resolucion_h",
    "resolution_hours",
    "resolution_time",
    "resolution_time_hours",
    "time_to_resolution",
    "time_to_solve",
    "solution_time",
    "tiempo_de_solucion",
    "full_resolution_time_hours",
  ],
};

export interface FilaInvalida {
  fila: number;
  motivo: string;
}

export type MapeoColumnas = Partial<Record<ColumnaLogica, string>>;

export interface ResultadoParseoCsv {
  tickets: TicketCrudo[];
  columnasPresentes: ColumnaLogica[];
  columnasFaltantes: ColumnaLogica[];
  encabezados: string[];
  vistaPrevia: Record<string, string>[];
  mapeoDetectado: MapeoColumnas;
  filasDescartadas: number;
  filasInvalidas: FilaInvalida[];
  errores: string[];
}

const MAX_CARACTERES_VISTA_PREVIA = 120;

function vistaPreviaDe(filas: Record<string, string>[]): Record<string, string>[] {
  const muestra: Record<string, string>[] = [];
  for (const fila of filas) {
    const valores = Object.values(fila).filter(
      (valor) => (valor ?? "").trim() !== "",
    );
    if (valores.length === 0) continue;
    const recortada: Record<string, string> = {};
    for (const [columna, valor] of Object.entries(fila)) {
      const texto = valor ?? "";
      recortada[columna] =
        texto.length > MAX_CARACTERES_VISTA_PREVIA
          ? `${texto.slice(0, MAX_CARACTERES_VISTA_PREVIA - 1)}…`
          : texto;
    }
    muestra.push(recortada);
    if (muestra.length >= 3) break;
  }
  return muestra;
}

function aplicarMapeo(
  columnas: Map<ColumnaLogica, string>,
  encabezados: string[],
  mapeo?: MapeoColumnas,
) {
  if (!mapeo) return;
  for (const [logica, encabezado] of Object.entries(mapeo) as [
    ColumnaLogica,
    string | undefined,
  ][]) {
    if (encabezado === undefined) continue;
    if (encabezado === "" || !encabezados.includes(encabezado)) {
      columnas.delete(logica);
    } else {
      columnas.set(logica, encabezado);
    }
  }
}

export function normalizarEncabezado(crudo: string): string {
  return crudo
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function detectarColumnas(encabezados: string[]): Map<ColumnaLogica, string> {
  const mapa = new Map<ColumnaLogica, string>();
  const normalizados = encabezados.map((encabezado) => ({
    original: encabezado,
    normalizado: normalizarEncabezado(encabezado),
  }));

  for (const [logica, alias] of Object.entries(ALIAS) as [
    ColumnaLogica,
    string[],
  ][]) {
    const encontrado = normalizados.find((encabezado) =>
      alias.includes(encabezado.normalizado),
    );
    if (encontrado) mapa.set(logica, encontrado.original);
  }

  if (!mapa.has("fecha")) {
    const heuristica = normalizados.find(
      (encabezado) =>
        /(fecha|date|apertura|opened|created|creacion|creado)/.test(
          encabezado.normalizado,
        ) &&
        !/(resol|close|cierre|update|actualiz|reply|respuesta)/.test(
          encabezado.normalizado,
        ),
    );
    if (heuristica) mapa.set("fecha", heuristica.original);
  }

  if (!mapa.has("asunto")) {
    const heuristica = normalizados.find((encabezado) =>
      /(asunto|subject|summary|title|titulo|resumen)/.test(
        encabezado.normalizado,
      ),
    );
    if (heuristica) mapa.set("asunto", heuristica.original);
  }

  if (!mapa.has("descripcion")) {
    const heuristica = normalizados.find((encabezado) =>
      /(descrip|description|detalle|detall|body|cuerpo|message|mensaje|content|contenido|details)/.test(
        encabezado.normalizado,
      ),
    );
    if (heuristica) mapa.set("descripcion", heuristica.original);
  }

  if (!mapa.has("tiempo_resolucion_horas")) {
    const heuristica = normalizados.find(
      (encabezado) =>
        encabezado.normalizado.includes("resol") &&
        (encabezado.normalizado.includes("hora") ||
          encabezado.normalizado.endsWith("_h")),
    );
    if (heuristica) mapa.set("tiempo_resolucion_horas", heuristica.original);
  }

  return mapa;
}

function valorDe(fila: Record<string, string>, columna?: string): string {
  if (!columna) return "";
  return (fila[columna] ?? "").trim();
}

function numeroDeHoras(valor: string): number | undefined {
  if (!valor) return undefined;
  const numero = Number(valor.replace(",", "."));
  if (!Number.isFinite(numero) || numero < 0) return undefined;
  return numero;
}

export function parsearCsv(
  texto: string,
  limiteFilas = LIMITE_FILAS,
  idioma: Idioma = "es",
  mapeo?: MapeoColumnas,
): ResultadoParseoCsv {
  const mensajes = TEXTOS_CSV[idioma];
  const base: ResultadoParseoCsv = {
    tickets: [],
    columnasPresentes: [],
    columnasFaltantes: [],
    encabezados: [],
    vistaPrevia: [],
    mapeoDetectado: {},
    filasDescartadas: 0,
    filasInvalidas: [],
    errores: [],
  };

  if (!texto.trim()) {
    return { ...base, errores: [mensajes.vacio] };
  }

  const resultado = Papa.parse<Record<string, string>>(texto, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (encabezado) => encabezado.trim(),
  });

  const encabezados = resultado.meta.fields ?? [];
  const columnas = detectarColumnas(encabezados);
  aplicarMapeo(columnas, encabezados, mapeo);
  const presentes = [...columnas.keys()];
  const faltantes = COLUMNAS_OBLIGATORIAS.filter((columna) => !columnas.has(columna));
  const vistaPrevia = vistaPreviaDe(resultado.data);
  const mapeoDetectado = Object.fromEntries(columnas) as MapeoColumnas;

  if (faltantes.length > 0) {
    const detectadas =
      encabezados.length > 0
        ? ` ${mensajes.columnasDetectadas(encabezados.join(", "))}`
        : "";
    return {
      ...base,
      columnasPresentes: presentes,
      columnasFaltantes: faltantes,
      encabezados,
      vistaPrevia,
      mapeoDetectado,
      errores: [mensajes.faltan(faltantes.join(", ")) + detectadas],
    };
  }

  const filasInvalidas: FilaInvalida[] = [];
  let descartadas = 0;
  const tickets: TicketCrudo[] = [];

  for (let indice = 0; indice < resultado.data.length; indice++) {
    if (tickets.length >= limiteFilas) {
      base.errores.push(mensajes.limite(limiteFilas));
      break;
    }

    const fila = resultado.data[indice];
    const numeroFila = indice + 2;
    const valores = Object.values(fila).filter((valor) => (valor ?? "").trim() !== "");
    if (valores.length === 0) continue;

    const fecha = parsearFecha(valorDe(fila, columnas.get("fecha")));
    if (!fecha) {
      descartadas++;
      if (filasInvalidas.length < 20) {
        filasInvalidas.push({
          fila: numeroFila,
          motivo: mensajes.fechaInvalida(
            valorDe(fila, columnas.get("fecha")),
          ),
        });
      }
      continue;
    }

    tickets.push({
      id: `fila-${numeroFila}`,
      fecha,
      asunto: valorDe(fila, columnas.get("asunto")),
      descripcion: valorDe(fila, columnas.get("descripcion")),
      estado: valorDe(fila, columnas.get("estado")) || undefined,
      prioridad: valorDe(fila, columnas.get("prioridad")) || undefined,
      tiempoResolucionHoras: numeroDeHoras(
        valorDe(fila, columnas.get("tiempo_resolucion_horas")),
      ),
    });
  }

  for (const error of resultado.errors.slice(0, 5)) {
    base.errores.push(
      error.row !== undefined
        ? mensajes.fila(error.row + 2, error.message)
        : error.message,
    );
  }

  return {
    tickets,
    columnasPresentes: presentes,
    columnasFaltantes: [],
    encabezados,
    vistaPrevia,
    mapeoDetectado,
    filasDescartadas: descartadas,
    filasInvalidas,
    errores: base.errores,
  };
}
