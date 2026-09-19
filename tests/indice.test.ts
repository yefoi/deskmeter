import { describe, expect, it } from "vitest";
import { calcularIndiceSalud, indicesPorPeriodo } from "@/lib/tickets/indice";
import type { AgregadoPeriodo } from "@/lib/tickets/agregar";

const CONTEXTO = {
  totales: [10, 50, 30],
  tiempos: [1, 40, 20],
};

describe("calcularIndiceSalud", () => {
  it("da 100 al mejor escenario de la serie", () => {
    const resultado = calcularIndiceSalud({
      total: 10,
      porcentajeCriticosAltos: 0,
      porcentajeRevisionManual: 0,
      tiempoMedioResolucion: 1,
      contexto: CONTEXTO,
    });
    expect(resultado.valor).toBe(100);
    expect(resultado.componentes.volumen).toBe(1);
    expect(resultado.componentes.tiempo).toBe(1);
  });

  it("da 0 al peor escenario de la serie", () => {
    const resultado = calcularIndiceSalud({
      total: 50,
      porcentajeCriticosAltos: 100,
      porcentajeRevisionManual: 100,
      tiempoMedioResolucion: 40,
      contexto: CONTEXTO,
    });
    expect(resultado.valor).toBe(0);
  });

  it("renormaliza los pesos cuando no hay tiempo de resolución", () => {
    const resultado = calcularIndiceSalud({
      total: 10,
      porcentajeCriticosAltos: 0,
      porcentajeRevisionManual: 0,
      tiempoMedioResolucion: null,
      contexto: { totales: [10, 50], tiempos: [] },
    });
    expect(resultado.valor).toBe(100);
    expect(resultado.componentes.tiempo).toBeUndefined();
    const suma = Object.values(resultado.pesosUsados).reduce(
      (total, peso) => total + peso,
      0,
    );
    expect(suma).toBeCloseTo(1, 2);
  });

  it("usa 0,5 neutro en volumen cuando solo hay un periodo", () => {
    const resultado = calcularIndiceSalud({
      total: 10,
      porcentajeCriticosAltos: 0,
      porcentajeRevisionManual: 0,
      tiempoMedioResolucion: null,
      contexto: { totales: [10], tiempos: [] },
    });
    expect(resultado.componentes.volumen).toBe(0.5);
    expect(resultado.valor).toBe(87.5);
  });

  it("limita porcentajes fuera de rango", () => {
    const resultado = calcularIndiceSalud({
      total: 10,
      porcentajeCriticosAltos: 150,
      porcentajeRevisionManual: -20,
      tiempoMedioResolucion: null,
      contexto: { totales: [10, 50], tiempos: [] },
    });
    expect(resultado.componentes.criticos).toBe(0);
    expect(resultado.componentes.revision).toBe(1);
  });

  it("baja la nota cuando el tiempo empeora", () => {
    const rapido = calcularIndiceSalud({
      total: 10,
      porcentajeCriticosAltos: 10,
      porcentajeRevisionManual: 10,
      tiempoMedioResolucion: 2,
      contexto: CONTEXTO,
    });
    const lento = calcularIndiceSalud({
      total: 10,
      porcentajeCriticosAltos: 10,
      porcentajeRevisionManual: 10,
      tiempoMedioResolucion: 35,
      contexto: CONTEXTO,
    });
    expect(lento.valor).toBeLessThan(rapido.valor);
  });
});

describe("indicesPorPeriodo", () => {
  const periodos: AgregadoPeriodo[] = [
    {
      periodo: "2026-W36",
      etiqueta: "sem 36 · 2026",
      total: 20,
      porCategoria: {
        hardware: 5,
        software: 5,
        redes: 4,
        cuentas_accesos: 3,
        facturacion: 2,
        otro: 1,
      },
      criticosAltos: 4,
      revisionManual: 3,
      porcentajeCriticosAltos: 20,
      porcentajeRevisionManual: 15,
      tiempoMedioResolucion: 12,
    },
    {
      periodo: "2026-W37",
      etiqueta: "sem 37 · 2026",
      total: 40,
      porCategoria: {
        hardware: 10,
        software: 10,
        redes: 8,
        cuentas_accesos: 6,
        facturacion: 4,
        otro: 2,
      },
      criticosAltos: 16,
      revisionManual: 12,
      porcentajeCriticosAltos: 40,
      porcentajeRevisionManual: 30,
      tiempoMedioResolucion: 24,
    },
  ];

  it("calcula un índice por periodo", () => {
    const indices = indicesPorPeriodo(periodos);
    expect(indices.size).toBe(2);
    const primero = indices.get("2026-W36")!;
    const segundo = indices.get("2026-W37")!;
    expect(primero.valor).toBeGreaterThan(segundo.valor);
  });
});
