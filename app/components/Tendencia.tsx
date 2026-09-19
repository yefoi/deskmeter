"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COLOR_INDICE } from "./colores";

interface Punto {
  etiqueta: string;
  valor: number;
}

const ESTILO_TOOLTIP = {
  backgroundColor: "var(--panel)",
  border: "1px solid var(--borde)",
  borderRadius: "0.5rem",
  fontSize: "0.75rem",
  color: "var(--foreground)",
} as const;

export default function Tendencia({ datos }: { datos: Punto[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--foreground)" }}
          />
          <Tooltip
            contentStyle={ESTILO_TOOLTIP}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
            formatter={(valor) => [`${valor}/100`, "Índice"]}
          />
          <Line
            type="monotone"
            dataKey="valor"
            name="Índice"
            stroke={COLOR_INDICE}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 0, fill: COLOR_INDICE }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
