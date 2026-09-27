import { describe, expect, it } from "vitest";
import {
  cargarEstado,
  CLAVE_ESTADO,
  deserializarTickets,
  guardarEstado,
  limpiarEstado,
  serializarTickets,
  VERSION_ESTADO,
  type Almacen,
  type EstadoGuardado,
} from "@/lib/tickets/persistencia";
import type { Ticket } from "@/lib/tickets/tipos";

class AlmacenFalso implements Almacen {
  datos = new Map<string, string>();
  getItem(clave: string): string | null {
    return this.datos.get(clave) ?? null;
  }
  setItem(clave: string, valor: string): void {
    this.datos.set(clave, valor);
  }
  removeItem(clave: string): void {
    this.datos.delete(clave);
  }
}

class AlmacenLleno implements Almacen {
  getItem(): string | null {
    return null;
  }
  setItem(): void {
    throw new Error("QuotaExceededError");
  }
  removeItem(): void {}
}

function ticket(): Ticket {
  return {
    id: "t1",
    fecha: new Date(2026, 8, 18, 10, 30),
    asunto: "No imprime",
    descripcion: "La cola se atasca",
    textoRedactado: "No imprime La cola se atasca",
    categoria: { etiqueta: "hardware", confianza: 0.9, valida: true },
    urgencia: { etiqueta: "alto", confianza: 0.8, valida: true },
    areasAdicionales: [{ etiqueta: "redes", score: 0.75 }],
    revisionManual: false,
    motivosRevision: [],
    tiempoResolucionHoras: 3.5,
  };
}

function estado(tickets: Ticket[] = [ticket()]): EstadoGuardado {
  return {
    version: VERSION_ESTADO,
    guardadoEn: new Date(2026, 8, 18).toISOString(),
    idioma: "es",
    fuente: "csv",
    nombreArchivo: "tickets.csv",
    tier: "fast",
    sector: "general",
    multiEtiqueta: true,
    modelos: ["jev-1.13.0"],
    tickets: serializarTickets(tickets),
    comparacion: null,
  };
}

describe("serialización de tickets", () => {
  it("conserva fecha, áreas y tiempo en el ida y vuelta", () => {
    const original = ticket();
    const [restaurado] = deserializarTickets(serializarTickets([original]));
    expect(restaurado.fecha.getTime()).toBe(original.fecha.getTime());
    expect(restaurado.asunto).toBe(original.asunto);
    expect(restaurado.areasAdicionales).toEqual(original.areasAdicionales);
    expect(restaurado.tiempoResolucionHoras).toBe(3.5);
  });

  it("descarta tickets con fecha inválida", () => {
    const [valido] = serializarTickets([ticket()]);
    const restaurados = deserializarTickets([
      valido,
      { ...valido, id: "roto", fecha: "no es una fecha" },
    ]);
    expect(restaurados).toHaveLength(1);
    expect(restaurados[0].id).toBe("t1");
  });
});

describe("guardar y cargar el estado", () => {
  it("guarda y recupera la sesión", () => {
    const almacen = new AlmacenFalso();
    expect(guardarEstado(estado(), almacen)).toBe(true);
    const recuperado = cargarEstado(almacen);
    expect(recuperado?.nombreArchivo).toBe("tickets.csv");
    expect(recuperado?.tickets).toHaveLength(1);
  });

  it("ignora JSON corrupto o versiones antiguas", () => {
    const almacen = new AlmacenFalso();
    almacen.setItem(CLAVE_ESTADO, "{roto");
    expect(cargarEstado(almacen)).toBeNull();

    almacen.setItem(
      CLAVE_ESTADO,
      JSON.stringify({ ...estado(), version: 0 }),
    );
    expect(cargarEstado(almacen)).toBeNull();
  });

  it("no rompe si el almacenamiento está lleno o no existe", () => {
    expect(guardarEstado(estado(), new AlmacenLleno())).toBe(false);
    expect(cargarEstado(null)).toBeNull();
    expect(() => limpiarEstado(null)).not.toThrow();
  });

  it("limpia la sesión guardada", () => {
    const almacen = new AlmacenFalso();
    guardarEstado(estado(), almacen);
    limpiarEstado(almacen);
    expect(cargarEstado(almacen)).toBeNull();
  });
});
