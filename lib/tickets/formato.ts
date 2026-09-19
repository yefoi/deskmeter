const NUMERO = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

const FECHA = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatearNumero(valor: number): string {
  return NUMERO.format(valor);
}

export function formatearPorcentaje(valor: number): string {
  return `${NUMERO.format(valor)} %`;
}

export function formatearConfianza(valor: number | null): string {
  if (valor === null) return "sin score";
  return `${Math.round(valor * 100)} %`;
}

export function formatearFecha(fecha: Date): string {
  return FECHA.format(fecha);
}
