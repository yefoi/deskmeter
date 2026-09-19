"use client";

import { useCallback, useRef, useState } from "react";
import { clasificarTickets } from "@/lib/tickets/clasificar";
import {
  LIMITE_FILAS,
  parsearCsv,
  type MapeoColumnas as Mapeo,
} from "@/lib/tickets/csv";
import { generarTicketsDemo } from "@/lib/tickets/demo";
import { excelACsv } from "@/lib/tickets/excel";
import type { Ticket, Tier } from "@/lib/tickets/tipos";
import EsqueletoPanel from "./EsqueletoPanel";
import { useIdioma } from "./idioma";
import MapeoColumnas, { type AnalisisPendiente } from "./MapeoColumnas";
import PanelResultados from "./PanelResultados";
import PorQue from "./PorQue";
import Progreso, { type EstadoProgreso } from "./Progreso";
import Subidor from "./Subidor";

export default function Deskmeter() {
  const { idioma, t } = useIdioma();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [fuente, setFuente] = useState<"demo" | "csv" | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<EstadoProgreso | null>(null);
  const [mapeoPendiente, setMapeoPendiente] = useState<AnalisisPendiente | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier>("fast");
  const controlador = useRef<AbortController | null>(null);

  const cargarDemo = useCallback(() => {
    controlador.current?.abort();
    setTickets(generarTicketsDemo(180, new Date(), idioma));
    setFuente("demo");
    setNombreArchivo(null);
    setProgreso(null);
    setMapeoPendiente(null);
    setError(null);
    setAviso(null);
  }, [idioma]);

  const procesarTexto = useCallback(
    async (texto: string, nombre: string, mapeo?: Mapeo) => {
      controlador.current?.abort();
      setTickets(null);
      setFuente(null);
      setNombreArchivo(null);
      setProgreso(null);
      setError(null);
      setAviso(null);

      const resultado = parsearCsv(texto, LIMITE_FILAS, idioma, mapeo);

      if (resultado.columnasFaltantes.length > 0) {
        if (!mapeo && resultado.encabezados.length > 0) {
          setMapeoPendiente({
            nombreArchivo: nombre,
            texto,
            encabezados: resultado.encabezados,
            vistaPrevia: resultado.vistaPrevia,
            mapeoDetectado: resultado.mapeoDetectado,
            faltantes: resultado.columnasFaltantes,
          });
          return;
        }
        setError(resultado.errores[0] ?? t.deskmeter.errorColumnas);
        return;
      }

      if (resultado.tickets.length === 0) {
        setError(t.deskmeter.errorSinFilas);
        return;
      }

      const avisos: string[] = [];
      if (resultado.filasDescartadas > 0) {
        avisos.push(t.deskmeter.filasDescartadas(resultado.filasDescartadas));
      }
      avisos.push(...resultado.errores);
      setAviso(avisos.join(" ") || null);
      setFuente("csv");
      setNombreArchivo(nombre);

      const control = new AbortController();
      controlador.current = control;
      setProgreso({
        hechos: 0,
        total: resultado.tickets.length * 2,
        fase: "preparando",
      });

      try {
        const clasificado = await clasificarTickets(resultado.tickets, {
          tier,
          idioma,
          signal: control.signal,
          alProgreso: (hechos, total, fase) =>
            setProgreso({ hechos, total, fase }),
        });
        setTickets(clasificado.tickets);
        if (clasificado.repetidos > 0) {
          const mensaje = t.deskmeter.repetidosReutilizados(
            clasificado.repetidos,
          );
          setAviso((actual) => (actual ? `${actual} ${mensaje}` : mensaje));
        }
      } catch (fallo) {
        if (fallo instanceof DOMException && fallo.name === "AbortError") {
          setAviso(t.deskmeter.cancelado);
        } else {
          setError(
            fallo instanceof Error ? fallo.message : t.deskmeter.errorClasificar,
          );
        }
      } finally {
        setProgreso(null);
        controlador.current = null;
      }
    },
    [idioma, t, tier],
  );

  const procesarArchivo = useCallback(
    async (archivo: File) => {
      setMapeoPendiente(null);
      const esExcel =
        /\.xlsx$/i.test(archivo.name) ||
        archivo.type.includes("spreadsheetml");

      let texto: string;
      if (esExcel) {
        try {
          texto = await excelACsv(archivo);
        } catch {
          setError(t.deskmeter.errorExcel);
          return;
        }
      } else {
        try {
          texto = await archivo.text();
        } catch {
          setError(t.deskmeter.errorLectura);
          return;
        }
      }

      await procesarTexto(texto, archivo.name);
    },
    [procesarTexto, t],
  );

  const aplicarMapeo = (mapeo: Mapeo) => {
    if (!mapeoPendiente) return;
    const pendiente = mapeoPendiente;
    setMapeoPendiente(null);
    void procesarTexto(pendiente.texto, pendiente.nombreArchivo, mapeo);
  };

  const cancelar = () => controlador.current?.abort();

  const reiniciar = () => {
    controlador.current?.abort();
    setTickets(null);
    setFuente(null);
    setNombreArchivo(null);
    setMapeoPendiente(null);
    setAviso(null);
    setError(null);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-8 sm:px-6">
      {tickets && fuente ? (
        <PanelResultados
          tickets={tickets}
          fuente={fuente}
          nombreArchivo={nombreArchivo}
          aviso={aviso}
          onReiniciar={reiniciar}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {mapeoPendiente ? (
            <MapeoColumnas
              analisis={mapeoPendiente}
              onAplicar={aplicarMapeo}
              onCancelar={() => setMapeoPendiente(null)}
            />
          ) : (
            <Subidor
              onArchivo={procesarArchivo}
              onDemo={cargarDemo}
              procesando={progreso !== null}
              tier={tier}
              onTier={setTier}
            />
          )}
          {progreso && (
            <div className="aparecer flex flex-col gap-6">
              <Progreso estado={progreso} onCancelar={cancelar} />
              <EsqueletoPanel />
            </div>
          )}
          {error && (
            <p className="rounded-xl border border-peligro/40 bg-peligro/10 px-4 py-3 text-sm text-peligro">
              {error}
            </p>
          )}
          {aviso && !progreso && (
            <p className="rounded-xl border border-aviso/40 bg-aviso/10 px-4 py-3 text-sm text-aviso">
              {aviso}
            </p>
          )}
          {!progreso && !mapeoPendiente && <ComoFunciona />}
          {!progreso && !mapeoPendiente && <PorQue />}
        </div>
      )}
    </main>
  );
}

function ComoFunciona() {
  const { t } = useIdioma();

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {t.deskmeter.pasos.map((paso) => (
        <div
          key={paso.titulo}
          className="rounded-xl border border-borde bg-panel p-4"
        >
          <h2 className="text-sm font-semibold">{paso.titulo}</h2>
          <p className="mt-1 text-xs leading-relaxed text-foreground/70">
            {paso.texto}
          </p>
        </div>
      ))}
    </section>
  );
}
