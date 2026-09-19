"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORIAS } from "@/lib/tickets/etiquetas";
import { COLOR_CATEGORIA } from "./colores";

interface Punto extends Record<string, string | number> {
  etiqueta: string;
}

const ESTILO_TOOLTIP = {
  backgroundColor: "var(--panel)",
  border: "1px solid var(--borde)",
  borderRadius: "0.5rem",
  fontSize: "0.75rem",
  color: "var(--foreground)",
} as const;

export default function Histograma({ datos }: { datos: Punto[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={datos}
          margin={{ top: 8, right: 12, bottom: 0, left: -20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--borde)"
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
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {CATEGORIAS.map((categoria) => (
            <Bar
              key={categoria.valor}
              dataKey={categoria.valor}
              name={categoria.prompt}
              stackId="categorias"
              fill={COLOR_CATEGORIA[categoria.valor]}
              maxBarSize={38}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
