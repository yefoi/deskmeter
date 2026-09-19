import { describe, expect, it } from "vitest";
import {
  escaparCampoCsv,
  exportarRevisionCsv,
  filtrarRevision,
} from "@/lib/tickets/revision";
import type { Ticket } from "@/lib/tickets/tipos";

function ticket(
  id: string,
  opciones: {
    asunto?: string;
    categoria?: { etiqueta: string; confianza: number | null; valida?: boolean };
    urgencia?: { etiqueta: string; confianza: number | null; valida?: boolean };
    motivos?: ("categoria" | "urgencia")[];
  } = {},
): Ticket {
  const categoria = opciones.categoria ?? {
    etiqueta: "software",
    confianza: 0.55,
  };
  const urgencia = opciones.urgencia ?? { etiqueta: "alto", confianza: 0.9 };
  return {
    id,
    fecha: new Date(2026, 8, 18),
    asunto: opciones.asunto ?? `Asunto ${id}`,
    descripcion: "descripcion",
    textoRedactado: `Texto redactado de ${id}`,
    categoria: { valida: true, ...categoria },
    urgencia: { valida: true, ...urgencia },
    revisionManual: true,
    motivosRevision: opciones.motivos ?? ["categoria"],
  };
}

describe("filtrarRevision", () => {
  const tickets = [
    ticket("a", { motivos: ["categoria"] }),
    ticket("b", {
      motivos: ["urgencia"],
      urgencia: { etiqueta: "normal", confianza: 0.4 },
    }),
    ticket("c", {
      motivos: ["categoria", "urgencia"],
      urgencia: { etiqueta: "critico", confianza: null },
    }),
  ];

  it("filtra por dimensión dudosa", () => {
    expect(
      filtrarRevision(tickets, "categoria", "").map((t) => t.id),
    ).toEqual(["a", "c"]);
    expect(filtrarRevision(tickets, "urgencia", "").map((t) => t.id)).toEqual([
      "b",
      "c",
    ]);
  });

  it("filtra por confianza baja y sin score", () => {
    expect(filtrarRevision(tickets, "baja", "").map((t) => t.id)).toEqual(["b"]);
    expect(filtrarRevision(tickets, "sin_score", "").map((t) => t.id)).toEqual(
      ["c"],
    );
  });

  it("busca por texto redactado", () => {
    expect(filtrarRevision(tickets, "todas", "redactado de b")).toHaveLength(1);
    expect(filtrarRevision(tickets, "todas", "nada")).toHaveLength(0);
  });
});

describe("exportarRevisionCsv", () => {
  it("incluye BOM, cabecera y separador de Excel español", () => {
    const csv = exportarRevisionCsv([ticket("a")]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("fecha;asunto;texto_redactado");
    expect(csv).toContain("2026-09-18");
    expect(csv).toContain("software;0.55");
  });

  it("escapa comillas, punto y coma y saltos de línea", () => {
    expect(escaparCampoCsv('Con "comillas"')).toBe('"Con ""comillas"""');
    expect(escaparCampoCsv("con;punto")).toBe('"con;punto"');
    expect(escaparCampoCsv("linea\nnueva")).toBe('"linea\nnueva"');
    expect(escaparCampoCsv("texto normal")).toBe("texto normal");
  });

  it("deja vacía la confianza ausente", () => {
    const csv = exportarRevisionCsv([
      ticket("sin-score", { categoria: { etiqueta: "otro", confianza: null } }),
    ]);
    const fila = csv.split("\r\n")[1];
    expect(fila).toContain(";;");
  });
});
