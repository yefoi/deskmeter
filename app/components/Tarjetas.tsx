import type { ReactNode } from "react";
import { formatearNumero, formatearPorcentaje } from "@/lib/tickets/formato";
import type { ResultadoIndice } from "@/lib/tickets/indice";
import type { Granularidad, ResumenTickets } from "@/lib/tickets/tipos";

interface Props {
  resumen: ResumenTickets;
  indice?: ResultadoIndice;
  indiceAnterior?: ResultadoIndice;
  periodo: string;
  granularidad: Granularidad;
  periodos: number;
}

export default function Tarjetas({
  resumen,
  indice,
  indiceAnterior,
  periodo,
  granularidad,
  periodos,
}: Props) {
  const delta =
    indice && indiceAnterior
      ? Number((indice.valor - indiceAnterior.valor).toFixed(1))
      : null;

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Tarjeta
        titulo="Índice de salud"
        etiqueta={`últim${granularidad === "semana" ? "a" : "o"} ${granularidad} · ${periodo}`}
      >
        <p className="text-3xl font-semibold tabular-nums">
          {indice ? formatearNumero(indice.valor) : "—"}
        </p>
        {delta !== null && (
          <p
            className={`mt-1 text-xs tabular-nums ${
              delta >= 0 ? "text-acento" : "text-peligro"
            }`}
          >
            {delta >= 0 ? "+" : "−"}
            {formatearNumero(Math.abs(delta))} vs periodo anterior
          </p>
        )}
      </Tarjeta>

      <Tarjeta titulo="Tickets" etiqueta={`en ${periodos} periodos`}>
        <p className="text-3xl font-semibold tabular-nums">
          {formatearNumero(resumen.total)}
        </p>
      </Tarjeta>

      <Tarjeta
        titulo="Críticos / altos"
        etiqueta={`${formatearNumero(resumen.criticosAltos)} tickets`}
      >
        <p className="text-3xl font-semibold tabular-nums">
          {formatearPorcentaje(resumen.porcentajeCriticosAltos)}
        </p>
      </Tarjeta>

      <Tarjeta
        titulo="Revisión manual"
        etiqueta={`${formatearNumero(resumen.revisionManual)} tickets`}
      >
        <p className="text-3xl font-semibold tabular-nums">
          {formatearPorcentaje(resumen.porcentajeRevisionManual)}
        </p>
      </Tarjeta>

      <Tarjeta
        titulo="Tiempo medio"
        etiqueta={
          resumen.tiempoMedioResolucion === null
            ? "sin columna tiempo_resolucion_horas"
            : "horas hasta la resolución"
        }
      >
        <p className="text-3xl font-semibold tabular-nums">
          {resumen.tiempoMedioResolucion === null
            ? "—"
            : `${formatearNumero(resumen.tiempoMedioResolucion)} h`}
        </p>
      </Tarjeta>
    </section>
  );
}

function Tarjeta({
  titulo,
  etiqueta,
  children,
}: {
  titulo: string;
  etiqueta?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-borde bg-panel p-4">
      <p className="text-xs uppercase tracking-wide text-foreground/50">
        {titulo}
      </p>
      <div className="mt-2">{children}</div>
      {etiqueta && (
        <p className="mt-1 text-xs text-foreground/50">{etiqueta}</p>
      )}
    </div>
  );
}
