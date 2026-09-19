import { CATEGORIAS_ORDEN, agruparPorPeriodo, calcularResumen } from "./agregar";
import type { Idioma } from "./idioma";
import { indicesPorPeriodo } from "./indice";
import type {
  Categoria,
  Granularidad,
  ResumenTickets,
  Ticket,
} from "./tipos";

export interface Diferencia {
  anterior: number | null;
  actual: number | null;
  delta: number | null;
}

export interface ComparacionPeriodos {
  resumenAnterior: ResumenTickets;
  resumenActual: ResumenTickets;
  indiceAnterior: number | null;
  indiceActual: number | null;
  indice: Diferencia;
  total: Diferencia;
  criticos: Diferencia;
  revision: Diferencia;
  tiempo: Diferencia;
  porCategoria: Record<Categoria, Diferencia>;
  periodoAnterior: string | null;
  periodoActual: string | null;
}

function redondear(valor: number, decimales = 1): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

function diferencia(
  anterior: number | null,
  actual: number | null,
): Diferencia {
  if (anterior === null || actual === null) {
    return { anterior, actual, delta: null };
  }
  return { anterior, actual, delta: redondear(actual - anterior) };
}

export function compararTickets(
  ticketsActual: Ticket[],
  ticketsAnterior: Ticket[],
  granularidad: Granularidad,
  idioma: Idioma = "es",
): ComparacionPeriodos {
  const resumenActual = calcularResumen(ticketsActual);
  const resumenAnterior = calcularResumen(ticketsAnterior);

  const agregadosActual = agruparPorPeriodo(
    ticketsActual,
    granularidad,
    idioma,
  );
  const agregadosAnterior = agruparPorPeriodo(
    ticketsAnterior,
    granularidad,
    idioma,
  );
  const indices = indicesPorPeriodo([...agregadosActual, ...agregadosAnterior]);

  const ultimoActual = agregadosActual.at(-1);
  const ultimoAnterior = agregadosAnterior.at(-1);
  const indiceActual = ultimoActual
    ? (indices.get(ultimoActual.periodo)?.valor ?? null)
    : null;
  const indiceAnterior = ultimoAnterior
    ? (indices.get(ultimoAnterior.periodo)?.valor ?? null)
    : null;

  const porCategoria = Object.fromEntries(
    CATEGORIAS_ORDEN.map((categoria) => [
      categoria,
      diferencia(
        resumenAnterior.porCategoria[categoria],
        resumenActual.porCategoria[categoria],
      ),
    ]),
  ) as Record<Categoria, Diferencia>;

  return {
    resumenAnterior,
    resumenActual,
    indiceAnterior,
    indiceActual,
    indice: diferencia(indiceAnterior, indiceActual),
    total: diferencia(resumenAnterior.total, resumenActual.total),
    criticos: diferencia(
      resumenAnterior.porcentajeCriticosAltos,
      resumenActual.porcentajeCriticosAltos,
    ),
    revision: diferencia(
      resumenAnterior.porcentajeRevisionManual,
      resumenActual.porcentajeRevisionManual,
    ),
    tiempo: diferencia(
      resumenAnterior.tiempoMedioResolucion,
      resumenActual.tiempoMedioResolucion,
    ),
    porCategoria,
    periodoAnterior: ultimoAnterior?.etiqueta ?? null,
    periodoActual: ultimoActual?.etiqueta ?? null,
  };
}
