import { afterEach, describe, expect, it, vi } from "vitest";
import { clasificarTickets } from "@/lib/tickets/clasificar";
import type { TicketCrudo } from "@/lib/tickets/tipos";

function respuestaSimulada(textos: string[], dimension: string) {
  const etiqueta = dimension === "categoria" ? "software" : "alto";
  return new Response(
    JSON.stringify({
      resultados: textos.map(() => ({ etiqueta, confianza: 0.9 })),
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

function crudo(id: string, asunto = "Mismo asunto", descripcion = "Misma descripción"): TicketCrudo {
  return { id, fecha: new Date(2026, 8, 18), asunto, descripcion };
}

describe("clasificarTickets", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("deduplica textos idénticos y reparte la misma clasificación", async () => {
    const tamanosLote: number[] = [];
    vi.stubGlobal(
      "fetch",
      async (_url: string, init: RequestInit) => {
        const cuerpo = JSON.parse(String(init.body)) as {
          textos: string[];
          dimension: string;
        };
        tamanosLote.push(cuerpo.textos.length);
        return respuestaSimulada(cuerpo.textos, cuerpo.dimension);
      },
    );

    const resultado = await clasificarTickets([
      crudo("a"),
      crudo("b"),
      crudo("c", "Otro asunto", "Otra descripción"),
    ]);

    expect(resultado.total).toBe(3);
    expect(resultado.unicos).toBe(2);
    expect(resultado.repetidos).toBe(1);
    expect(tamanosLote).toEqual([2, 2]);
    expect(resultado.tickets[0].categoria).toEqual(resultado.tickets[1].categoria);
    expect(resultado.tickets[0].urgencia).toEqual(resultado.tickets[1].urgencia);
    expect(resultado.tickets[0].textoRedactado).toBe(
      resultado.tickets[1].textoRedactado,
    );
  });

  it("deduplica tras redactar: dos correos distintos comparten texto", async () => {
    const tamanosLote: number[] = [];
    vi.stubGlobal(
      "fetch",
      async (_url: string, init: RequestInit) => {
        const cuerpo = JSON.parse(String(init.body)) as {
          textos: string[];
          dimension: string;
        };
        tamanosLote.push(cuerpo.textos.length);
        return respuestaSimulada(cuerpo.textos, cuerpo.dimension);
      },
    );

    const resultado = await clasificarTickets([
      crudo("a", "Aviso", "Escribe a ana@empresa.es"),
      crudo("b", "Aviso", "Escribe a luis@empresa.es"),
    ]);

    expect(resultado.unicos).toBe(1);
    expect(resultado.repetidos).toBe(1);
    expect(tamanosLote).toEqual([1, 1]);
    expect(resultado.tickets[0].textoRedactado).toBe(
      resultado.tickets[1].textoRedactado,
    );
    expect(resultado.tickets[0].categoria).toEqual(
      resultado.tickets[1].categoria,
    );
  });

  it("clasifica por separado los textos que siguen siendo distintos", async () => {
    const tamanosLote: number[] = [];
    vi.stubGlobal(
      "fetch",
      async (_url: string, init: RequestInit) => {
        const cuerpo = JSON.parse(String(init.body)) as {
          textos: string[];
          dimension: string;
        };
        tamanosLote.push(cuerpo.textos.length);
        return respuestaSimulada(cuerpo.textos, cuerpo.dimension);
      },
    );

    const resultado = await clasificarTickets([
      crudo("a", "No imprime", "La cola se atasca"),
      crudo("b", "Sin red", "El router no responde"),
    ]);

    expect(resultado.unicos).toBe(2);
    expect(resultado.repetidos).toBe(0);
    expect(tamanosLote).toEqual([2, 2]);
  });

  it("añade áreas adicionales cuando se activa multi-etiqueta", async () => {
    const peticiones: { dimension?: string; multi?: boolean }[] = [];
    vi.stubGlobal(
      "fetch",
      async (_url: string, init: RequestInit) => {
        const cuerpo = JSON.parse(String(init.body)) as {
          textos: string[];
          dimension: string;
          multi?: boolean;
        };
        peticiones.push({ dimension: cuerpo.dimension, multi: cuerpo.multi });
        if (cuerpo.multi) {
          return new Response(
            JSON.stringify({
              multi: true,
              areas: [
                {
                  etiquetas: ["software", "networking"],
                  scores: { software: 0.9, networking: 0.8 },
                },
              ],
              modelo: "mock-1",
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        return respuestaSimulada(cuerpo.textos, cuerpo.dimension);
      },
    );

    const resultado = await clasificarTickets([crudo("a")], {
      multiEtiqueta: true,
      idioma: "en",
    });

    expect(resultado.tickets[0].categoria.etiqueta).toBe("software");
    expect(
      resultado.tickets[0].areasAdicionales?.map((area) => area.etiqueta),
    ).toEqual(["redes"]);
    expect(resultado.tickets[0].areasAdicionales?.[0].score).toBe(0.8);
    expect(resultado.conAreas).toBe(1);
    expect(resultado.modelos).toEqual(["mock-1"]);
    expect(peticiones).toEqual([
      { dimension: "categoria", multi: undefined },
      { dimension: "urgencia", multi: undefined },
      { dimension: "categoria", multi: true },
    ]);
  });

  it("no pide áreas adicionales por defecto", async () => {
    const peticiones: { multi?: boolean }[] = [];
    vi.stubGlobal(
      "fetch",
      async (_url: string, init: RequestInit) => {
        const cuerpo = JSON.parse(String(init.body)) as {
          textos: string[];
          dimension: string;
          multi?: boolean;
        };
        peticiones.push({ multi: cuerpo.multi });
        return respuestaSimulada(cuerpo.textos, cuerpo.dimension);
      },
    );

    const resultado = await clasificarTickets([crudo("a")]);
    expect(peticiones.every((peticion) => peticion.multi === undefined)).toBe(
      true,
    );
    expect(resultado.tickets[0].areasAdicionales).toEqual([]);
    expect(resultado.conAreas).toBe(0);
  });
});
