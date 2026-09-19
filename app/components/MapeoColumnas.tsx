"use client";

import { useState } from "react";
import type { ColumnaLogica, MapeoColumnas as Mapeo } from "@/lib/tickets/csv";
import { useIdioma } from "./idioma";

export interface AnalisisPendiente {
  nombreArchivo: string;
  texto: string;
  encabezados: string[];
  vistaPrevia: Record<string, string>[];
  mapeoDetectado: Mapeo;
  faltantes: ColumnaLogica[];
}

interface Props {
  analisis: AnalisisPendiente;
  onAplicar: (mapeo: Mapeo) => void;
  onCancelar: () => void;
}

const CAMPOS: { id: ColumnaLogica; obligatorio: boolean }[] = [
  { id: "fecha", obligatorio: true },
  { id: "asunto", obligatorio: true },
  { id: "descripcion", obligatorio: true },
  { id: "estado", obligatorio: false },
  { id: "prioridad", obligatorio: false },
  { id: "tiempo_resolucion_horas", obligatorio: false },
];

const OBLIGATORIOS: ColumnaLogica[] = ["fecha", "asunto", "descripcion"];

export default function MapeoColumnas({
  analisis,
  onAplicar,
  onCancelar,
}: Props) {
  const { t } = useIdioma();
  const [seleccion, setSeleccion] = useState<Mapeo>({
    ...analisis.mapeoDetectado,
  });
  const completo = OBLIGATORIOS.every((campo) => Boolean(seleccion[campo]));

  const cambiar = (campo: ColumnaLogica, valor: string) => {
    setSeleccion((actual) => ({ ...actual, [campo]: valor || undefined }));
  };

  const muestraDe = (campo: ColumnaLogica): string => {
    const columna = seleccion[campo];
    if (!columna || analisis.vistaPrevia.length === 0) return "";
    return analisis.vistaPrevia[0][columna] ?? "";
  };

  return (
    <section className="aparecer rounded-2xl border border-borde bg-panel p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {t.mapeo.titulo}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/70">
        {t.mapeo.intro}
      </p>
      <p className="mt-1 font-mono text-xs text-foreground/50">
        {t.mapeo.archivo(analisis.nombreArchivo)}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAMPOS.map((campo) => (
          <label key={campo.id} className="flex flex-col gap-1.5 text-xs">
            <span className="font-medium text-foreground/80">
              {t.mapeo.campos[campo.id]}
            </span>
            <select
              value={seleccion[campo.id] ?? ""}
              onChange={(evento) => cambiar(campo.id, evento.target.value)}
              className="rounded-lg border border-borde bg-background px-3 py-2 text-sm outline-none transition focus:border-acento"
            >
              <option value="" disabled={campo.obligatorio}>
                {campo.obligatorio ? t.mapeo.elegir : t.mapeo.sinAsignar}
              </option>
              {analisis.encabezados.map((encabezado) => (
                <option key={encabezado} value={encabezado}>
                  {encabezado}
                </option>
              ))}
            </select>
            {muestraDe(campo.id) && (
              <span className="truncate text-foreground/50">
                {t.mapeo.ejemplo(muestraDe(campo.id))}
              </span>
            )}
          </label>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <p className="mb-2 text-xs font-medium text-foreground/60">
          {t.mapeo.vistaPrevia}
        </p>
        <table className="w-full min-w-[560px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-borde text-foreground/50">
              {analisis.encabezados.map((encabezado) => (
                <th
                  key={encabezado}
                  className="whitespace-nowrap py-1.5 pr-3 font-medium"
                >
                  {encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analisis.vistaPrevia.map((fila, indice) => (
              <tr key={indice} className="border-b border-borde/60">
                {analisis.encabezados.map((encabezado) => (
                  <td
                    key={encabezado}
                    className="max-w-[220px] truncate py-1.5 pr-3 text-foreground/70"
                    title={fila[encabezado] ?? ""}
                  >
                    {fila[encabezado] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!completo}
          onClick={() => onAplicar(seleccion)}
          className="rounded-lg bg-acento px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {t.mapeo.aplicar}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-lg border border-borde px-4 py-2 text-sm transition hover:bg-panel-suave"
        >
          {t.mapeo.cancelar}
        </button>
        {!completo && (
          <p className="text-xs text-aviso">{t.mapeo.faltanObligatorias}</p>
        )}
      </div>
    </section>
  );
}
