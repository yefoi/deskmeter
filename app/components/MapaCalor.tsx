"use client";

import { Fragment } from "react";
import type { MapaCalor as DatosMapa } from "@/lib/tickets/agregar";
import { descripcionPeriodo } from "@/lib/tickets/fechas";
import { nombreCategoria } from "@/lib/tickets/etiquetas";
import type { Granularidad } from "@/lib/tickets/tipos";
import { useIdioma } from "./idioma";

interface Props {
  mapa: DatosMapa;
  granularidad: Granularidad;
}

export default function MapaCalor({ mapa, granularidad }: Props) {
  const { idioma, t } = useIdioma();
  const { periodos, categorias, conteos, maximo } = mapa;

  if (periodos.length === 0) {
    return <p className="text-sm text-foreground/60">{t.mapaCalor.vacio}</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-end gap-2 text-[10px] text-foreground/50">
        <span>{t.mapaCalor.menos}</span>
        <span
          className="h-2 w-24 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in srgb, var(--acento) 12%, transparent), var(--acento))",
          }}
        />
        <span>{t.mapaCalor.mas}</span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[640px]">
          <div
            className="grid items-center gap-1"
            style={{
              gridTemplateColumns: `10rem repeat(${periodos.length}, minmax(2.25rem, 1fr))`,
            }}
          >
            <div className="sticky left-0 z-10 bg-panel" />
            {periodos.map((periodo) => (
              <div
                key={periodo.periodo}
                className="pb-1 text-center text-[10px] text-foreground/50"
                title={descripcionPeriodo(periodo.periodo, granularidad, idioma)}
              >
                {periodo.etiqueta}
              </div>
            ))}

            {categorias.map((categoria, fila) => (
              <Fragment key={categoria}>
                <div className="sticky left-0 z-10 border-r border-borde/60 bg-panel pr-2 text-right text-xs text-foreground/70">
                  {nombreCategoria(categoria, idioma)}
                </div>
                {periodos.map((periodo, columna) => {
                  const valor = conteos[fila][columna];
                  const intensidad = maximo > 0 ? valor / maximo : 0;
                  const porcentaje = Math.round(12 + 78 * intensidad);
                  return (
                    <div
                      key={`${categoria}-${periodo.periodo}`}
                      title={t.mapaCalor.tooltip(
                        nombreCategoria(categoria, idioma),
                        descripcionPeriodo(
                          periodo.periodo,
                          granularidad,
                          idioma,
                        ),
                        valor,
                      )}
                      className="flex h-9 items-center justify-center rounded-sm border border-borde/40 text-[11px] tabular-nums transition hover:ring-2 hover:ring-acento/70"
                      style={
                        valor === 0
                          ? undefined
                          : {
                              backgroundColor: `color-mix(in srgb, var(--acento) ${porcentaje}%, transparent)`,
                              color:
                                intensidad > 0.55
                                  ? "var(--background)"
                                  : "var(--foreground)",
                            }
                      }
                    >
                      {valor > 0 ? valor : ""}
                    </div>
                  );
                })}
              </Fragment>
            ))}

            <div className="sticky left-0 z-10 border-r border-borde/60 bg-panel pr-2 text-right text-xs font-medium text-foreground/60">
              {t.mapaCalor.total}
            </div>
            {periodos.map((periodo) => (
              <div
                key={`total-${periodo.periodo}`}
                className="pt-1 text-center text-[11px] font-medium text-foreground/70"
              >
                {periodo.total}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
