import { describe, expect, it } from "vitest";
import { decodificarTexto } from "@/lib/tickets/codificacion";

function bufferDe(bytes: number[]): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}

function utf8(texto: string): ArrayBuffer {
  return new TextEncoder().encode(texto).buffer;
}

describe("decodificarTexto", () => {
  it("lee UTF-8 con acentos", () => {
    expect(decodificarTexto(utf8("Fecha;Asunto\n18/09/2026;La impresora no imprime\n"))).toContain(
      "La impresora no imprime",
    );
    expect(decodificarTexto(utf8("Resolución y gestión"))).toBe(
      "Resolución y gestión",
    );
  });

  it("quita el BOM de UTF-8", () => {
    const buffer = new Uint8Array([
      0xef, 0xbb, 0xbf, ...new TextEncoder().encode("fecha,asunto"),
    ]).buffer;
    expect(decodificarTexto(buffer)).toBe("fecha,asunto");
  });

  it("lee UTF-16 con BOM (Excel Unicode)", () => {
    const texto = "fecha,asunto\n18/09/2026,No imprime";
    const bytes = Array.from(Buffer.from(texto, "utf16le"));
    expect(
      decodificarTexto(bufferDe([0xff, 0xfe, ...bytes])),
    ).toBe(texto);
  });

  it("detecta UTF-16 sin BOM por los bytes nulos", () => {
    const texto = "fecha,asunto\n18/09/2026,No imprime";
    const bytes = Array.from(Buffer.from(texto, "utf16le"));
    expect(decodificarTexto(bufferDe(bytes))).toBe(texto);
  });

  it("cae a windows-1252 cuando no es UTF-8 válido", () => {
    // "cañería" en Latin-1: ñ = 0xF1 no es UTF-8 válido
    const bytes = [0x63, 0x61, 0xf1, 0x65, 0x72, 0xed, 0x61];
    expect(decodificarTexto(bufferDe(bytes))).toBe("cañería");
  });
});
