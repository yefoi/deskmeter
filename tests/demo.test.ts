import { describe, expect, it } from "vitest";
import { generarTicketsDemo } from "@/lib/tickets/demo";
import { semanaISO } from "@/lib/tickets/fechas";

describe("generarTicketsDemo", () => {
  it("genera la cantidad pedida y es determinista", () => {
    const primera = generarTicketsDemo(40, new Date(2026, 8, 18));
    const segunda = generarTicketsDemo(40, new Date(2026, 8, 18));
    expect(primera).toHaveLength(40);
    expect(primera[0].asunto).toBe(segunda[0].asunto);
  });

  it("reparte los tickets en varias semanas", () => {
    const tickets = generarTicketsDemo(120, new Date(2026, 8, 18));
    const semanas = new Set(tickets.map((ticket) => semanaISO(ticket.fecha)));
    expect(semanas.size).toBeGreaterThan(8);
  });

  it("incluye tickets en revisión manual y tiempos de resolución", () => {
    const tickets = generarTicketsDemo(120, new Date(2026, 8, 18));
    expect(tickets.some((ticket) => ticket.revisionManual)).toBe(true);
    expect(
      tickets.some(
        (ticket) => typeof ticket.tiempoResolucionHoras === "number",
      ),
    ).toBe(true);
  });

  it("redacta los datos personales de los textos", () => {
    const tickets = generarTicketsDemo(120, new Date(2026, 8, 18));
    expect(tickets.every((ticket) => !ticket.textoRedactado.includes("@"))).toBe(
      true,
    );
    expect(
      tickets.some((ticket) => ticket.textoRedactado.includes("[EMAIL]")),
    ).toBe(true);
  });

  it("no repite textos exactos entre tickets demo", () => {
    const tickets = generarTicketsDemo(180, new Date(2026, 8, 18));
    const textos = new Set(tickets.map((ticket) => ticket.textoRedactado));
    expect(textos.size).toBe(tickets.length);
    expect(
      tickets.every((ticket) => /Ref\. INC-\d{4}\./.test(ticket.descripcion)),
    ).toBe(true);
  });

  it("clasifica igual los tickets del mismo tema aunque cambie el detalle", () => {
    const tickets = generarTicketsDemo(180, new Date(2026, 8, 18));
    const porAsunto = new Map<string, (typeof tickets)[number][]>();
    for (const ticket of tickets) {
      const grupo = porAsunto.get(ticket.asunto) ?? [];
      grupo.push(ticket);
      porAsunto.set(ticket.asunto, grupo);
    }
    expect(porAsunto.size).toBeLessThan(tickets.length);
    for (const grupo of porAsunto.values()) {
      const referencia = grupo[0];
      for (const ticket of grupo) {
        expect(ticket.categoria).toEqual(referencia.categoria);
        expect(ticket.urgencia).toEqual(referencia.urgencia);
      }
    }
  });

  it("genera la demo en inglés con etiquetas válidas", () => {
    const tickets = generarTicketsDemo(60, new Date(2026, 8, 18), "en");
    expect(
      tickets.every((ticket) => ticket.categoria.valida && ticket.urgencia.valida),
    ).toBe(true);
    expect(
      tickets.some((ticket) => ticket.textoRedactado.includes("[PHONE]")),
    ).toBe(true);
  });
});
