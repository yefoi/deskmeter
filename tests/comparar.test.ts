import { describe, expect, it } from "vitest";
import { compararTickets } from "@/lib/tickets/comparar";
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

const ANTERIOR = [
  crearTicket("2026-08-10", "hardware", "normal", { tiempo: 10 }),
  crearTicket("2026-08-11", "hardware", "bajo", { tiempo: 12 }),
  crearTicket("2026-08-12", "software", "normal", { tiempo: 8 }),
  crearTicket("2026-08-13", "software", "alto", {
    revisionManual: true,
    tiempo: 6,
  }),
];

const ACTUAL = [
  crearTicket("2026-09-10", "hardware", "critico", { tiempo: 4 }),
  crearTicket("2026-09-11", "redes", "alto", { tiempo: 5 }),
];

describe("compararTickets", () => {
  it("calcula diferencias de volumen, urgencia, revisión y tiempo", () => {
    const comparacion = compararTickets(ACTUAL, ANTERIOR, "semana");

    expect(comparacion.total).toEqual({
      anterior: 4,
      actual: 2,
      delta: -2,
    });
    expect(comparacion.criticos.anterior).toBe(25);
    expect(comparacion.criticos.actual).toBe(100);
    expect(comparacion.criticos.delta).toBe(75);
    expect(comparacion.revision.anterior).toBe(25);
    expect(comparacion.revision.actual).toBe(0);
    expect(comparacion.revision.delta).toBe(-25);
    expect(comparacion.tiempo.anterior).toBe(9);
    expect(comparacion.tiempo.actual).toBe(4.5);
    expect(comparacion.tiempo.delta).toBe(-4.5);
  });

  it("compara el índice del último periodo de cada archivo", () => {
    const comparacion = compararTickets(ACTUAL, ANTERIOR, "semana");
    expect(comparacion.indiceActual).not.toBeNull();
    expect(comparacion.indiceAnterior).not.toBeNull();
    expect(comparacion.indice.delta).toBe(
      Number(
        ((comparacion.indiceActual ?? 0) - (comparacion.indiceAnterior ?? 0)).toFixed(1),
      ),
    );
    expect(comparacion.periodoActual).toContain("sem");
  });

  it("cuenta por categoría en ambos archivos", () => {
    const comparacion = compararTickets(ACTUAL, ANTERIOR, "semana");
    expect(comparacion.porCategoria.hardware).toEqual({
      anterior: 2,
      actual: 1,
      delta: -1,
    });
    expect(comparacion.porCategoria.redes).toEqual({
      anterior: 0,
      actual: 1,
      delta: 1,
    });
    expect(comparacion.porCategoria.software.delta).toBe(-2);
  });

  it("devuelve diferencia nula si falta el tiempo en un archivo", () => {
    const sinTiempo = [crearTicket("2026-09-12", "otro", "bajo")];
    const comparacion = compararTickets(sinTiempo, ANTERIOR, "semana");
    expect(comparacion.tiempo.delta).toBeNull();
  });
});
