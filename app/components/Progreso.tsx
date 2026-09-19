"use client";

import type { Dimension } from "@/lib/tickets/tipos";

export interface EstadoProgreso {
  hechos: number;
  total: number;
  fase: "preparando" | Dimension;
}

const PASOS = [
  {
    id: "redaccion",
    titulo: "Leer y redactar",
    detalle: "Se quitan correos, teléfonos y DNI/NIE del texto.",
  },
  {
    id: "categoria",
    titulo: "Clasificar categoría",
    detalle: "hardware, software, redes, cuentas, facturación u otro.",
  },
  {
    id: "urgencia",
    titulo: "Clasificar urgencia",
    detalle: "crítico, alto, normal o bajo.",
  },
] as const;

type EstadoPaso = "hecho" | "activo" | "pendiente";

export default function Progreso({
  estado,
  onCancelar,
}: {
  estado: EstadoProgreso;
  onCancelar: () => void;
}) {
  const porDimension = estado.total / 2;
  const porcentaje =
    estado.total > 0 ? Math.round((estado.hechos / estado.total) * 100) : 0;

  const estados = PASOS.map((paso): EstadoPaso => {
    if (paso.id === "redaccion") {
      return estado.fase === "preparando" ? "activo" : "hecho";
    }
    const realizado =
      paso.id === "categoria"
        ? estado.hechos >= porDimension
        : estado.hechos >= estado.total;
    if (realizado) return "hecho";
    return estado.fase === paso.id ? "activo" : "pendiente";
  });

  return (
    <section
      aria-live="polite"
      className="rounded-xl border border-borde bg-panel p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">
          {estado.fase === "preparando"
            ? "Preparando los tickets…"
            : `Clasificando con classifier.dev…`}
        </p>
        <p className="font-mono text-xs text-foreground/60">
          {estado.hechos} / {estado.total}
        </p>
      </div>

      <ol className="mt-4 flex flex-col gap-3">
        {PASOS.map((paso, indice) => {
          const situacion = estados[indice];
          return (
            <li key={paso.id} className="flex items-start gap-3">
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
                  {paso.titulo}
                </p>
                <p className="text-xs text-foreground/50">{paso.detalle}</p>
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
        <p className="text-xs text-foreground/60">
          Dos pasadas por lote, hasta 1000 tickets por petición. No cierres la
          pestaña.
        </p>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-md border border-borde px-3 py-1.5 text-xs transition hover:bg-panel-suave"
        >
          Cancelar
        </button>
      </div>
    </section>
  );
}
