import { describe, expect, it } from "vitest";
import { parsearCsv } from "@/lib/tickets/csv";
import {
  etiquetasCategoria,
  etiquetasUrgencia,
  nombreCategoria,
  nombreUrgencia,
  valorCanonico,
} from "@/lib/tickets/etiquetas";
import { descripcionPeriodo, etiquetaPeriodo } from "@/lib/tickets/fechas";
import {
  formatearConfianza,
  formatearPorcentaje,
} from "@/lib/tickets/formato";
import { redactar, textoClasificable } from "@/lib/tickets/pii";
import { exportarRevisionCsv } from "@/lib/tickets/revision";
import type { Ticket } from "@/lib/tickets/tipos";

describe("etiquetas por idioma", () => {
  it("mapea las etiquetas inglesas a valores canónicos", () => {
    expect(valorCanonico(etiquetasCategoria("en"), "accounts & access")).toBe(
      "cuentas_accesos",
    );
    expect(valorCanonico(etiquetasCategoria("en"), "billing")).toBe(
      "facturacion",
    );
    expect(valorCanonico(etiquetasUrgencia("en"), "critical")).toBe("critico");
    expect(valorCanonico(etiquetasUrgencia("en"), "low")).toBe("bajo");
  });

  it("mantiene las etiquetas españolas", () => {
    expect(valorCanonico(etiquetasCategoria("es"), "cuentas y accesos")).toBe(
      "cuentas_accesos",
    );
    expect(valorCanonico(etiquetasUrgencia("es"), "crítico")).toBe("critico");
  });

  it("compone nombres visibles por idioma", () => {
    expect(nombreCategoria("redes", "en")).toBe("networking");
    expect(nombreCategoria("redes", "es")).toBe("redes");
    expect(nombreUrgencia("bajo", "en")).toBe("low");
    expect(nombreUrgencia("bajo", "es")).toBe("bajo");
  });
});

describe("fechas y formato por idioma", () => {
  it("etiqueta los periodos en cada idioma", () => {
    expect(descripcionPeriodo("2026-W38", "semana", "en")).toBe(
      "Week 38 of 2026",
    );
    expect(descripcionPeriodo("2026-W38", "semana", "es")).toBe(
      "Semana 38 de 2026",
    );
    expect(etiquetaPeriodo("2026-W38", "semana", "en")).toContain("wk 38");
    expect(etiquetaPeriodo("2026-W38", "semana", "es")).toContain("sem 38");
  });

  it("formatea porcentajes y confianza en cada idioma", () => {
    expect(formatearPorcentaje(20.5, "en")).toBe("20.5%");
    expect(formatearPorcentaje(20.5, "es")).toBe("20,5 %");
    expect(formatearConfianza(null, "en")).toBe("no score");
    expect(formatearConfianza(null, "es")).toBe("sin score");
  });
});

describe("redacción y CSV por idioma", () => {
  it("usa marcadores en inglés", () => {
    expect(redactar("Call me at 612 345 678", "en")).toBe(
      "Call me at [PHONE]",
    );
    expect(redactar("My DNI is 12345678Z", "en")).toBe("My DNI is [ID]");
    expect(textoClasificable("Subject", "email ana@empresa.es")).toContain(
      "[EMAIL]",
    );
  });

  it("traduce los errores del parser", () => {
    const resultado = parsearCsv(
      "fecha,asunto\n2026-09-01,Algo\n",
      undefined,
      "en",
    );
    expect(resultado.errores[0]).toContain("Missing required columns");
  });

  it("exporta la revisión con cabeceras en inglés", () => {
    const ticket: Ticket = {
      id: "t1",
      fecha: new Date(2026, 8, 18),
      asunto: "Printer down",
      descripcion: "desc",
      textoRedactado: "Printer down desc",
      categoria: { etiqueta: "hardware", confianza: 0.9, valida: true },
      urgencia: { etiqueta: "alto", confianza: 0.5, valida: true },
      revisionManual: true,
      motivosRevision: ["urgencia"],
    };
    const csv = exportarRevisionCsv([ticket], "en");
    expect(csv).toContain("date;subject;redacted_text;category");
    expect(csv).toContain("hardware;0.90;high;0.50;urgencia");
  });
});
