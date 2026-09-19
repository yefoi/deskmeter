"use client";

import { useMemo, useState } from "react";
import { nombreCategoria, nombreUrgencia } from "@/lib/tickets/etiquetas";
import { formatearConfianza, formatearFecha } from "@/lib/tickets/formato";
import { redactar } from "@/lib/tickets/pii";
import {
  categoriaDeTicket,
  exportarRevisionCsv,
  FILTROS_REVISION,
  filtrarRevision,
  type FiltroRevision,
  urgenciaDeTicket,
} from "@/lib/tickets/revision";
import type { Ticket } from "@/lib/tickets/tipos";
import { colorCategoria, colorUrgencia } from "./colores";
import { useTema } from "./useTema";

interface Props {
  tickets: Ticket[];
  limite?: number;
}

const MOTIVO = { categoria: "categoría", urgencia: "urgencia" } as const;

function tinteFila(ticket: Ticket): string {
  const confianzas = [ticket.categoria.confianza, ticket.urgencia.confianza];
  return confianzas.some((confianza) => confianza === null || confianza < 0.5)
    ? "bg-peligro/5"
    : "";
}

export default function TablaRevision({ tickets, limite = 80 }: Props) {
  const tema = useTema();
  const [filtro, setFiltro] = useState<FiltroRevision>("todas");
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(
    () => filtrarRevision(tickets, filtro, busqueda),
    [tickets, filtro, busqueda],
  );
  const visibles = filtrados.slice(0, limite);

  const descargar = () => {
    const blob = new Blob([exportarRevisionCsv(filtrados)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "deskmeter-revision.csv";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  };

  if (tickets.length === 0) {
    return (
      <p className="text-sm text-foreground/60">
        Ningún ticket necesita revisión manual.
      </p>
    );
  }

  return (
    <div>
      <div className="no-imprimir mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTROS_REVISION.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              onClick={() => setFiltro(opcion.id)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                filtro === opcion.id
                  ? "border-acento bg-acento-suave/60"
                  : "border-borde text-foreground/60 hover:bg-panel-suave"
              }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar en los tickets…"
            className="w-44 rounded-lg border border-borde bg-background px-3 py-1.5 text-xs outline-none transition focus:border-acento sm:w-56"
          />
          <button
            type="button"
            onClick={descargar}
            className="rounded-lg border border-borde px-3 py-1.5 text-xs transition hover:bg-panel-suave"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <p className="mb-3 text-xs text-foreground/50">
        {filtrados.length} de {tickets.length} tickets con los filtros
        actuales.
      </p>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-borde text-xs uppercase tracking-wide text-foreground/50">
              <th className="py-2 pr-3 font-medium">Fecha</th>
              <th className="py-2 pr-3 font-medium">Ticket</th>
              <th className="py-2 pr-3 font-medium">Categoría</th>
              <th className="py-2 pr-3 font-medium">Urgencia</th>
              <th className="py-2 pr-3 font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((ticket) => (
              <tr
                key={ticket.id}
                className={`border-b border-borde/60 align-top transition hover:bg-panel-suave/50 ${tinteFila(ticket)}`}
              >
                <td className="whitespace-nowrap py-2.5 pr-3 text-xs text-foreground/70">
                  {formatearFecha(ticket.fecha)}
                </td>
                <td className="py-2.5 pr-3">
                  <p className="font-medium">
                    {redactar(ticket.asunto) || "(sin asunto)"}
                  </p>
                  <p
                    className="mt-0.5 line-clamp-2 max-w-md text-xs text-foreground/60"
                    title={ticket.textoRedactado}
                  >
                    {ticket.textoRedactado}
                  </p>
                </td>
                <td className="py-2.5 pr-3">
                  <Chip
                    color={colorCategoria(categoriaDeTicket(ticket), tema)}
                    etiqueta={nombreCategoria(categoriaDeTicket(ticket))}
                    confianza={ticket.categoria.confianza}
                  />
                </td>
                <td className="py-2.5 pr-3">
                  <Chip
                    color={colorUrgencia(urgenciaDeTicket(ticket), tema)}
                    etiqueta={nombreUrgencia(urgenciaDeTicket(ticket))}
                    confianza={ticket.urgencia.confianza}
                  />
                </td>
                <td className="py-2.5 pr-3 text-xs text-foreground/70">
                  {ticket.motivosRevision
                    .map((motivo) => MOTIVO[motivo])
                    .join(" y ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {visibles.map((ticket) => (
          <li
            key={ticket.id}
            className={`rounded-xl border border-borde p-3 ${tinteFila(ticket)}`}
          >
            <p className="text-xs text-foreground/60">
              {formatearFecha(ticket.fecha)}
            </p>
            <p className="mt-1 font-medium">
              {redactar(ticket.asunto) || "(sin asunto)"}
            </p>
            <p className="mt-1 line-clamp-3 text-xs text-foreground/60">
              {ticket.textoRedactado}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip
                color={colorCategoria(categoriaDeTicket(ticket), tema)}
                etiqueta={nombreCategoria(categoriaDeTicket(ticket))}
                confianza={ticket.categoria.confianza}
              />
              <Chip
                color={colorUrgencia(urgenciaDeTicket(ticket), tema)}
                etiqueta={nombreUrgencia(urgenciaDeTicket(ticket))}
                confianza={ticket.urgencia.confianza}
              />
            </div>
            <p className="mt-2 text-xs text-foreground/60">
              Revisar:{" "}
              {ticket.motivosRevision
                .map((motivo) => MOTIVO[motivo])
                .join(" y ")}
            </p>
          </li>
        ))}
      </ul>

      {filtrados.length > limite && (
        <p className="mt-3 text-xs text-foreground/50">
          Se muestran {limite} de {filtrados.length} tickets en revisión.
        </p>
      )}
    </div>
  );
}

function Chip({
  color,
  etiqueta,
  confianza,
}: {
  color: string;
  etiqueta: string;
  confianza: number | null;
}) {
  const porcentaje = confianza === null ? 0 : Math.round(confianza * 100);
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
        color,
      }}
    >
      {etiqueta}
      <span
        className="inline-flex h-1 w-8 overflow-hidden rounded-full"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 30%, transparent)`,
        }}
      >
        <span
          className="h-full rounded-full"
          style={{ width: `${porcentaje}%`, backgroundColor: color }}
        />
      </span>
      <span className="tabular-nums opacity-80">
        {formatearConfianza(confianza)}
      </span>
    </span>
  );
}
