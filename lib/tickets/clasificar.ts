import {
  CATEGORIAS,
  UMBRAL_REVISION,
  URGENCIAS,
  valorCanonico,
  type EtiquetaDimension,
} from "./etiquetas";
import { textoClasificable } from "./pii";
import type {
  Asignacion,
  Dimension,
  ResultadoClasificacion,
  Ticket,
  TicketCrudo,
  Tier,
} from "./tipos";

export const LOTE_MAXIMO = 1000;
export const CONCURRENCIA = 2;
export const INTENTOS = 4;

export class ErrorClasificacion extends Error {
  estado?: number;
  reintentarEn?: number;

  constructor(mensaje: string, estado?: number, reintentarEn?: number) {
    super(mensaje);
    this.name = "ErrorClasificacion";
    this.estado = estado;
    this.reintentarEn = reintentarEn;
  }
}

export interface OpcionesClasificacion {
  tier?: Tier;
  loteMaximo?: number;
  concurrencia?: number;
  signal?: AbortSignal;
  alProgreso?: (hechos: number, total: number, fase: Dimension) => void;
}

export function dividirEnLotes<T>(elementos: T[], tamano = LOTE_MAXIMO): T[][] {
  const lotes: T[][] = [];
  for (let indice = 0; indice < elementos.length; indice += tamano) {
    lotes.push(elementos.slice(indice, indice + tamano));
  }
  return lotes;
}

function pausa(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolver, rechazar) => {
    const temporizador = setTimeout(() => {
      signal?.removeEventListener("abort", alAbortar);
      resolver();
    }, ms);
    const alAbortar = () => {
      clearTimeout(temporizador);
      rechazar(new DOMException("Proceso cancelado", "AbortError"));
    };
    if (signal?.aborted) {
      alAbortar();
      return;
    }
    signal?.addEventListener("abort", alAbortar, { once: true });
  });
}

async function enParalelo<T, R>(
  elementos: T[],
  concurrencia: number,
  tarea: (elemento: T) => Promise<R>,
): Promise<R[]> {
  const resultados = new Array<R>(elementos.length);
  let siguiente = 0;
  const trabajadores = Array.from(
    { length: Math.max(1, Math.min(concurrencia, elementos.length)) },
    async () => {
      while (siguiente < elementos.length) {
        const indice = siguiente++;
        resultados[indice] = await tarea(elementos[indice]);
      }
    },
  );
  await Promise.all(trabajadores);
  return resultados;
}

async function clasificarLote(
  textos: string[],
  dimension: Dimension,
  tier: Tier,
  signal?: AbortSignal,
): Promise<ResultadoClasificacion[]> {
  let respuesta: Response;
  try {
    respuesta = await fetch("/api/clasificar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ textos, dimension, tier }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ErrorClasificacion("No se pudo contactar con classifier.dev.");
  }

  if (!respuesta.ok) {
    let mensaje = `classifier.dev respondió ${respuesta.status}.`;
    let reintentarEn: number | undefined;
    try {
      const cuerpo = (await respuesta.json()) as {
        error?: string;
        retryAfter?: number;
      };
      if (typeof cuerpo.error === "string" && cuerpo.error) mensaje = cuerpo.error;
      if (typeof cuerpo.retryAfter === "number") reintentarEn = cuerpo.retryAfter;
    } catch {
      // Respuesta sin JSON: se conserva el mensaje por defecto.
    }
    throw new ErrorClasificacion(mensaje, respuesta.status, reintentarEn);
  }

  const cuerpo = (await respuesta.json()) as {
    resultados?: ResultadoClasificacion[];
  };
  if (!Array.isArray(cuerpo.resultados)) {
    throw new ErrorClasificacion("Respuesta inesperada de classifier.dev.", 502);
  }
  return cuerpo.resultados;
}

function reintentable(error: unknown): boolean {
  if (!(error instanceof ErrorClasificacion)) return true;
  if (error.estado === undefined) return true;
  return error.estado === 429 || error.estado >= 500;
}

async function conReintentos<T>(
  tarea: () => Promise<T>,
  signal?: AbortSignal,
  intentos = INTENTOS,
): Promise<T> {
  let ultimoError: unknown;
  for (let intento = 0; intento < intentos; intento++) {
    try {
      return await tarea();
    } catch (error) {
      ultimoError = error;
      if (signal?.aborted) throw error;
      if (!reintentable(error) || intento === intentos - 1) throw error;
      const espera =
        error instanceof ErrorClasificacion && error.reintentarEn
          ? error.reintentarEn
          : Math.min(30, 2 ** intento);
      await pausa(espera * 1000, signal);
    }
  }
  throw ultimoError;
}

function asignar(
  dimension: Dimension,
  resultado: ResultadoClasificacion | undefined,
): Asignacion {
  const etiquetas: EtiquetaDimension<string>[] =
    dimension === "categoria" ? CATEGORIAS : URGENCIAS;
  const confianza =
    typeof resultado?.confianza === "number" && Number.isFinite(resultado.confianza)
      ? resultado.confianza
      : null;
  const valor = resultado ? valorCanonico(etiquetas, resultado.etiqueta) : null;
  return {
    etiqueta: valor ?? (dimension === "categoria" ? "otro" : "normal"),
    confianza,
    valida: valor !== null,
  };
}

function revisable(asignacion: Asignacion): boolean {
  return (
    !asignacion.valida ||
    asignacion.confianza === null ||
    asignacion.confianza < UMBRAL_REVISION
  );
}

export function componerTicket(
  crudo: TicketCrudo,
  resultadoCategoria: ResultadoClasificacion | undefined,
  resultadoUrgencia: ResultadoClasificacion | undefined,
  textoRedactado: string,
): Ticket {
  const categoria = asignar("categoria", resultadoCategoria);
  const urgencia = asignar("urgencia", resultadoUrgencia);
  const motivosRevision: Dimension[] = [];
  if (revisable(categoria)) motivosRevision.push("categoria");
  if (revisable(urgencia)) motivosRevision.push("urgencia");

  return {
    ...crudo,
    textoRedactado,
    categoria,
    urgencia,
    revisionManual: motivosRevision.length > 0,
    motivosRevision,
  };
}

export async function clasificarTickets(
  tickets: TicketCrudo[],
  opciones: OpcionesClasificacion = {},
): Promise<Ticket[]> {
  const {
    tier = "fast",
    loteMaximo = LOTE_MAXIMO,
    concurrencia = CONCURRENCIA,
    signal,
    alProgreso,
  } = opciones;

  if (tickets.length === 0) return [];

  const textos = tickets.map((ticket) =>
    textoClasificable(ticket.asunto, ticket.descripcion),
  );
  const total = tickets.length * 2;
  let hechos = 0;
  const resultados: Record<Dimension, ResultadoClasificacion[]> = {
    categoria: [],
    urgencia: [],
  };

  for (const dimension of ["categoria", "urgencia"] as const) {
    const lotes = dividirEnLotes(textos, loteMaximo);
    const porLote = await enParalelo(lotes, concurrencia, async (lote) => {
      const clasificaciones = await conReintentos(
        () => clasificarLote(lote, dimension, tier, signal),
        signal,
      );
      hechos += lote.length;
      alProgreso?.(hechos, total, dimension);
      return clasificaciones;
    });
    resultados[dimension] = porLote.flat();
  }

  return tickets.map((ticket, indice) =>
    componerTicket(
      ticket,
      resultados.categoria[indice],
      resultados.urgencia[indice],
      textos[indice],
    ),
  );
}
