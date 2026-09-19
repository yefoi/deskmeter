"use client";

import { useCallback, useRef, useState } from "react";
import { clasificarTickets } from "@/lib/tickets/clasificar";
import { parsearCsv } from "@/lib/tickets/csv";
import { generarTicketsDemo } from "@/lib/tickets/demo";
import type { Ticket, Tier } from "@/lib/tickets/tipos";
import EsqueletoPanel from "./EsqueletoPanel";
import PanelResultados from "./PanelResultados";
import Progreso, { type EstadoProgreso } from "./Progreso";
import Subidor from "./Subidor";

export default function Deskmeter() {
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
    setTickets(generarTicketsDemo());
    setFuente("demo");
    setNombreArchivo(null);
    setProgreso(null);
    setError(null);
    setAviso(null);
  }, []);

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
        setError("No se pudo leer el archivo.");
        return;
      }

      const resultado = parsearCsv(texto);
      if (resultado.columnasFaltantes.length > 0) {
        setError(resultado.errores[0] ?? "El CSV no tiene las columnas necesarias.");
        return;
      }
      if (resultado.tickets.length === 0) {
        setError("No hay filas con una fecha válida en el CSV.");
        return;
      }

      const avisos: string[] = [];
      if (resultado.filasDescartadas > 0) {
        avisos.push(
          `${resultado.filasDescartadas} fila(s) descartada(s) por fecha no válida.`,
        );
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
          signal: control.signal,
          alProgreso: (hechos, total, fase) =>
            setProgreso({ hechos, total, fase }),
        });
        setTickets(clasificados);
      } catch (fallo) {
        if (fallo instanceof DOMException && fallo.name === "AbortError") {
          setAviso("Proceso cancelado.");
        } else {
          setError(
            fallo instanceof Error
              ? fallo.message
              : "No se pudo clasificar el CSV.",
          );
        }
      } finally {
        setProgreso(null);
        controlador.current = null;
      }
    },
    [tier],
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
        </div>
      )}
    </main>
  );
}

function ComoFunciona() {
  const pasos = [
    {
      titulo: "1 · Sube el CSV",
      texto:
        "Se esperan las columnas fecha, asunto y descripcion. Si además trae estado, prioridad y tiempo_resolucion_horas, se aprovechan en el panel.",
    },
    {
      titulo: "2 · Se redacta y se clasifica",
      texto:
        "Antes de enviar nada se quitan correos, teléfonos y DNI/NIE. Cada ticket se clasifica en dos pasadas con classifier.dev: categoría y urgencia.",
    },
    {
      titulo: "3 · Lee el panel",
      texto:
        "Índice de salud por semana y por mes, mapa de calor de categorías, histograma y la lista de tickets con confianza baja para revisar a mano.",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {pasos.map((paso) => (
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
