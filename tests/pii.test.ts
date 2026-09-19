import { describe, expect, it } from "vitest";
import { redactar, textoClasificable } from "@/lib/tickets/pii";

describe("redactar", () => {
  it("sustituye correos electrónicos", () => {
    expect(redactar("Escribe a maria.lopez@empresa.es para el alta")).toBe(
      "Escribe a [EMAIL] para el alta",
    );
  });

  it("sustituye DNI", () => {
    expect(redactar("Adjunto el DNI 12345678Z para el trámite")).toBe(
      "Adjunto el DNI [DNI] para el trámite",
    );
  });

  it("sustituye NIE", () => {
    expect(redactar("El NIE X1234567L está en el expediente")).toBe(
      "El NIE [DNI] está en el expediente",
    );
  });

  it("sustituye teléfonos con y sin prefijo", () => {
    expect(redactar("Llámame al 612345678")).toBe("Llámame al [TELEFONO]");
    expect(redactar("Móvil: +34 612 345 678")).toBe("Móvil: [TELEFONO]");
    expect(redactar("Extensión 954 12 34 56")).toBe(
      "Extensión [TELEFONO]",
    );
  });

  it("no toca texto sin datos personales", () => {
    const texto = "La impresora de planta 2 no imprime desde ayer";
    expect(redactar(texto)).toBe(texto);
  });
});

describe("textoClasificable", () => {
  it("concatena asunto y descripción con espacios limpios", () => {
    expect(
      textoClasificable("No imprime", "  La impresora   de planta 2 falla "),
    ).toBe("No imprime La impresora de planta 2 falla");
  });

  it("redacta antes de truncar", () => {
    expect(textoClasificable("Aviso", "Correo ana@empresa.es")).toBe(
      "Aviso Correo [EMAIL]",
    );
  });

  it("trunca a 500 caracteres", () => {
    const descripcion = "detalle ".repeat(200);
    const resultado = textoClasificable("Asunto", descripcion);
    expect(resultado.length).toBeLessThanOrEqual(500);
    expect(resultado.endsWith("…")).toBe(true);
  });
});
