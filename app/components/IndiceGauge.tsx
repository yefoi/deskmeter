"use client";

import { formatearNumero } from "@/lib/tickets/formato";
import { PALETA_SEMAFORO, type Tema } from "./colores";
import { useNumeroAnimado } from "./useNumeroAnimado";

interface Props {
  valor: number | null;
  tema: Tema;
  serie?: number[];
}

const CX = 90;
const CY = 92;
const RADIO = 70;

function punto(angulo: number, radio = RADIO) {
  const rad = (angulo * Math.PI) / 180;
  return {
    x: CX + radio * Math.cos(rad),
    y: CY - radio * Math.sin(rad),
  };
}

function arco(desde: number, hasta: number): string {
  const inicio = punto(desde);
  const fin = punto(hasta);
  const grande = hasta - desde > 180 ? 1 : 0;
  return `M ${inicio.x.toFixed(2)} ${inicio.y.toFixed(2)} A ${RADIO} ${RADIO} 0 ${grande} 1 ${fin.x.toFixed(2)} ${fin.y.toFixed(2)}`;
}

function banda(valor: number): "baja" | "media" | "alta" {
  if (valor < 40) return "baja";
  if (valor < 70) return "media";
  return "alta";
}

export default function IndiceGauge({ valor, tema, serie = [] }: Props) {
  const animado = useNumeroAnimado(valor);
  const mostrado = animado ?? 0;
  const rotacion = 1.8 * mostrado;
  const semaforo = PALETA_SEMAFORO[tema];
  const color = valor === null ? "var(--borde)" : semaforo[banda(valor)];

  return (
    <div>
      <svg viewBox="0 0 180 106" className="h-24 w-full">
        <path
          d={arco(180, 108)}
          fill="none"
          stroke={semaforo.baja}
          strokeOpacity="0.5"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d={arco(108, 54)}
          fill="none"
          stroke={semaforo.media}
          strokeOpacity="0.5"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d={arco(54, 0)}
          fill="none"
          stroke={semaforo.alta}
          strokeOpacity="0.5"
          strokeWidth="9"
          strokeLinecap="round"
        />

        {valor !== null && (
          <g transform={`rotate(${rotacion.toFixed(2)} ${CX} ${CY})`}>
            <line
              x1={CX - 50}
              y1={CY}
              x2={CX}
              y2={CY}
              stroke="var(--foreground)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        )}
        <circle cx={CX} cy={CY} r="7" fill="var(--foreground)" />
        <circle cx={CX} cy={CY} r="3" fill="var(--panel)" />

        <text
          x={CX}
          y={CY - 22}
          textAnchor="middle"
          fontSize="34"
          fontWeight="600"
          fill="var(--foreground)"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {valor === null ? "—" : formatearNumero(mostrado)}
        </text>
      </svg>

      <p className="text-center text-xs" style={{ color }}>
        {valor === null
          ? "sin datos"
          : valor < 40
            ? "salud baja"
            : valor < 70
              ? "salud media"
              : "salud buena"}
      </p>

      {serie.length > 1 && (
        <svg
          viewBox="0 0 100 24"
          preserveAspectRatio="none"
          className="mt-2 h-6 w-full"
          aria-hidden="true"
        >
          <polyline
            points={serie
              .map(
                (puntoSerie, indice) =>
                  `${((indice * 100) / (serie.length - 1)).toFixed(2)},${(21 - (puntoSerie / 100) * 18).toFixed(2)}`,
              )
              .join(" ")}
            fill="none"
            style={{ stroke: "var(--acento)" }}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
}
