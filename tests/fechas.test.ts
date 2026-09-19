import { describe, expect, it } from "vitest";
import {
  clavePeriodo,
  compararPeriodos,
  mesISO,
  parsearFecha,
  semanaISO,
} from "@/lib/tickets/fechas";

describe("parsearFecha", () => {
  it("lee fechas ISO", () => {
    const fecha = parsearFecha("2026-09-18");
    expect(fecha?.getFullYear()).toBe(2026);
    expect(fecha?.getMonth()).toBe(8);
    expect(fecha?.getDate()).toBe(18);
  });

  it("lee ISO con hora", () => {
    const fecha = parsearFecha("2026-09-18T14:35:00");
    expect(fecha?.getHours()).toBe(14);
    expect(fecha?.getMinutes()).toBe(35);
  });

  it("lee el formato español dd/mm/aaaa", () => {
    const fecha = parsearFecha("01/03/2026");
    expect(fecha?.getMonth()).toBe(2);
    expect(fecha?.getDate()).toBe(1);
  });

  it("lee dd-mm-aaaa y años de dos dígitos", () => {
    const fecha = parsearFecha("25-12-26");
    expect(fecha?.getFullYear()).toBe(2026);
    expect(fecha?.getMonth()).toBe(11);
    expect(fecha?.getDate()).toBe(25);
  });

  it("rechaza fechas imposibles", () => {
    expect(parsearFecha("31/02/2026")).toBeNull();
    expect(parsearFecha("2026-13-01")).toBeNull();
  });

  it("rechaza cadenas vacías o sin formato", () => {
    expect(parsearFecha("")).toBeNull();
    expect(parsearFecha("ayer")).toBeNull();
  });
});

describe("semanaISO", () => {
  it("asigna la semana 1 al jueves inicial del año", () => {
    expect(semanaISO(new Date(2026, 0, 1))).toBe("2026-W01");
  });

  it("mantiene el lunes de la semana anterior en el año nuevo", () => {
    expect(semanaISO(new Date(2025, 11, 29))).toBe("2026-W01");
  });

  it("retrasa el 1 de enero que cae en viernes", () => {
    expect(semanaISO(new Date(2021, 0, 1))).toBe("2020-W53");
  });

  it("numera una fecha de septiembre", () => {
    expect(semanaISO(new Date(2026, 8, 19))).toBe("2026-W38");
  });
});

describe("periodos", () => {
  it("construye el mes con cero a la izquierda", () => {
    expect(mesISO(new Date(2026, 0, 5))).toBe("2026-01");
  });

  it("elige la clave según la granularidad", () => {
    const fecha = new Date(2026, 8, 19);
    expect(clavePeriodo(fecha, "semana")).toBe("2026-W38");
    expect(clavePeriodo(fecha, "mes")).toBe("2026-09");
  });

  it("ordena las claves de forma cronológica", () => {
    const claves = ["2026-W38", "2025-W52", "2026-W01", "2026-W10"];
    expect([...claves].sort(compararPeriodos)).toEqual([
      "2025-W52",
      "2026-W01",
      "2026-W10",
      "2026-W38",
    ]);
  });
});
