"use client";

import type { ReactNode } from "react";
import { formatearNumero, formatearPorcentaje } from "@/lib/tickets/formato";
import type { ResultadoIndice } from "@/lib/tickets/indice";
import type { Granularidad, ResumenTickets } from "@/lib/tickets/tipos";
import { useIdioma } from "./idioma";
import IndiceGauge from "./IndiceGauge";
import { useTema } from "./useTema";

interface Props {
  resumen: ResumenTickets;
  indice?: ResultadoIndice;
  indiceAnterior?: ResultadoIndice;
  periodo: string;
  granularidad: Granularidad;
  periodos: number;
  serie?: number[];
}

export default function Tarjetas({
  resumen,
  indice,
  indiceAnterior,
  periodo,
  granularidad,
  periodos,
  serie,
}: Props) {
  const { idioma, t } = useIdioma();
  const tema = useTema();
  const delta =
    indice && indiceAnterior
      ? Number((indice.valor - indiceAnterior.valor).toFixed(1))
      : null;

  return (
    <section className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5">
      <Tarjeta
        className="min-w-[72%] snap-start sm:min-w-0"
        titulo={t.tarjetas.indice}
        etiqueta={t.tarjetas.periodoActual(
          granularidad === "semana" ? t.panel.semana : t.panel.mes,
          periodo,
        )}
      >
        <IndiceGauge valor={indice?.valor ?? null} tema={tema} serie={serie} />
        {delta !== null && (
          <p
            className={`mt-2 text-center text-xs tabular-nums ${
              delta >= 0 ? "text-acento" : "text-peligro"
            }`}
          >
            {delta >= 0 ? "+" : "−"}
            {formatearNumero(Math.abs(delta), idioma)} {t.tarjetas.vsAnterior}
          </p>
        )}
      </Tarjeta>

      <Tarjeta
        className="min-w-[62%] snap-start sm:min-w-0"
        titulo={t.tarjetas.tickets}
        etiqueta={t.tarjetas.enPeriodos(periodos)}
      >
        <p className="text-3xl font-semibold tabular-nums">
          {formatearNumero(resumen.total, idioma)}
        </p>
      </Tarjeta>

      <Tarjeta
        className="min-w-[62%] snap-start sm:min-w-0"
        titulo={t.tarjetas.criticos}
        etiqueta={t.tarjetas.ticketsCantidad(
          formatearNumero(resumen.criticosAltos, idioma),
        )}
      >
        <p className="text-3xl font-semibold tabular-nums">
          {formatearPorcentaje(resumen.porcentajeCriticosAltos, idioma)}
        </p>
      </Tarjeta>

      <Tarjeta
        className="min-w-[62%] snap-start sm:min-w-0"
        titulo={t.tarjetas.revision}
        etiqueta={t.tarjetas.ticketsCantidad(
          formatearNumero(resumen.revisionManual, idioma),
        )}
      >
        <p className="text-3xl font-semibold tabular-nums">
          {formatearPorcentaje(resumen.porcentajeRevisionManual, idioma)}
        </p>
      </Tarjeta>

      <Tarjeta
        className="min-w-[62%] snap-start sm:min-w-0"
        titulo={t.tarjetas.tiempo}
        etiqueta={
          resumen.tiempoMedioResolucion === null
            ? t.tarjetas.sinColumna
            : t.tarjetas.horas
        }
      >
        <p className="text-3xl font-semibold tabular-nums">
          {resumen.tiempoMedioResolucion === null
            ? "—"
            : `${formatearNumero(resumen.tiempoMedioResolucion, idioma)} h`}
        </p>
      </Tarjeta>
    </section>
  );
}

function Tarjeta({
  titulo,
  etiqueta,
  className = "",
  children,
}: {
  titulo: string;
  etiqueta?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-borde bg-panel p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-foreground/5 ${className}`}
    >
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
