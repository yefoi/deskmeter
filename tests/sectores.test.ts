import { describe, expect, it } from "vitest";
import { INSTRUCCIONES_URGENCIA } from "@/lib/tickets/etiquetas";
import {
  esSector,
  instruccionesUrgencia,
  SECTORES,
} from "@/lib/tickets/sectores";

describe("sectores", () => {
  it("valida los sectores conocidos", () => {
    expect(SECTORES).toContain("clinica");
    expect(esSector("clinica")).toBe(true);
    expect(esSector("comercio")).toBe(true);
    expect(esSector("otro")).toBe(false);
    expect(esSector(undefined)).toBe(false);
  });

  it("general usa las instrucciones genéricas", () => {
    expect(instruccionesUrgencia("es", "general")).toBe(
      INSTRUCCIONES_URGENCIA.es,
    );
    expect(instruccionesUrgencia("en")).toBe(INSTRUCCIONES_URGENCIA.en);
  });

  it("cada vertical afina el criterio de urgencia", () => {
    const clinica = instruccionesUrgencia("es", "clinica");
    expect(clinica).toContain("atender pacientes");
    expect(clinica).not.toBe(INSTRUCCIONES_URGENCIA.es);
    expect(instruccionesUrgencia("es", "comercio")).toContain("cobrar");
    expect(instruccionesUrgencia("es", "colegio")).toContain("dar clase");
    expect(instruccionesUrgencia("en", "clinica")).toContain("patients");
    expect(instruccionesUrgencia("en", "comercio")).toContain("sales");
    expect(instruccionesUrgencia("en", "colegio")).toContain("teaching");
  });
});
