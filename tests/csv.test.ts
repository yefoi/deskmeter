import { describe, expect, it } from "vitest";
import { normalizarEncabezado, parsearCsv } from "@/lib/tickets/csv";

const CSV_MINIMO = `fecha,asunto,descripcion
18/09/2026,La impresora no imprime,Se queda la cola atascada
2026-09-19,VPN inestable,"Se cae, sobre todo por la tarde"
`;

describe("normalizarEncabezado", () => {
  it("quita tildes, espacios y signos", () => {
    expect(normalizarEncabezado("Descripción")).toBe("descripcion");
    expect(normalizarEncabezado("Tiempo de resolución (h)")).toBe(
      "tiempo_de_resolucion_h",
    );
    expect(normalizarEncabezado("  Fecha ")).toBe("fecha");
  });
});

describe("parsearCsv", () => {
  it("lee un CSV mínimo", () => {
    const resultado = parsearCsv(CSV_MINIMO);
    expect(resultado.columnasFaltantes).toEqual([]);
    expect(resultado.tickets).toHaveLength(2);
    expect(resultado.tickets[0].asunto).toBe("La impresora no imprime");
    expect(resultado.tickets[1].descripcion).toBe(
      "Se cae, sobre todo por la tarde",
    );
  });

  it("acepta alias de columnas en inglés", () => {
    const csv = `date,subject,description
2026-09-01,No arranca el portátil,Se queda en el logo
`;
    const resultado = parsearCsv(csv);
    expect(resultado.tickets).toHaveLength(1);
    expect(resultado.tickets[0].asunto).toBe("No arranca el portátil");
  });

  it("detecta las columnas obligatorias que faltan", () => {
    const resultado = parsearCsv("fecha,asunto\n2026-09-01,Algo\n");
    expect(resultado.tickets).toHaveLength(0);
    expect(resultado.columnasFaltantes).toEqual(["descripcion"]);
    expect(resultado.errores[0]).toContain("columnas obligatorias");
  });

  it("lee las columnas opcionales con coma decimal", () => {
    const csv = `fecha,asunto,descripcion,estado,prioridad,tiempo_resolucion_horas
2026-09-01,Mejorar lentitud,El ERP tarda mucho,resuelto,alta,"3,5"
`;
    const resultado = parsearCsv(csv);
    expect(resultado.tickets[0].estado).toBe("resuelto");
    expect(resultado.tickets[0].prioridad).toBe("alta");
    expect(resultado.tickets[0].tiempoResolucionHoras).toBe(3.5);
  });

  it("detecta columnas de tiempo con nombre aproximado", () => {
    const csv = `fecha,asunto,descripcion,Tiempo de resolución (h)
2026-09-01,Algo,Pasa algo,10
`;
    const resultado = parsearCsv(csv);
    expect(resultado.tickets[0].tiempoResolucionHoras).toBe(10);
  });

  it("descarta filas con fecha inválida y las cuenta", () => {
    const csv = `fecha,asunto,descripcion
no es una fecha,Algo,Pasa algo
2026-09-02,Otra cosa,Pasa otra cosa
`;
    const resultado = parsearCsv(csv);
    expect(resultado.tickets).toHaveLength(1);
    expect(resultado.filasDescartadas).toBe(1);
    expect(resultado.filasInvalidas[0].fila).toBe(2);
  });

  it("ignora las líneas vacías", () => {
    const csv = `fecha,asunto,descripcion

2026-09-02,Otra cosa,Pasa otra cosa

`;
    const resultado = parsearCsv(csv);
    expect(resultado.tickets).toHaveLength(1);
  });

  it("respeta el límite de filas indicado", () => {
    const resultado = parsearCsv(CSV_MINIMO, 1);
    expect(resultado.tickets).toHaveLength(1);
    expect(resultado.errores.some((error) => error.includes("límite"))).toBe(
      true,
    );
  });

  it("avisa si el archivo está vacío", () => {
    const resultado = parsearCsv("   ");
    expect(resultado.tickets).toHaveLength(0);
    expect(resultado.errores[0]).toContain("vacío");
  });
});
