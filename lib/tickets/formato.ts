import type { Idioma } from "./idioma";

const NUMEROS: Record<Idioma, Intl.NumberFormat> = {
  es: new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }),
  en: new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }),
};

const FECHAS: Record<Idioma, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  en: new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
};

export function formatearNumero(valor: number, idioma: Idioma = "es"): string {
  return NUMEROS[idioma].format(valor);
}

export function formatearPorcentaje(
  valor: number,
  idioma: Idioma = "es",
): string {
  const numero = NUMEROS[idioma].format(valor);
  return idioma === "es" ? `${numero} %` : `${numero}%`;
}

export function formatearConfianza(
  valor: number | null,
  idioma: Idioma = "es",
): string {
  if (valor === null) return idioma === "es" ? "sin score" : "no score";
  return `${Math.round(valor * 100)} %`;
}

export function formatearFecha(fecha: Date, idioma: Idioma = "es"): string {
  return FECHAS[idioma].format(fecha);
}

export function formatearFechaIso(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}
