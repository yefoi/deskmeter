import Link from "next/link";

const DIFERENCIAS = [
  {
    titulo: "Instantáneo y público",
    texto:
      "Abres la URL, subes el CSV y el panel está listo en segundos. Sin demo de ventas, sin formulario de contacto y sin esperar 24-48 horas.",
    icono: "rayo",
  },
  {
    titulo: "Sin backend ni retención",
    texto:
      "El CSV se procesa en tu navegador y no se persiste nada: recargas y desaparece. Algunos paneles conservan tu export hasta 30 días.",
    icono: "escudo",
  },
  {
    titulo: "Metodología abierta",
    texto:
      "El índice de salud publica sus pesos, umbrales y límites en /metodologia, con el código que lo calcula versionado. No es un informe cerrado.",
    icono: "codigo",
  },
] as const;

const COMPARATIVA = [
  ["Primer dato", "Segundos", "Demo comercial o 24-48 h"],
  ["Acceso", "URL pública, sin registro", "Formulario de contacto"],
  ["Procesado del CSV", "En tu navegador", "Se sube a su nube"],
  ["Retención", "Ninguna", "Hasta 30 días (según proveedor)"],
  ["Índice de salud", "Fórmula abierta y versionada", "Informe cerrado"],
  ["Para empezar", "Abrir la URL", "Agendar una llamada"],
] as const;

export default function PorQue() {
  return (
    <section className="rounded-2xl border border-borde bg-panel p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wide text-acento">
        La diferencia está en la forma
      </p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
        Por qué Deskmeter
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/70">
        El mismo objetivo que un panel de helpdesk al uso, sin el camino
        corporativo: ni registro, ni llamada, ni una copia de tus tickets en
        otro servidor.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {DIFERENCIAS.map((diferencia) => (
          <div
            key={diferencia.titulo}
            className="rounded-xl border border-borde bg-background/50 p-4 transition hover:-translate-y-0.5 hover:border-acento/40"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-acento-suave/60 text-acento">
              <Icono tipo={diferencia.icono} />
            </span>
            <h3 className="mt-3 text-sm font-semibold">{diferencia.titulo}</h3>
            <p className="mt-1 text-xs leading-relaxed text-foreground/70">
              {diferencia.texto}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-borde text-xs uppercase tracking-wide">
              <th className="w-[22%] py-2 pr-3 font-medium text-foreground/40" />
              <th className="w-[39%] py-2 pr-3 font-semibold text-acento">
                Deskmeter
              </th>
              <th className="w-[39%] py-2 pr-3 font-medium text-foreground/40">
                Panel corporativo típico
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARATIVA.map(([criterio, deskmeter, tipico]) => (
              <tr
                key={criterio}
                className="border-b border-borde/60 align-top"
              >
                <td className="py-2.5 pr-3 text-xs text-foreground/50">
                  {criterio}
                </td>
                <td className="py-2.5 pr-3">
                  <span className="flex items-start gap-2">
                    <Icono tipo="check" />
                    <span>{deskmeter}</span>
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <span className="flex items-start gap-2 text-foreground/45">
                    <Icono tipo="guion" />
                    <span>{tipico}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-foreground/45">
        Comparación con el camino típico de un panel corporativo de helpdesk;
        los detalles varían según proveedor.{" "}
        <Link
          href="/metodologia"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Ver la metodología abierta
        </Link>
        .
      </p>
    </section>
  );
}

function Icono({ tipo }: { tipo: "rayo" | "escudo" | "codigo" | "check" | "guion" }) {
  if (tipo === "check") {
    return (
      <svg
        viewBox="0 0 16 16"
        className="mt-0.5 h-4 w-4 shrink-0 text-acento"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 8.5 6.5 12 13 4.5" />
      </svg>
    );
  }

  if (tipo === "guion") {
    return (
      <svg
        viewBox="0 0 16 16"
        className="mt-0.5 h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 8h8" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tipo === "rayo" && <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />}
      {tipo === "escudo" && (
        <>
          <path d="M12 3 5 6v5c0 4.4 3 8 7 10 4-2 7-5.6 7-10V6l-7-3Z" />
          <path d="m9 11.5 2 2 4-4" />
        </>
      )}
      {tipo === "codigo" && (
        <>
          <path d="m8.5 7.5-5 4.5 5 4.5" />
          <path d="m15.5 7.5 5 4.5-5 4.5" />
        </>
      )}
    </svg>
  );
}
