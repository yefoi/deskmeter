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

  it("acepta encabezados de Zendesk, Jira y Freshdesk", () => {
    const zendesk = `Created at,Subject,Description,Status,Priority
2026-09-01 10:00,VPN no conecta,"Se cae cada rato",Open,High
`;
    const resultado = parsearCsv(zendesk);
    expect(resultado.columnasFaltantes).toEqual([]);
    expect(resultado.tickets[0].asunto).toBe("VPN no conecta");
    expect(resultado.tickets[0].estado).toBe("Open");
    expect(resultado.tickets[0].prioridad).toBe("High");

    const jira = `Created,Summary,Description
2026-09-02,Error al guardar,La aplicación se cierra
`;
    expect(parsearCsv(jira).tickets).toHaveLength(1);

    const freshdesk = `Created time,Subject,Description
2026-09-03,No imprime,La cola se atasca
`;
    expect(parsearCsv(freshdesk).tickets).toHaveLength(1);
  });

  it("deduce columnas con nombres parecidos", () => {
    const csv = `Ticket ID,Created,Summary,Details
1,2026-09-02,Algo falla,Detalle del problema
`;
    const resultado = parsearCsv(csv);
    expect(resultado.tickets[0].asunto).toBe("Algo falla");
    expect(resultado.tickets[0].descripcion).toBe("Detalle del problema");
  });

  it("menciona las columnas detectadas cuando faltan obligatorias", () => {
    const resultado = parsearCsv("ticket_id;created_at;notas\n1;2026-09-01;hola\n");
    expect(resultado.errores[0]).toContain("columnas obligatorias");
    expect(resultado.errores[0]).toContain("Columnas detectadas");
    expect(resultado.errores[0]).toContain("ticket_id");
  });

  it("respeta un mapeo manual de columnas", () => {
    const csv = `A;B;C
Algo falla;2026-09-01;Detalle del problema
`;
    const resultado = parsearCsv(csv, undefined, "es", {
      fecha: "B",
      asunto: "A",
      descripcion: "C",
    });
    expect(resultado.columnasFaltantes).toEqual([]);
    expect(resultado.tickets[0].asunto).toBe("Algo falla");
    expect(resultado.tickets[0].descripcion).toBe("Detalle del problema");
    expect(resultado.tickets[0].fecha.getMonth()).toBe(8);
  });

  it("devuelve encabezados, vista previa y mapeo detectado", () => {
    const resultado = parsearCsv("ticket_id;created_at;notas\n1;2026-09-01;hola\n");
    expect(resultado.encabezados).toEqual(["ticket_id", "created_at", "notas"]);
    expect(resultado.vistaPrevia[0].ticket_id).toBe("1");
    expect(resultado.mapeoDetectado.fecha).toBe("created_at");
    expect(resultado.columnasFaltantes).toEqual(["asunto", "descripcion"]);
  });

  it("acepta encabezados mezclados en español e inglés", () => {
    const csv = `date,asunto,Description,status,prioridad,resolution_hours
2026-09-01,La impresora no imprime,La cola se atasca,Open,alta,4.5
`;
    const resultado = parsearCsv(csv);
    expect(resultado.columnasFaltantes).toEqual([]);
    expect(resultado.tickets).toHaveLength(1);
    expect(resultado.tickets[0].descripcion).toBe("La cola se atasca");
    expect(resultado.tickets[0].estado).toBe("Open");
    expect(resultado.tickets[0].prioridad).toBe("alta");
    expect(resultado.tickets[0].tiempoResolucionHoras).toBe(4.5);
  });

  it("lee la plantilla en inglés generada desde la portada", () => {
    const csv =
      'date,subject,description,status,priority,resolution_hours\r\n18/09/2026,Printer won\'t print,"Jobs stay queued",closed,high,3.5\r\n';
    const resultado = parsearCsv(csv, undefined, "en");
    expect(resultado.columnasFaltantes).toEqual([]);
    expect(resultado.tickets[0].asunto).toBe("Printer won't print");
    expect(resultado.tickets[0].prioridad).toBe("high");
  });

  it("lee CSV con separador de punto y coma", () => {
    const csv = `fecha;asunto;descripcion
18/09/2026;Sin conexión;El router no responde
`;
    const resultado = parsearCsv(csv);
    expect(resultado.tickets).toHaveLength(1);
    expect(resultado.tickets[0].asunto).toBe("Sin conexión");
  });

  it("avisa si el archivo está vacío", () => {
    const resultado = parsearCsv("   ");
    expect(resultado.tickets).toHaveLength(0);
    expect(resultado.errores[0]).toContain("vacío");
  });
});
