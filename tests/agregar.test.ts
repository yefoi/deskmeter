import { describe, expect, it } from "vitest";
import {
  agruparPorPeriodo,
  calcularResumen,
  mapaCalorCategorias,
} from "@/lib/tickets/agregar";
import { parsearFecha } from "@/lib/tickets/fechas";
import type { Categoria, Ticket, Urgencia } from "@/lib/tickets/tipos";

let contador = 0;

function crearTicket(
  fecha: string,
  categoria: Categoria,
  urgencia: Urgencia,
  opciones: { revisionManual?: boolean; tiempo?: number } = {},
): Ticket {
  contador++;
  return {
    id: `ticket-${contador}`,
    fecha: parsearFecha(fecha)!,
    asunto: `Asunto ${contador}`,
    descripcion: `Descripción ${contador}`,
    textoRedactado: `Asunto ${contador} Descripción ${contador}`,
    categoria: { etiqueta: categoria, confianza: 0.9, valida: true },
    urgencia: { etiqueta: urgencia, confianza: 0.9, valida: true },
    revisionManual: opciones.revisionManual ?? false,
    motivosRevision: opciones.revisionManual ? ["categoria"] : [],
    tiempoResolucionHoras: opciones.tiempo,
  };
}

describe("calcularResumen", () => {
  it("agrega categorías, urgencia, revisión y tiempos", () => {
    const tickets = [
      crearTicket("2026-09-14", "hardware", "critico", { tiempo: 2 }),
      crearTicket("2026-09-15", "software", "alto", { revisionManual: true }),
      crearTicket("2026-09-16", "redes", "normal", { tiempo: 4 }),
      crearTicket("2026-09-17", "hardware", "bajo", {
        revisionManual: true,
        tiempo: 6,
      }),
    ];

    const resumen = calcularResumen(tickets);
    expect(resumen.total).toBe(4);
    expect(resumen.porCategoria.hardware).toBe(2);
    expect(resumen.porCategoria.software).toBe(1);
    expect(resumen.criticosAltos).toBe(2);
    expect(resumen.porcentajeCriticosAltos).toBe(50);
    expect(resumen.revisionManual).toBe(2);
    expect(resumen.porcentajeRevisionManual).toBe(50);
    expect(resumen.tiempoMedioResolucion).toBe(4);
  });

  it("devuelve tiempo nulo si no hay columna", () => {
    const resumen = calcularResumen([crearTicket("2026-09-14", "otro", "bajo")]);
    expect(resumen.tiempoMedioResolucion).toBeNull();
    expect(resumen.porcentajeCriticosAltos).toBe(0);
  });
});

describe("agruparPorPeriodo", () => {
  const tickets = [
    crearTicket("2026-09-14", "hardware", "critico", { tiempo: 2 }),
    crearTicket("2026-09-16", "software", "normal"),
    crearTicket("2026-09-21", "redes", "alto", { tiempo: 10 }),
  ];

  it("agrupa por semana ISO en orden cronológico", () => {
    const agregados = agruparPorPeriodo(tickets, "semana");
    expect(agregados.map((agregado) => agregado.periodo)).toEqual([
      "2026-W38",
      "2026-W39",
    ]);
    expect(agregados[0].total).toBe(2);
    expect(agregados[0].porCategoria.hardware).toBe(1);
    expect(agregados[1].total).toBe(1);
    expect(agregados[1].porcentajeCriticosAltos).toBe(100);
  });

  it("agrupa por mes natural", () => {
    const agregados = agruparPorPeriodo(tickets, "mes");
    expect(agregados).toHaveLength(1);
    expect(agregados[0].periodo).toBe("2026-09");
    expect(agregados[0].total).toBe(3);
  });
});

describe("mapaCalorCategorias", () => {
  it("cuenta cada categoría por periodo", () => {
    const tickets = [
      crearTicket("2026-09-14", "hardware", "critico"),
      crearTicket("2026-09-15", "hardware", "normal"),
      crearTicket("2026-09-16", "software", "alto"),
      crearTicket("2026-09-21", "hardware", "bajo"),
    ];
    const mapa = mapaCalorCategorias(tickets, "semana");
    expect(mapa.periodos).toHaveLength(2);
    expect(mapa.categorias).toContain("hardware");

    const filaHardware = mapa.categorias.indexOf("hardware");
    const filaSoftware = mapa.categorias.indexOf("software");
    expect(mapa.conteos[filaHardware]).toEqual([2, 1]);
    expect(mapa.conteos[filaSoftware]).toEqual([1, 0]);
    expect(mapa.maximo).toBe(2);
  });
});
