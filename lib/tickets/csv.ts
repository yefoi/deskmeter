import Papa from "papaparse";
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
  fecha: ["fecha", "date", "fecha_apertura", "fecha_creacion", "creado", "created_at", "opened_at"],
  asunto: ["asunto", "subject", "titulo", "title", "resumen"],
  descripcion: ["descripcion", "description", "detalle", "cuerpo", "body", "mensaje"],
  estado: ["estado", "status", "situacion"],
  prioridad: ["prioridad", "priority"],
  tiempo_resolucion_horas: [
    "tiempo_resolucion_horas",
    "tiempo_de_resolucion_horas",
    "horas_resolucion",
    "resolucion_horas",
    "tiempo_resolucion",
    "tiempo_de_resolucion",
    "duracion_horas",
    "resolution_hours",
  ],
};

export interface FilaInvalida {
  fila: number;
  motivo: string;
}

export interface ResultadoParseoCsv {
  tickets: TicketCrudo[];
  columnasPresentes: ColumnaLogica[];
  columnasFaltantes: ColumnaLogica[];
  filasDescartadas: number;
  filasInvalidas: FilaInvalida[];
  errores: string[];
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

export function parsearCsv(texto: string, limiteFilas = LIMITE_FILAS): ResultadoParseoCsv {
  const base: ResultadoParseoCsv = {
    tickets: [],
    columnasPresentes: [],
    columnasFaltantes: [],
    filasDescartadas: 0,
    filasInvalidas: [],
    errores: [],
  };

  if (!texto.trim()) {
    return { ...base, errores: ["El archivo está vacío."] };
  }

  const resultado = Papa.parse<Record<string, string>>(texto, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (encabezado) => encabezado.trim(),
  });

  const encabezados = resultado.meta.fields ?? [];
  const columnas = detectarColumnas(encabezados);
  const presentes = [...columnas.keys()];
  const faltantes = COLUMNAS_OBLIGATORIAS.filter((columna) => !columnas.has(columna));

  if (faltantes.length > 0) {
    return {
      ...base,
      columnasPresentes: presentes,
      columnasFaltantes: faltantes,
      errores: [
        `Faltan columnas obligatorias: ${faltantes.join(", ")}. Se esperan fecha, asunto y descripcion.`,
      ],
    };
  }

  const filasInvalidas: FilaInvalida[] = [];
  let descartadas = 0;
  const tickets: TicketCrudo[] = [];

  for (let indice = 0; indice < resultado.data.length; indice++) {
    if (tickets.length >= limiteFilas) {
      base.errores.push(
        `El CSV supera el límite de ${limiteFilas} filas; se procesan las primeras ${limiteFilas}.`,
      );
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
          motivo: `Fecha no válida: "${valorDe(fila, columnas.get("fecha")) || "vacía"}"`,
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
        ? `Fila ${error.row + 2}: ${error.message}`
        : error.message,
    );
  }

  return {
    tickets,
    columnasPresentes: presentes,
    columnasFaltantes: [],
    filasDescartadas: descartadas,
    filasInvalidas,
    errores: base.errores,
  };
}
