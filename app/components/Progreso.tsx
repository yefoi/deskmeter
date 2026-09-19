"use client";

import type { FaseClasificacion } from "@/lib/tickets/clasificar";
import { useIdioma } from "./idioma";

export interface EstadoProgreso {
  hechos: number;
  total: number;
  fase: "preparando" | FaseClasificacion;
}

const PASOS_BASE = ["redaccion", "categoria", "urgencia"] as const;

type EstadoPaso = "hecho" | "activo" | "pendiente";

export default function Progreso({
  estado,
  conAreas = false,
  onCancelar,
}: {
  estado: EstadoProgreso;
  conAreas?: boolean;
  onCancelar: () => void;
}) {
  const { t } = useIdioma();
  const pasos = conAreas ? [...PASOS_BASE, "areas" as const] : [...PASOS_BASE];
  const numFases = conAreas ? 3 : 2;
  const porFase = estado.total / numFases;
  const porcentaje =
    estado.total > 0 ? Math.round((estado.hechos / estado.total) * 100) : 0;

  const estados = pasos.map((paso, indice): EstadoPaso => {
    if (paso === "redaccion") {
      return estado.fase === "preparando" ? "activo" : "hecho";
    }
    if (estado.hechos >= porFase * indice) return "hecho";
    return estado.fase === paso ? "activo" : "pendiente";
  });

  return (
    <section
      aria-live="polite"
      className="rounded-xl border border-borde bg-panel p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">
          {estado.fase === "preparando"
            ? t.progreso.preparando
            : t.progreso.clasificando}
        </p>
        <p className="font-mono text-xs text-foreground/60">
          {estado.hechos} / {estado.total}
        </p>
      </div>

      <ol className="mt-4 flex flex-col gap-3">
        {pasos.map((paso, indice) => {
          const situacion = estados[indice];
          const textos =
            paso === "areas" ? t.progreso.pasoAreas : t.progreso.pasos[indice];
          return (
            <li key={paso} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  situacion === "hecho"
                    ? "border-acento bg-acento text-background"
                    : situacion === "activo"
                      ? "border-acento"
                      : "border-borde text-foreground/30"
                }`}
              >
                {situacion === "hecho" ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 8.5 6.5 12 13 4.5" />
                  </svg>
                ) : situacion === "activo" ? (
                  <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-acento/30 border-t-acento" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-borde" />
                )}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-sm ${
                    situacion === "pendiente"
                      ? "text-foreground/50"
                      : "font-medium"
                  }`}
                >
                  {textos.titulo}
                </p>
                <p className="text-xs text-foreground/50">{textos.detalle}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-panel-suave">
        <div
          className="h-full rounded-full bg-acento transition-all"
          style={{ width: `${porcentaje}%` }}
        />
        <span className="barra-shimmer pointer-events-none absolute inset-0" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-xs text-foreground/60">{t.progreso.lotes}</p>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-md border border-borde px-3 py-1.5 text-xs transition hover:bg-panel-suave"
        >
          {t.progreso.cancelar}
        </button>
      </div>
    </section>
  );
}
