import { formatearFechaIso } from "./formato";

export function celdaATexto(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  if (valor instanceof Date) return formatearFechaIso(valor);
  if (typeof valor === "boolean") return valor ? "true" : "false";
  return String(valor);
}

function escaparCelda(valor: string): string {
  if (/[",\n\r]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`;
  return valor;
}

export function filasACsv(filas: unknown[][]): string {
  return filas
    .map((fila) => fila.map((celda) => escaparCelda(celdaATexto(celda))).join(","))
    .join("\r\n");
}

export async function excelACsv(archivo: File): Promise<string> {
  const { readSheet } = await import("read-excel-file/browser");
  const filas = await readSheet(archivo);
  if (filas.length === 0) return "";
  return filasACsv(filas);
}
