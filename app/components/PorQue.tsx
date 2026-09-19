import Link from "next/link";
import { useIdioma } from "./idioma";

const ICONOS = ["rayo", "escudo", "codigo"] as const;

export default function PorQue() {
  const { t } = useIdioma();

  return (
    <section className="rounded-2xl border border-borde bg-panel p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wide text-acento">
        {t.porQue.kicker}
      </p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
        {t.porQue.titulo}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/70">
        {t.porQue.intro}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {t.porQue.diferencias.map((diferencia, indice) => (
          <div
            key={diferencia.titulo}
            className="rounded-xl border border-borde bg-background/50 p-4 transition hover:-translate-y-0.5 hover:border-acento/40"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-acento-suave/60 text-acento">
              <Icono tipo={ICONOS[indice]} />
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
                {t.porQue.comparativaTitulo}
              </th>
              <th className="w-[39%] py-2 pr-3 font-medium text-foreground/40">
                {t.porQue.comparativaOtras}
              </th>
            </tr>
          </thead>
          <tbody>
            {t.porQue.comparativa.map(([criterio, deskmeter, tipico]) => (
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
        {t.porQue.nota}{" "}
        <Link
          href={t.porQue.enlaceMetodologia}
          className="underline underline-offset-2 hover:text-foreground"
        >
          {t.porQue.enlace}
        </Link>
        .
      </p>
    </section>
  );
}

function Icono({ tipo }: { tipo: (typeof ICONOS)[number] | "check" | "guion" }) {
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
