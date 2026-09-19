"use client";

import { useMemo, useState } from "react";
import {
  agruparPorPeriodo,
  calcularResumen,
  mapaCalorCategorias,
} from "@/lib/tickets/agregar";
import { descripcionPeriodo } from "@/lib/tickets/fechas";
import { indicesPorPeriodo } from "@/lib/tickets/indice";
import type { Granularidad, Ticket } from "@/lib/tickets/tipos";
import Histograma from "./Histograma";
import { useIdioma } from "./idioma";
import MapaCalor from "./MapaCalor";
import TablaRevision from "./TablaRevision";
import Tarjetas from "./Tarjetas";
import Tendencia from "./Tendencia";

interface Props {
  tickets: Ticket[];
  fuente: "demo" | "csv";
  nombreArchivo: string | null;
  aviso: string | null;
  onReiniciar: () => void;
}

export default function PanelResultados({
  tickets,
  fuente,
  nombreArchivo,
  aviso,
  onReiniciar,
}: Props) {
  const { idioma, t } = useIdioma();
  const [granularidad, setGranularidad] = useState<Granularidad>("semana");

  const agregados = useMemo(
    () => agruparPorPeriodo(tickets, granularidad, idioma),
    [tickets, granularidad, idioma],
  );
  const indices = useMemo(() => indicesPorPeriodo(agregados), [agregados]);
  const calor = useMemo(
    () => mapaCalorCategorias(tickets, granularidad, idioma),
    [tickets, granularidad, idioma],
  );
  const resumen = useMemo(() => calcularResumen(tickets), [tickets]);
  const revision = useMemo(
    () =>
      tickets
        .filter((ticket) => ticket.revisionManual)
        .sort((a, b) => b.fecha.getTime() - a.fecha.getTime()),
    [tickets],
  );

  const ultimo = agregados.at(-1);
  const anterior = agregados.at(-2);
  const indiceActual = ultimo ? indices.get(ultimo.periodo) : undefined;
  const indiceAnterior = anterior ? indices.get(anterior.periodo) : undefined;

  const datosTendencia = agregados.map((agregado) => ({
    etiqueta: agregado.etiqueta,
    descripcion: descripcionPeriodo(agregado.periodo, granularidad, idioma),
    valor: indices.get(agregado.periodo)?.valor ?? 0,
  }));
  const datosHistograma = agregados.map((agregado) => ({
    etiqueta: agregado.etiqueta,
    descripcion: descripcionPeriodo(agregado.periodo, granularidad, idioma),
    ...agregado.porCategoria,
  }));

  const nombrePeriodo =
    granularidad === "semana" ? t.panel.semana : t.panel.mes;
  const descripcionFuente =
    fuente === "demo"
      ? t.panel.fuenteDemo
      : t.panel.fuenteCsv(nombreArchivo ?? "CSV", tickets.length);

  return (
    <div className="aparecer flex flex-col gap-6 pb-20 sm:pb-0">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.panel.titulo}
          </h1>
          <p className="mt-1 text-sm text-foreground/60">{descripcionFuente}</p>
        </div>
        <div className="no-imprimir flex flex-wrap items-center gap-2">
          <SelectorGranularidad
            granularidad={granularidad}
            onCambio={setGranularidad}
            etiquetas={[t.panel.semana, t.panel.mes]}
          />
          <button
            type="button"
            onClick={onReiniciar}
            className="rounded-lg border border-borde px-3 py-2 text-sm transition hover:bg-panel-suave"
          >
            {t.panel.procesarOtro}
          </button>
        </div>
      </section>

      {aviso && (
        <p className="rounded-xl border border-aviso/40 bg-aviso/10 px-4 py-3 text-sm text-aviso">
          {aviso}
        </p>
      )}

      <Tarjetas
        resumen={resumen}
        indice={indiceActual}
        indiceAnterior={indiceAnterior}
        periodo={ultimo?.etiqueta ?? "—"}
        granularidad={granularidad}
        periodos={agregados.length}
        serie={datosTendencia.map((punto) => punto.valor)}
      />

      <section className="panel-imprimible rounded-xl border border-borde bg-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold">{t.panel.tendenciaTitulo}</h2>
        <p className="mb-4 text-xs text-foreground/60">
          {t.panel.tendenciaDetalle(nombrePeriodo)}
        </p>
        <Tendencia datos={datosTendencia} />
      </section>

      <section className="panel-imprimible rounded-xl border border-borde bg-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold">
          {t.panel.calorTitulo(nombrePeriodo)}
        </h2>
        <p className="mb-4 text-xs text-foreground/60">
          {t.panel.calorDetalle(nombrePeriodo)}
        </p>
        <MapaCalor mapa={calor} granularidad={granularidad} />
      </section>

      <section className="panel-imprimible rounded-xl border border-borde bg-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold">
          {t.panel.histogramaTitulo}
        </h2>
        <p className="mb-4 text-xs text-foreground/60">
          {t.panel.histogramaDetalle(nombrePeriodo)}
        </p>
        <Histograma datos={datosHistograma} />
      </section>

      <section className="panel-imprimible rounded-xl border border-borde bg-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold">{t.panel.revisionTitulo}</h2>
          <p className="text-xs text-foreground/60">
            {t.panel.revisionContador(revision.length, tickets.length)}
          </p>
        </div>
        <p className="mb-4 text-xs text-foreground/60">
          {t.panel.revisionDetalle}
        </p>
        <TablaRevision tickets={revision} />
      </section>

      <div className="no-imprimir fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-panel/95 p-3 backdrop-blur sm:hidden">
        <button
          type="button"
          onClick={onReiniciar}
          className="w-full rounded-lg bg-acento px-4 py-2.5 text-sm font-medium text-background"
        >
          {t.panel.procesarOtro}
        </button>
      </div>
    </div>
  );
}

function SelectorGranularidad({
  granularidad,
  onCambio,
  etiquetas,
}: {
  granularidad: Granularidad;
  onCambio: (granularidad: Granularidad) => void;
  etiquetas: [string, string];
}) {
  return (
    <div className="flex rounded-lg border border-borde p-0.5 text-sm">
      {(["semana", "mes"] as const).map((opcion, indice) => (
        <button
          key={opcion}
          type="button"
          onClick={() => onCambio(opcion)}
          className={`rounded-md px-3 py-1.5 transition ${
            granularidad === opcion
              ? "bg-acento text-background"
              : "text-foreground/70 hover:bg-panel-suave"
          }`}
        >
          {etiquetas[indice]}
        </button>
      ))}
    </div>
  );
}
