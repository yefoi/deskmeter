import { CATEGORIAS } from "./etiquetas";
import { clavePeriodo, compararPeriodos, etiquetaPeriodo } from "./fechas";
import type {
  Categoria,
  Granularidad,
  ResumenTickets,
  Ticket,
} from "./tipos";

export interface AgregadoPeriodo extends ResumenTickets {
  periodo: string;
  etiqueta: string;
}

export interface MapaCalor {
  periodos: { periodo: string; etiqueta: string; total: number }[];
  categorias: Categoria[];
  conteos: number[][];
  maximo: number;
}

export const CATEGORIAS_ORDEN: Categoria[] = CATEGORIAS.map(
  (categoria) => categoria.valor,
);

function redondear(valor: number, decimales = 1): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

function esCategoria(valor: string): valor is Categoria {
  return CATEGORIAS_ORDEN.includes(valor as Categoria);
}

export function categoriasVacias(): Record<Categoria, number> {
  return {
    hardware: 0,
    software: 0,
    redes: 0,
    cuentas_accesos: 0,
    facturacion: 0,
    otro: 0,
  };
}

export function calcularResumen(tickets: Ticket[]): ResumenTickets {
  const porCategoria = categoriasVacias();
  let criticosAltos = 0;
  let revisionManual = 0;
  const tiempos: number[] = [];

  for (const ticket of tickets) {
    const categoria = esCategoria(ticket.categoria.etiqueta)
      ? ticket.categoria.etiqueta
      : "otro";
    porCategoria[categoria]++;

    if (
      ticket.urgencia.valida &&
      (ticket.urgencia.etiqueta === "critico" || ticket.urgencia.etiqueta === "alto")
    ) {
      criticosAltos++;
    }
    if (ticket.revisionManual) revisionManual++;
    if (typeof ticket.tiempoResolucionHoras === "number") {
      tiempos.push(ticket.tiempoResolucionHoras);
    }
  }

  const total = tickets.length;
  const tiempoMedioResolucion =
    tiempos.length > 0
      ? redondear(tiempos.reduce((suma, valor) => suma + valor, 0) / tiempos.length, 1)
      : null;

  return {
    total,
    porCategoria,
    criticosAltos,
    revisionManual,
    porcentajeCriticosAltos: total > 0 ? redondear((criticosAltos / total) * 100) : 0,
    porcentajeRevisionManual: total > 0 ? redondear((revisionManual / total) * 100) : 0,
    tiempoMedioResolucion,
  };
}

export function agruparPorPeriodo(
  tickets: Ticket[],
  granularidad: Granularidad,
): AgregadoPeriodo[] {
  const grupos = new Map<string, Ticket[]>();
  for (const ticket of tickets) {
    const clave = clavePeriodo(ticket.fecha, granularidad);
    const grupo = grupos.get(clave);
    if (grupo) {
      grupo.push(ticket);
    } else {
      grupos.set(clave, [ticket]);
    }
  }

  return [...grupos.entries()]
    .sort(([a], [b]) => compararPeriodos(a, b))
    .map(([periodo, ticketsPeriodo]) => ({
      periodo,
      etiqueta: etiquetaPeriodo(periodo, granularidad),
      ...calcularResumen(ticketsPeriodo),
    }));
}

export function mapaCalorCategorias(
  tickets: Ticket[],
  granularidad: Granularidad,
): MapaCalor {
  const agregados = agruparPorPeriodo(tickets, granularidad);
  const conteos = CATEGORIAS_ORDEN.map(() => agregados.map(() => 0));
  let maximo = 0;

  const indicePeriodo = new Map(
    agregados.map((agregado, indice) => [agregado.periodo, indice]),
  );

  for (const ticket of tickets) {
    const periodo = clavePeriodo(ticket.fecha, granularidad);
    const columna = indicePeriodo.get(periodo);
    if (columna === undefined) continue;
    const categoria = esCategoria(ticket.categoria.etiqueta)
      ? ticket.categoria.etiqueta
      : "otro";
    const fila = CATEGORIAS_ORDEN.indexOf(categoria);
    conteos[fila][columna]++;
    maximo = Math.max(maximo, conteos[fila][columna]);
  }

  return {
    periodos: agregados.map((agregado) => ({
      periodo: agregado.periodo,
      etiqueta: agregado.etiqueta,
      total: agregado.total,
    })),
    categorias: [...CATEGORIAS_ORDEN],
    conteos,
    maximo,
  };
}
