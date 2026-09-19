"use client";

import { useRef, useState } from "react";
import type { Tier } from "@/lib/tickets/tipos";

interface Props {
  onArchivo: (archivo: File) => void;
  onDemo: () => void;
  procesando: boolean;
  tier: Tier;
  onTier: (tier: Tier) => void;
}

export default function Subidor({
  onArchivo,
  onDemo,
  procesando,
  tier,
  onTier,
}: Props) {
  const [arrastrando, setArrastrando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  const elegirArchivo = (archivo: File | undefined) => {
    if (archivo) onArchivo(archivo);
  };

  return (
    <section className="rounded-2xl border border-borde bg-panel p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Deskmeter
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/70">
        Sube el CSV exportado de tu mesa de ayuda y obtén un panel de salud:
        tendencia del índice, categorías, urgencia y los tickets que conviene
        revisar a mano. Si solo quieres verlo funcionar, carga los datos demo.
      </p>

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
        className={`mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          arrastrando
            ? "border-acento bg-acento-suave/50"
            : "border-borde"
        }`}
      >
        <p className="text-sm text-foreground/70">
          Arrastra aquí el CSV de tickets
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled={procesando}
            onClick={() => entrada.current?.click()}
            className="rounded-lg bg-acento px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
          >
            Elegir archivo
          </button>
          <button
            type="button"
            disabled={procesando}
            onClick={onDemo}
            className="rounded-lg border border-borde px-4 py-2 text-sm transition hover:bg-panel-suave disabled:opacity-50"
          >
            Cargar datos demo
          </button>
        </div>
        <input
          ref={entrada}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(evento) => elegirArchivo(evento.target.files?.[0])}
        />
        <p className="text-xs text-foreground/50">
          Columnas mínimas: fecha, asunto, descripcion. Opcionales: estado,
          prioridad, tiempo_resolucion_horas.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
        <span className="text-foreground/60">Tier de clasificación</span>
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
        <span className="text-foreground/50">
          fast responde en una pasada; smart vuelve a preguntar lo dudoso y
          tarda más.
        </span>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-foreground/60">
        El CSV se procesa en tu navegador. Solo sale hacia classifier.dev el
        texto redactado de cada ticket (correos, teléfonos y DNI/NIE
        sustituidos antes de enviar). Nada se guarda en el servidor.
      </p>
    </section>
  );
}
