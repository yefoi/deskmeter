"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatearNumero } from "@/lib/tickets/formato";
import { COLOR_INDICE } from "./colores";
import { useIdioma } from "./idioma";
import { useTema } from "./useTema";

interface Punto {
  etiqueta: string;
  descripcion: string;
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
  const { idioma, t } = useIdioma();
  const tema = useTema();
  const color = COLOR_INDICE[tema];
  const media =
    datos.length > 0
      ? datos.reduce((total, punto) => total + punto.valor, 0) / datos.length
      : null;
  const rotar = datos.length > 10;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={datos}
          margin={{ top: 8, right: 12, bottom: rotar ? 16 : 0, left: -20 }}
        >
          <defs>
            <linearGradient id="tendencia-relleno" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            angle={rotar ? -35 : 0}
            textAnchor={rotar ? "end" : "middle"}
            height={rotar ? 46 : 30}
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
            formatter={(valor) => [`${valor}/100`, t.tendencia.indice]}
            labelFormatter={(etiqueta, payload) =>
              payload?.[0]?.payload?.descripcion ?? etiqueta
            }
          />
          {media !== null && (
            <ReferenceLine
              y={media}
              stroke="var(--borde)"
              strokeDasharray="4 4"
              label={{
                value: t.tendencia.media(
                  formatearNumero(media, idioma).replace(/,0$/, ""),
                ),
                position: "insideTopRight",
                fill: "var(--foreground)",
                fontSize: 10,
                opacity: 0.55,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="valor"
            name={t.tendencia.indice}
            stroke={color}
            strokeWidth={2}
            fill="url(#tendencia-relleno)"
            dot={{ r: 3, strokeWidth: 0, fill: color }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
