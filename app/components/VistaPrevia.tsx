"use client";

import { useIdioma } from "./idioma";

const SERIE = [58, 63, 60, 69, 66, 74, 78];

const CALOR = [
  [1, 0, 2, 1, 3, 1, 2],
  [0, 1, 1, 2, 1, 3, 1],
  [2, 3, 2, 4, 2, 1, 3],
  [1, 1, 3, 2, 1, 2, 0],
];

const PUNTOS_TENDENCIA = SERIE.map(
  (valor, indice) =>
    `${((indice * 200) / (SERIE.length - 1)).toFixed(1)},${(58 - ((valor - 55) / 30) * 40).toFixed(1)}`,
).join(" ");

export default function VistaPrevia() {
  const { t } = useIdioma();
  const valores = ["78,4", "23 %", "14 %"];

  return (
    <div className="relative hidden lg:block" aria-hidden="true">
      <div className="absolute -inset-8 rounded-[2rem] bg-acento/10 blur-3xl" />
      <div className="relative rotate-1 rounded-2xl border border-borde bg-panel/90 p-4 shadow-xl shadow-foreground/5 transition-transform duration-500 hover:rotate-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground/60">
            {t.vistaPrevia.titulo}
          </p>
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-peligro/50" />
            <span className="h-2 w-2 rounded-full bg-aviso/50" />
            <span className="h-2 w-2 rounded-full bg-acento/60" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {t.vistaPrevia.kpis.map((titulo, indice) => (
            <div
              key={titulo}
              className="rounded-lg border border-borde bg-background/60 p-2.5"
            >
              <p className="text-[10px] uppercase tracking-wide text-foreground/50">
                {titulo}
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {valores[indice]}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-borde bg-background/60 p-3 text-acento">
          <svg viewBox="0 0 200 64" className="h-16 w-full">
            <defs>
              <linearGradient id="vista-previa-relleno" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M${PUNTOS_TENDENCIA} 200,64 0,64 Z`}
              fill="url(#vista-previa-relleno)"
            />
            <polyline
              points={PUNTOS_TENDENCIA}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1">
          {CALOR.flatMap((fila, indiceFila) =>
            fila.map((valor, indiceColumna) => (
              <span
                key={`${indiceFila}-${indiceColumna}`}
                className="h-4 rounded-sm"
                style={{
                  backgroundColor:
                    valor === 0
                      ? "var(--panel-suave)"
                      : `color-mix(in srgb, var(--acento) ${14 + valor * 18}%, transparent)`,
                }}
              />
            )),
          )}
        </div>

        <p className="mt-3 text-[10px] text-foreground/50">
          {t.vistaPrevia.pie}
        </p>
      </div>
    </div>
  );
}
