"use client";

import { useMemo } from "react";
import { CATEGORIAS_ORDEN } from "@/lib/tickets/agregar";
import { compararTickets, type Diferencia } from "@/lib/tickets/comparar";
import { nombreCategoria } from "@/lib/tickets/etiquetas";
import { formatearNumero, formatearPorcentaje } from "@/lib/tickets/formato";
import type { Granularidad, Ticket } from "@/lib/tickets/tipos";
import { useIdioma } from "./idioma";

interface Props {
  actual: { tickets: Ticket[]; nombre: string };
  anterior: { tickets: Ticket[]; nombre: string };
  granularidad: Granularidad;
}

export default function PanelComparacion({
  actual,
  anterior,
  granularidad,
}: Props) {
  const { idioma, t } = useIdioma();
  const comparacion = useMemo(
    () =>
      compararTickets(actual.tickets, anterior.tickets, granularidad, idioma),
    [actual.tickets, anterior.tickets, granularidad, idioma],
  );

  const filas: {
    etiqueta: string;
    diferencia: Diferencia;
    formato: (valor: number) => string;
    mejorSiBaja: boolean;
  }[] = [
    {
      etiqueta: t.comparar.filas.indice,
      diferencia: comparacion.indice,
      formato: (valor) => formatearNumero(valor, idioma),
      mejorSiBaja: false,
    },
    {
      etiqueta: t.comparar.filas.tickets,
      diferencia: comparacion.total,
      formato: (valor) => formatearNumero(valor, idioma),
      mejorSiBaja: true,
    },
    {
      etiqueta: t.comparar.filas.criticos,
      diferencia: comparacion.criticos,
      formato: (valor) => formatearPorcentaje(valor, idioma),
      mejorSiBaja: true,
    },
    {
      etiqueta: t.comparar.filas.revision,
      diferencia: comparacion.revision,
      formato: (valor) => formatearPorcentaje(valor, idioma),
      mejorSiBaja: true,
    },
    {
      etiqueta: t.comparar.filas.tiempo,
      diferencia: comparacion.tiempo,
      formato: (valor) => `${formatearNumero(valor, idioma)} h`,
      mejorSiBaja: true,
    },
  ];

  const colorDelta = (diferencia: Diferencia, mejorSiBaja: boolean): string => {
    if (diferencia.delta === null || diferencia.delta === 0) {
      return "text-foreground/60";
    }
    const mejora = mejorSiBaja ? diferencia.delta < 0 : diferencia.delta > 0;
    return mejora ? "text-acento" : "text-peligro";
  };

  const textoDelta = (diferencia: Diferencia): string => {
    if (diferencia.delta === null) return t.comparar.sinDato;
    const signo = diferencia.delta > 0 ? "+" : diferencia.delta < 0 ? "−" : "±";
    return `${signo}${formatearNumero(Math.abs(diferencia.delta), idioma)}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
        <span>{t.comparar.anterior(anterior.nombre)}</span>
        <span>{t.comparar.actual(actual.nombre)}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-borde text-xs uppercase tracking-wide text-foreground/50">
              <th className="py-2 pr-3 font-medium">
                {t.comparar.columnas.metrica}
              </th>
              <th className="py-2 pr-3 font-medium">
                {t.comparar.columnas.anterior}
              </th>
              <th className="py-2 pr-3 font-medium">
                {t.comparar.columnas.actual}
              </th>
              <th className="py-2 pr-3 font-medium">
                {t.comparar.columnas.variacion}
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.etiqueta} className="border-b border-borde/60">
                <td className="py-2.5 pr-3">{fila.etiqueta}</td>
                <td className="py-2.5 pr-3 tabular-nums text-foreground/70">
                  {fila.diferencia.anterior === null
                    ? t.comparar.sinDato
                    : fila.formato(fila.diferencia.anterior)}
                </td>
                <td className="py-2.5 pr-3 tabular-nums">
                  {fila.diferencia.actual === null
                    ? t.comparar.sinDato
                    : fila.formato(fila.diferencia.actual)}
                </td>
                <td
                  className={`py-2.5 pr-3 font-medium tabular-nums ${colorDelta(fila.diferencia, fila.mejorSiBaja)}`}
                >
                  {textoDelta(fila.diferencia)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground/60">
          {t.comparar.categorias}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CATEGORIAS_ORDEN.map((categoria) => {
            const diferencia = comparacion.porCategoria[categoria];
            const color =
              diferencia.delta === null || diferencia.delta === 0
                ? "text-foreground/50"
                : diferencia.delta < 0
                  ? "text-acento"
                  : "text-foreground";
            return (
              <span
                key={categoria}
                className="inline-flex items-center gap-1.5 rounded-full border border-borde px-2.5 py-1 text-xs text-foreground/70"
              >
                {nombreCategoria(categoria, idioma)}
                <span className={`tabular-nums ${color}`}>
                  {diferencia.anterior} → {diferencia.actual}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
