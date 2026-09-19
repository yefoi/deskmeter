"use client";

import { useRef, useState } from "react";
import { SECTORES, type Sector } from "@/lib/tickets/sectores";
import type { Tier } from "@/lib/tickets/tipos";
import { useIdioma } from "./idioma";
import VistaPrevia from "./VistaPrevia";

interface Props {
  onArchivo: (archivo: File) => void;
  onDemo: () => void;
  procesando: boolean;
  tier: Tier;
  onTier: (tier: Tier) => void;
  sector: Sector;
  onSector: (sector: Sector) => void;
}

export default function Subidor({
  onArchivo,
  onDemo,
  procesando,
  tier,
  onTier,
  sector,
  onSector,
}: Props) {
  const { idioma, t } = useIdioma();
  const [arrastrando, setArrastrando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  const elegirArchivo = (archivo: File | undefined) => {
    if (archivo) onArchivo(archivo);
  };

  const descargarPlantilla = () => {
    const cabecera =
      idioma === "es"
        ? "fecha,asunto,descripcion,estado,prioridad,tiempo_resolucion_horas"
        : "date,subject,description,status,priority,resolution_hours";
    const filas =
      idioma === "es"
        ? [
            '18/09/2026,La impresora no imprime,"Se queda la cola atascada",cerrado,alta,3.5',
            '2026-09-19,No puedo acceder al correo,"La contraseña ha caducado",abierto,normal,',
          ]
        : [
            '18/09/2026,Printer won\'t print,"Jobs stay queued",closed,high,3.5',
            '2026-09-19,Can\'t access my email,"The password has expired",open,normal,',
          ];
    const csv = `\uFEFF${[cabecera, ...filas].join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download =
      idioma === "es" ? "deskmeter-plantilla.csv" : "deskmeter-template.csv";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-borde bg-panel p-6 shadow-sm sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-acento/10 blur-3xl"
      />
      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Deskmeter
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/70">
            {t.subidor.intro}
          </p>

          <ul className="mt-4 flex flex-wrap gap-2 text-xs">
            {t.subidor.sellos.map((sello) => (
              <li
                key={sello}
                className="inline-flex items-center gap-1.5 rounded-full border border-borde bg-background/60 px-2.5 py-1 text-foreground/70"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-acento" />
                {sello}
              </li>
            ))}
          </ul>

          <div
            onDragOver={(evento) => {
              evento.preventDefault();
              if (!procesando) setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(evento) => {
              evento.preventDefault();
              setArrastrando(false);
              if (!procesando) elegirArchivo(evento.dataTransfer.files?.[0]);
            }}
            className={`mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-9 text-center transition ${
              arrastrando ? "border-acento bg-acento-suave/50" : "border-borde"
            }`}
          >
            <p className="text-sm text-foreground/70">{t.subidor.arrastra}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                disabled={procesando}
                onClick={() => entrada.current?.click()}
                className="rounded-lg bg-acento px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
              >
                {t.subidor.elegir}
              </button>
              <button
                type="button"
                disabled={procesando}
                onClick={onDemo}
                className="rounded-lg border border-borde px-4 py-2 text-sm transition hover:bg-panel-suave disabled:opacity-50"
              >
                {t.subidor.demo}
              </button>
              <button
                type="button"
                disabled={procesando}
                onClick={descargarPlantilla}
                className="rounded-lg border border-dashed border-borde px-4 py-2 text-sm text-foreground/70 transition hover:bg-panel-suave disabled:opacity-50"
              >
                {t.subidor.plantilla}
              </button>
            </div>
            <input
              ref={entrada}
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(evento) => elegirArchivo(evento.target.files?.[0])}
            />
            <p className="text-xs text-foreground/50">{t.subidor.columnas}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-foreground/60">{t.subidor.tier}</span>
            <div className="flex rounded-lg border border-borde p-0.5">
              {(["fast", "smart"] as const).map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  disabled={procesando}
                  onClick={() => onTier(opcion)}
                  className={`rounded-md px-3 py-1 font-mono transition disabled:opacity-50 ${
                    tier === opcion
                      ? "bg-acento text-background"
                      : "text-foreground/70 hover:bg-panel-suave"
                  }`}
                >
                  {opcion}
                </button>
              ))}
            </div>
            <span className="text-foreground/50">{t.subidor.tierAyuda}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-foreground/60">{t.subidor.sector}</span>
            <select
              value={sector}
              disabled={procesando}
              onChange={(evento) => onSector(evento.target.value as Sector)}
              className="rounded-lg border border-borde bg-background px-3 py-1.5 text-sm outline-none transition focus:border-acento disabled:opacity-50"
            >
              {SECTORES.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {t.subidor.sectores[opcion]}
                </option>
              ))}
            </select>
            <span className="text-foreground/50">{t.subidor.sectorAyuda}</span>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-foreground/60">
            {t.subidor.privacidad}
          </p>
        </div>

        <VistaPrevia />
      </div>
    </section>
  );
}
