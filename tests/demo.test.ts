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
});
