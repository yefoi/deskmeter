import type { AgregadoPeriodo } from "./agregar";

export const VERSION_INDICE = 1;

/**
 * Pesos del índice de salud; si no hay tiempo de resolución, se renormalizan
 * entre los componentes disponibles.
 */
export const PESOS_INDICE = {
  volumen: 0.2,
  criticos: 0.4,
  revision: 0.2,
  tiempo: 0.2,
} as const;

export interface ComponentesIndice {
  volumen: number;
  criticos: number;
  revision: number;
  tiempo?: number;
}

export interface ResultadoIndice {
  version: number;
  /** Salud normalizada de 0 (peor) a 100 (mejor). */
  valor: number;
  componentes: ComponentesIndice;
  pesosUsados: Record<string, number>;
}

export interface EntradaIndice {
  total: number;
  porcentajeCriticosAltos: number;
  porcentajeRevisionManual: number;
  tiempoMedioResolucion: number | null;
  contexto: {
    totales: number[];
    tiempos: number[];
  };
}

function limitar01(valor: number): number {
  return Math.min(1, Math.max(0, valor));
}

function normalizar(valor: number, minimo: number, maximo: number): number {
  if (!Number.isFinite(valor) || maximo === minimo) return 0.5;
  return limitar01((valor - minimo) / (maximo - minimo));
}

function redondear(valor: number, decimales = 3): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

export function calcularIndiceSalud(entrada: EntradaIndice): ResultadoIndice {
  const { totales, tiempos } = entrada.contexto;

  const componentes: ComponentesIndice = {
    volumen:
      totales.length > 1
        ? 1 - normalizar(entrada.total, Math.min(...totales), Math.max(...totales))
        : 0.5,
    criticos: 1 - limitar01(entrada.porcentajeCriticosAltos / 100),
    revision: 1 - limitar01(entrada.porcentajeRevisionManual / 100),
  };

  if (
    entrada.tiempoMedioResolucion !== null &&
    Number.isFinite(entrada.tiempoMedioResolucion) &&
    tiempos.length > 1
  ) {
    componentes.tiempo =
      1 -
      normalizar(
        entrada.tiempoMedioResolucion,
        Math.min(...tiempos),
        Math.max(...tiempos),
      );
  }

  const disponibles = Object.entries(componentes).filter(
    (componente): componente is [keyof ComponentesIndice, number] =>
      componente[1] !== undefined,
  );
  const pesoTotal = disponibles.reduce(
    (total, [clave]) => total + PESOS_INDICE[clave],
    0,
  );

  const pesosUsados: Record<string, number> = {};
  let valor = 0;
  for (const [clave, componente] of disponibles) {
    const peso = PESOS_INDICE[clave] / pesoTotal;
    pesosUsados[clave] = redondear(peso);
    valor += componente * peso;
  }

  return {
    version: VERSION_INDICE,
    valor: redondear(valor * 100, 1),
    componentes: {
      volumen: redondear(componentes.volumen),
      criticos: redondear(componentes.criticos),
      revision: redondear(componentes.revision),
      ...(componentes.tiempo !== undefined
        ? { tiempo: redondear(componentes.tiempo) }
        : {}),
    },
    pesosUsados,
  };
}

export function indicesPorPeriodo(
  agregados: AgregadoPeriodo[],
): Map<string, ResultadoIndice> {
  const totales = agregados.map((agregado) => agregado.total);
  const tiempos = agregados
    .map((agregado) => agregado.tiempoMedioResolucion)
    .filter((valor): valor is number => typeof valor === "number");

  const indices = new Map<string, ResultadoIndice>();
  for (const agregado of agregados) {
    indices.set(
      agregado.periodo,
      calcularIndiceSalud({
        total: agregado.total,
        porcentajeCriticosAltos: agregado.porcentajeCriticosAltos,
        porcentajeRevisionManual: agregado.porcentajeRevisionManual,
        tiempoMedioResolucion: agregado.tiempoMedioResolucion,
        contexto: { totales, tiempos },
      }),
    );
  }
  return indices;
}
