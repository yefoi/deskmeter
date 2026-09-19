"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORIAS } from "@/lib/tickets/etiquetas";
import type { Categoria } from "@/lib/tickets/tipos";
import { PALETA_CATEGORIAS } from "./colores";
import { useTema } from "./useTema";

interface Punto extends Record<string, string | number> {
  etiqueta: string;
  descripcion: string;
}

const ESTILO_TOOLTIP = {
  backgroundColor: "var(--panel)",
  border: "1px solid var(--borde)",
  borderRadius: "0.5rem",
  fontSize: "0.75rem",
  color: "var(--foreground)",
} as const;

export default function Histograma({ datos }: { datos: Punto[] }) {
  const tema = useTema();
  const [ocultas, setOcultas] = useState<Categoria[]>([]);

  const alternar = (categoria: Categoria) => {
    setOcultas((actuales) =>
      actuales.includes(categoria)
        ? actuales.filter((valor) => valor !== categoria)
        : [...actuales, categoria],
    );
  };

  return (
    <div>
      <div className="no-imprimir mb-3 flex flex-wrap gap-1.5">
        {CATEGORIAS.map((categoria) => {
          const oculta = ocultas.includes(categoria.valor);
          return (
            <button
              key={categoria.valor}
              type="button"
              aria-pressed={!oculta}
              onClick={() => alternar(categoria.valor)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                oculta
                  ? "border-borde text-foreground/40 line-through"
                  : "border-borde text-foreground/70 hover:bg-panel-suave"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: oculta
                    ? "var(--borde)"
                    : PALETA_CATEGORIAS[tema][categoria.valor],
                }}
              />
              {categoria.prompt}
            </button>
          );
        })}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            margin={{ top: 8, right: 12, bottom: 0, left: -20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--borde)"
              opacity={0.6}
              vertical={false}
            />
            <XAxis
              dataKey="etiqueta"
              tickLine={false}
              axisLine={{ stroke: "var(--borde)" }}
              tick={{ fontSize: 11, fill: "var(--foreground)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--foreground)" }}
            />
            <Tooltip
              contentStyle={ESTILO_TOOLTIP}
              labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              cursor={{ fill: "var(--panel-suave)" }}
              labelFormatter={(etiqueta, payload) =>
                payload?.[0]?.payload?.descripcion ?? etiqueta
              }
            />
            {CATEGORIAS.map((categoria) => (
              <Bar
                key={categoria.valor}
                dataKey={categoria.valor}
                name={categoria.prompt}
                stackId="categorias"
                fill={PALETA_CATEGORIAS[tema][categoria.valor]}
                maxBarSize={38}
                hide={ocultas.includes(categoria.valor)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
