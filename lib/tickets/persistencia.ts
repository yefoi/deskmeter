import type { Idioma } from "./idioma";
import type { Sector } from "./sectores";
import type { Ticket, Tier } from "./tipos";

export const CLAVE_ESTADO = "deskmeter-sesion";
export const VERSION_ESTADO = 1;

export type TicketGuardado = Omit<Ticket, "fecha"> & { fecha: string };

export interface EstadoGuardado {
  version: number;
  guardadoEn: string;
  idioma: Idioma;
  fuente: "demo" | "csv";
  nombreArchivo: string | null;
  tier: Tier;
  sector: Sector;
  multiEtiqueta: boolean;
  modelos: string[];
  tickets: TicketGuardado[];
  comparacion: { nombre: string; tickets: TicketGuardado[] } | null;
}

export interface Almacen {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
  removeItem(clave: string): void;
}

function almacenPorDefecto(): Almacen | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function serializarTickets(tickets: Ticket[]): TicketGuardado[] {
  return tickets.map((ticket) => ({
    ...ticket,
    fecha: ticket.fecha.toISOString(),
  }));
}

export function deserializarTickets(tickets: TicketGuardado[]): Ticket[] {
  const restaurados: Ticket[] = [];
  for (const ticket of tickets) {
    const fecha = new Date(ticket.fecha);
    if (Number.isNaN(fecha.getTime())) continue;
    restaurados.push({ ...ticket, fecha });
  }
  return restaurados;
}

export function guardarEstado(
  estado: EstadoGuardado,
  almacen: Almacen | null = almacenPorDefecto(),
): boolean {
  if (!almacen) return false;
  try {
    almacen.setItem(CLAVE_ESTADO, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}

export function cargarEstado(
  almacen: Almacen | null = almacenPorDefecto(),
): EstadoGuardado | null {
  if (!almacen) return null;
  try {
    const crudo = almacen.getItem(CLAVE_ESTADO);
    if (!crudo) return null;
    const datos = JSON.parse(crudo) as EstadoGuardado;
    if (datos?.version !== VERSION_ESTADO) return null;
    if (!Array.isArray(datos.tickets)) return null;
    return datos;
  } catch {
    return null;
  }
}

export function limpiarEstado(
  almacen: Almacen | null = almacenPorDefecto(),
): void {
  try {
    almacen?.removeItem(CLAVE_ESTADO);
  } catch {
    // Sin almacenamiento disponible: nada que limpiar.
  }
}
