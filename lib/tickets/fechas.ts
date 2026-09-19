import type { Granularidad } from "./tipos";

const FORMATO_MES = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  year: "numeric",
});

const FORMATO_MES_LARGO = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});

function fechaValida(fecha: Date, anio: number, mes: number, dia: number): boolean {
  return (
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  );
}

export function parsearFecha(crudo: string): Date | null {
  const texto = crudo.trim();
  if (!texto) return null;

  const iso = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (iso) {
    const anio = Number(iso[1]);
    const mes = Number(iso[2]);
    const dia = Number(iso[3]);
    const fecha = new Date(
      anio,
      mes - 1,
      dia,
      Number(iso[4] ?? 0),
      Number(iso[5] ?? 0),
      Number(iso[6] ?? 0),
    );
    return fechaValida(fecha, anio, mes, dia) ? fecha : null;
  }

  const local = texto.match(
    /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (local) {
    const dia = Number(local[1]);
    const mes = Number(local[2]);
    let anio = Number(local[3]);
    if (anio < 100) anio += 2000;
    const fecha = new Date(
      anio,
      mes - 1,
      dia,
      Number(local[4] ?? 0),
      Number(local[5] ?? 0),
      Number(local[6] ?? 0),
    );
    return fechaValida(fecha, anio, mes, dia) ? fecha : null;
  }

  return null;
}

export function semanaISO(fecha: Date): string {
  const dia = new Date(
    Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()),
  );
  const diaSemana = dia.getUTCDay() || 7;
  dia.setUTCDate(dia.getUTCDate() + 4 - diaSemana);
  const anio = dia.getUTCFullYear();
  const inicio = new Date(Date.UTC(anio, 0, 1));
  const semana = Math.ceil(
    ((dia.getTime() - inicio.getTime()) / 86400000 + 1) / 7,
  );
  return `${anio}-W${String(semana).padStart(2, "0")}`;
}

export function mesISO(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

export function clavePeriodo(fecha: Date, granularidad: Granularidad): string {
  return granularidad === "semana" ? semanaISO(fecha) : mesISO(fecha);
}

export function etiquetaPeriodo(periodo: string, granularidad: Granularidad): string {
  if (granularidad === "semana") {
    const [anio, semana] = periodo.split("-W");
    return `sem ${Number(semana)} · ${anio}`;
  }
  const [anio, mes] = periodo.split("-");
  return FORMATO_MES.format(new Date(Number(anio), Number(mes) - 1, 1));
}

export function descripcionPeriodo(periodo: string, granularidad: Granularidad): string {
  if (granularidad === "semana") {
    const [anio, semana] = periodo.split("-W");
    return `Semana ${Number(semana)} de ${anio}`;
  }
  const [anio, mes] = periodo.split("-");
  return FORMATO_MES_LARGO.format(new Date(Number(anio), Number(mes) - 1, 1));
}

export function compararPeriodos(a: string, b: string): number {
  return a.localeCompare(b);
}
