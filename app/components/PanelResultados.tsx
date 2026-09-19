"use client";

import { useMemo, useState } from "react";
import {
  agruparPorPeriodo,
  calcularResumen,
  mapaCalorCategorias,
} from "@/lib/tickets/agregar";
import { indicesPorPeriodo } from "@/lib/tickets/indice";
import type { Granularidad, Ticket } from "@/lib/tickets/tipos";
import Histograma from "./Histograma";
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
  const [granularidad, setGranularidad] = useState<Granularidad>("semana");

  const agregados = useMemo(
    () => agruparPorPeriodo(tickets, granularidad),
    [tickets, granularidad],
  );
  const indices = useMemo(() => indicesPorPeriodo(agregados), [agregados]);
  const calor = useMemo(
    () => mapaCalorCategorias(tickets, granularidad),
    [tickets, granularidad],
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
    valor: indices.get(agregado.periodo)?.valor ?? 0,
  }));
  const datosHistograma = agregados.map((agregado) => ({
    etiqueta: agregado.etiqueta,
    ...agregado.porCategoria,
  }));

  const nombrePeriodo = granularidad === "semana" ? "semana" : "mes";
  const descripcionFuente =
    fuente === "demo"
      ? "Datos demo generados en local con clasificación simulada."
      : `Fuente: ${nombreArchivo ?? "CSV"} · ${tickets.length} tickets clasificados con classifier.dev.`;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Panel de salud
          </h1>
          <p className="mt-1 text-sm text-foreground/60">{descripcionFuente}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SelectorGranularidad
            granularidad={granularidad}
            onCambio={setGranularidad}
          />
          <button
            type="button"
            onClick={onReiniciar}
            className="rounded-lg border border-borde px-3 py-2 text-sm transition hover:bg-panel-suave"
          >
            Procesar otro CSV
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
      />

      <section className="rounded-xl border border-borde bg-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold">
          Tendencia del índice de salud
        </h2>
        <p className="mb-4 text-xs text-foreground/60">
          0 = peor salud, 100 = mejor. Cada punto es un{nombrePeriodo === "mes" ? "" : "a"}{" "}
          {nombrePeriodo}.
        </p>
        <Tendencia datos={datosTendencia} />
      </section>

      <section className="rounded-xl border border-borde bg-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold">
          Mapa de calor: categoría × {nombrePeriodo}
        </h2>
        <p className="mb-4 text-xs text-foreground/60">
          Tickets de cada categoría en cada {nombrePeriodo}. Cuanto más oscuro,
          más volumen.
        </p>
        <MapaCalor mapa={calor} granularidad={granularidad} />
      </section>

      <section className="rounded-xl border border-borde bg-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold">
          Histograma de tickets por categoría
        </h2>
        <p className="mb-4 text-xs text-foreground/60">
          Recuento por {nombrePeriodo}, apilado por categoría.
        </p>
        <Histograma datos={datosHistograma} />
      </section>

      <section className="rounded-xl border border-borde bg-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold">Revisión manual</h2>
          <p className="text-xs text-foreground/60">
            {revision.length} de {tickets.length} tickets con confianza menor
            que 0,7 (o sin score) en alguna dimensión.
          </p>
        </div>
        <p className="mb-4 text-xs text-foreground/60">
          Textos ya redactados: sin correos, teléfonos ni DNI/NIE.
        </p>
        <TablaRevision tickets={revision} />
      </section>
    </div>
  );
}

function SelectorGranularidad({
  granularidad,
  onCambio,
}: {
  granularidad: Granularidad;
  onCambio: (granularidad: Granularidad) => void;
}) {
  return (
    <div className="flex rounded-lg border border-borde p-0.5 text-sm">
      {(["semana", "mes"] as const).map((opcion) => (
        <button
          key={opcion}
          type="button"
          onClick={() => onCambio(opcion)}
          className={`rounded-md px-3 py-1.5 capitalize transition ${
            granularidad === opcion
              ? "bg-acento text-background"
              : "text-foreground/70 hover:bg-panel-suave"
          }`}
        >
          {opcion}
        </button>
      ))}
    </div>
  );
}
