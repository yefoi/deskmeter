import {
  etiquetasCategoria,
  etiquetasUrgencia,
  UMBRAL_REVISION,
  valorCanonico,
  type EtiquetaDimension,
} from "./etiquetas";
import type { Idioma } from "./idioma";
import { textoClasificable } from "./pii";
import type { Sector } from "./sectores";
import { TEXTOS_CLASIFICAR } from "./textos";
import type {
  AreaAdicional,
  Asignacion,
  Dimension,
  ResultadoClasificacion,
  ResultadoMulti,
  Ticket,
  TicketCrudo,
  Tier,
} from "./tipos";

export const LOTE_MAXIMO = 1000;
export const CONCURRENCIA = 2;
export const INTENTOS = 4;

export type FaseClasificacion = Dimension | "areas";

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
  idioma?: Idioma;
  sector?: Sector;
  multiEtiqueta?: boolean;
  loteMaximo?: number;
  concurrencia?: number;
  signal?: AbortSignal;
  alProgreso?: (hechos: number, total: number, fase: FaseClasificacion) => void;
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
      rechazar(new DOMException("Process cancelled", "AbortError"));
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

async function pedirClasificacion(
  cuerpo: Record<string, unknown>,
  idioma: Idioma,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  const mensajes = TEXTOS_CLASIFICAR[idioma];
  let respuesta: Response;
  try {
    respuesta = await fetch("/api/clasificar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cuerpo),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ErrorClasificacion(mensajes.sinConexion);
  }

  if (!respuesta.ok) {
    let mensaje = mensajes.respuesta(respuesta.status);
    let reintentarEn: number | undefined;
    try {
      const error = (await respuesta.json()) as {
        error?: string;
        retryAfter?: number;
      };
      if (typeof error.error === "string" && error.error) mensaje = error.error;
      if (typeof error.retryAfter === "number") reintentarEn = error.retryAfter;
    } catch {
      // Respuesta sin JSON: se conserva el mensaje por defecto.
    }
    throw new ErrorClasificacion(mensaje, respuesta.status, reintentarEn);
  }

  return (await respuesta.json()) as Record<string, unknown>;
}

function modeloDe(cuerpo: Record<string, unknown>): string | undefined {
  return typeof cuerpo.modelo === "string" ? cuerpo.modelo : undefined;
}

async function clasificarLote(
  textos: string[],
  dimension: Dimension,
  tier: Tier,
  idioma: Idioma,
  sector: Sector,
  signal?: AbortSignal,
): Promise<{ resultados: ResultadoClasificacion[]; modelo?: string }> {
  const cuerpo = await pedirClasificacion(
    { textos, dimension, tier, idioma, sector },
    idioma,
    signal,
  );
  if (!Array.isArray(cuerpo.resultados)) {
    throw new ErrorClasificacion(TEXTOS_CLASIFICAR[idioma].inesperada, 502);
  }
  return {
    resultados: cuerpo.resultados as ResultadoClasificacion[],
    modelo: modeloDe(cuerpo),
  };
}

async function clasificarLoteMulti(
  textos: string[],
  idioma: Idioma,
  signal?: AbortSignal,
): Promise<{ resultados: ResultadoMulti[]; modelo?: string }> {
  const cuerpo = await pedirClasificacion(
    { textos, dimension: "categoria", tier: "fast", idioma, multi: true },
    idioma,
    signal,
  );
  if (!Array.isArray(cuerpo.areas)) {
    throw new ErrorClasificacion(TEXTOS_CLASIFICAR[idioma].inesperada, 502);
  }
  return {
    resultados: cuerpo.areas as ResultadoMulti[],
    modelo: modeloDe(cuerpo),
  };
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
  idioma: Idioma,
): Asignacion {
  const etiquetas: EtiquetaDimension<string>[] =
    dimension === "categoria"
      ? etiquetasCategoria(idioma)
      : etiquetasUrgencia(idioma);
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

function areasAdicionales(
  resultado: ResultadoMulti | undefined,
  principal: string | undefined,
  idioma: Idioma,
): AreaAdicional[] {
  if (!resultado) return [];
  const etiquetas = etiquetasCategoria(idioma);
  const areas: AreaAdicional[] = [];
  for (const label of resultado.etiquetas) {
    const valor = valorCanonico(etiquetas, label);
    if (!valor || valor === principal) continue;
    if (areas.some((area) => area.etiqueta === valor)) continue;
    const score = resultado.scores?.[label];
    areas.push({
      etiqueta: valor,
      score: typeof score === "number" && Number.isFinite(score) ? score : 0,
    });
  }
  return areas;
}

export function componerTicket(
  crudo: TicketCrudo,
  resultadoCategoria: ResultadoClasificacion | undefined,
  resultadoUrgencia: ResultadoClasificacion | undefined,
  textoRedactado: string,
  idioma: Idioma = "es",
  areas: AreaAdicional[] = [],
): Ticket {
  const categoria = asignar("categoria", resultadoCategoria, idioma);
  const urgencia = asignar("urgencia", resultadoUrgencia, idioma);
  const motivosRevision: Dimension[] = [];
  if (revisable(categoria)) motivosRevision.push("categoria");
  if (revisable(urgencia)) motivosRevision.push("urgencia");

  return {
    ...crudo,
    textoRedactado,
    categoria,
    urgencia,
    areasAdicionales: areas,
    revisionManual: motivosRevision.length > 0,
    motivosRevision,
  };
}

export interface ResultadoClasificacionTickets {
  tickets: Ticket[];
  total: number;
  unicos: number;
  repetidos: number;
  conAreas: number;
  modelos: string[];
}

export async function clasificarTickets(
  tickets: TicketCrudo[],
  opciones: OpcionesClasificacion = {},
): Promise<ResultadoClasificacionTickets> {
  const {
    tier = "fast",
    idioma = "es",
    sector = "general",
    multiEtiqueta = false,
    loteMaximo = LOTE_MAXIMO,
    concurrencia = CONCURRENCIA,
    signal,
    alProgreso,
  } = opciones;

  if (tickets.length === 0) {
    return {
      tickets: [],
      total: 0,
      unicos: 0,
      repetidos: 0,
      conAreas: 0,
      modelos: [],
    };
  }

  const textos = tickets.map((ticket) =>
    textoClasificable(ticket.asunto, ticket.descripcion, undefined, idioma),
  );

  const indicePorTexto = new Map<string, number>();
  const unicos: string[] = [];
  const mapeo: number[] = [];
  for (const texto of textos) {
    let indice = indicePorTexto.get(texto);
    if (indice === undefined) {
      indice = unicos.length;
      indicePorTexto.set(texto, indice);
      unicos.push(texto);
    }
    mapeo.push(indice);
  }

  const numFases = multiEtiqueta ? 3 : 2;
  const total = unicos.length * numFases;
  let hechos = 0;
  const resultados: Record<Dimension, ResultadoClasificacion[]> = {
    categoria: [],
    urgencia: [],
  };
  const modelos = new Set<string>();

  for (const dimension of ["categoria", "urgencia"] as const) {
    const lotes = dividirEnLotes(unicos, loteMaximo);
    const porLote = await enParalelo(lotes, concurrencia, async (lote) => {
      const clasificaciones = await conReintentos(
        () => clasificarLote(lote, dimension, tier, idioma, sector, signal),
        signal,
      );
      hechos += lote.length;
      alProgreso?.(hechos, total, dimension);
      return clasificaciones;
    });
    resultados[dimension] = porLote.flatMap((lote) => lote.resultados);
    for (const lote of porLote) {
      if (lote.modelo) modelos.add(lote.modelo);
    }
  }

  let multis: ResultadoMulti[] = [];
  if (multiEtiqueta) {
    const lotes = dividirEnLotes(unicos, loteMaximo);
    const porLote = await enParalelo(lotes, concurrencia, async (lote) => {
      const areas = await conReintentos(
        () => clasificarLoteMulti(lote, idioma, signal),
        signal,
      );
      hechos += lote.length;
      alProgreso?.(hechos, total, "areas");
      return areas;
    });
    multis = porLote.flatMap((lote) => lote.resultados);
    for (const lote of porLote) {
      if (lote.modelo) modelos.add(lote.modelo);
    }
  }

  let conAreas = 0;
  const clasificados = tickets.map((ticket, indice) => {
    const categoria = resultados.categoria[mapeo[indice]];
    const areas = multiEtiqueta
      ? areasAdicionales(multis[mapeo[indice]], categoria?.etiqueta, idioma)
      : [];
    if (areas.length > 0) conAreas++;
    return componerTicket(
      ticket,
      categoria,
      resultados.urgencia[mapeo[indice]],
      textos[indice],
      idioma,
      areas,
    );
  });

  return {
    tickets: clasificados,
    total: tickets.length,
    unicos: unicos.length,
    repetidos: tickets.length - unicos.length,
    conAreas,
    modelos: [...modelos],
  };
}
