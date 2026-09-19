"use client";

import { useCallback, useRef, useState } from "react";
import { clasificarTickets } from "@/lib/tickets/clasificar";
import { LIMITE_FILAS, parsearCsv } from "@/lib/tickets/csv";
import { generarTicketsDemo } from "@/lib/tickets/demo";
import type { Ticket, Tier } from "@/lib/tickets/tipos";
import EsqueletoPanel from "./EsqueletoPanel";
import { useIdioma } from "./idioma";
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
    setError(null);
    setAviso(null);
  }, [idioma]);

  const procesarArchivo = useCallback(
    async (archivo: File) => {
      controlador.current?.abort();
      setTickets(null);
      setFuente(null);
      setNombreArchivo(null);
      setProgreso(null);
      setError(null);
      setAviso(null);

      let texto: string;
      try {
        texto = await archivo.text();
      } catch {
        setError(t.deskmeter.errorLectura);
        return;
      }

      const resultado = parsearCsv(texto, LIMITE_FILAS, idioma);
      if (resultado.columnasFaltantes.length > 0) {
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
      setNombreArchivo(archivo.name);

      const control = new AbortController();
      controlador.current = control;
      setProgreso({
        hechos: 0,
        total: resultado.tickets.length * 2,
        fase: "preparando",
      });

      try {
        const clasificados = await clasificarTickets(resultado.tickets, {
          tier,
          idioma,
          signal: control.signal,
          alProgreso: (hechos, total, fase) =>
            setProgreso({ hechos, total, fase }),
        });
        setTickets(clasificados);
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

  const cancelar = () => controlador.current?.abort();

  const reiniciar = () => {
    controlador.current?.abort();
    setTickets(null);
    setFuente(null);
    setNombreArchivo(null);
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
          <Subidor
            onArchivo={procesarArchivo}
            onDemo={cargarDemo}
            procesando={progreso !== null}
            tier={tier}
            onTier={setTier}
          />
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
          {!progreso && <ComoFunciona />}
          {!progreso && <PorQue />}
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
