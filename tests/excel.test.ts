import { describe, expect, it } from "vitest";
import { celdaATexto, filasACsv } from "@/lib/tickets/excel";

describe("celdaATexto", () => {
  it("convierte fechas a ISO local", () => {
    expect(celdaATexto(new Date(2026, 8, 18))).toBe("2026-09-18");
  });

  it("convierte números, booleanos y nulos", () => {
    expect(celdaATexto(42)).toBe("42");
    expect(celdaATexto(3.5)).toBe("3.5");
    expect(celdaATexto(true)).toBe("true");
    expect(celdaATexto(null)).toBe("");
    expect(celdaATexto(undefined)).toBe("");
  });
});

describe("filasACsv", () => {
  it("convierte una hoja en CSV con encabezados", () => {
    const csv = filasACsv([
      ["fecha", "asunto", "descripcion", "tiempo_resolucion_horas"],
      [new Date(2026, 8, 18), "No imprime", "La cola se atasca", 3.5],
      ["2026-09-19", "Sin red", null, null],
    ]);
    const filas = csv.split("\r\n");
    expect(filas[0]).toBe(
      "fecha,asunto,descripcion,tiempo_resolucion_horas",
    );
    expect(filas[1]).toBe("2026-09-18,No imprime,La cola se atasca,3.5");
    expect(filas[2]).toBe("2026-09-19,Sin red,,");
  });

  it("escapa comas, comillas y saltos de línea", () => {
    const csv = filasACsv([['a,b', 'con "comillas"', "linea\nnueva"]]);
    expect(csv).toBe('"a,b","con ""comillas""","linea\nnueva"');
  });
});
