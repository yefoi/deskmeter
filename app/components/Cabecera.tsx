"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Idioma } from "@/lib/tickets/idioma";
import { TEXTOS } from "@/lib/tickets/textos";
import Logo from "./Logo";
import TemaToggle from "./TemaToggle";

function rutaEnEspanol(ruta: string): string {
  if (ruta.startsWith("/en/methodology")) return "/metodologia";
  if (ruta.startsWith("/en")) return ruta.replace(/^\/en/, "") || "/";
  return ruta;
}

function rutaEnIngles(ruta: string): string {
  if (ruta.startsWith("/en")) return ruta;
  if (ruta === "/metodologia") return "/en/methodology";
  return ruta === "/" ? "/en" : `/en${ruta}`;
}

export default function Cabecera({ idioma }: { idioma: Idioma }) {
  const ruta = usePathname();
  const t = TEXTOS[idioma];
  const enEspanol = idioma === "es";

  return (
    <header className="no-imprimir sticky top-0 z-20 border-b border-borde/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={enEspanol ? "/" : "/en"} className="group flex items-center gap-2.5">
          <Logo className="h-7 w-7 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">
              Desk<span className="text-acento">meter</span>
            </span>
            <span className="hidden text-xs text-foreground/60 sm:inline">
              {t.nav.tagline}
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href={enEspanol ? "/" : "/en"}
            className="rounded-md px-2.5 py-1.5 transition hover:bg-panel-suave"
          >
            {t.nav.panel}
          </Link>
          <Link
            href={enEspanol ? "/metodologia" : "/en/methodology"}
            className="rounded-md px-2.5 py-1.5 transition hover:bg-panel-suave"
          >
            {t.nav.metodologia}
          </Link>
          <div
            className="ml-1 flex items-center rounded-md border border-borde p-0.5 text-xs"
            aria-label={t.nav.idiomaAria}
          >
            <Link
              href={rutaEnEspanol(ruta)}
              aria-current={enEspanol ? "page" : undefined}
              className={`rounded px-2 py-1 font-mono transition ${
                enEspanol
                  ? "bg-acento text-background"
                  : "text-foreground/60 hover:bg-panel-suave"
              }`}
            >
              ES
            </Link>
            <Link
              href={rutaEnIngles(ruta)}
              aria-current={enEspanol ? undefined : "page"}
              className={`rounded px-2 py-1 font-mono transition ${
                enEspanol
                  ? "text-foreground/60 hover:bg-panel-suave"
                  : "bg-acento text-background"
              }`}
            >
              EN
            </Link>
          </div>
          <TemaToggle aria={t.nav.temaAria} />
        </nav>
      </div>
    </header>
  );
}
