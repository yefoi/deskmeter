import Link from "next/link";
import TemaToggle from "./TemaToggle";

export default function Cabecera() {
  return (
    <header className="sticky top-0 z-20 border-b border-borde/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">Deskmeter</span>
          <span className="hidden text-xs text-foreground/60 sm:inline">
            salud de tu mesa de ayuda
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="rounded-md px-2.5 py-1.5 transition hover:bg-panel-suave"
          >
            Panel
          </Link>
          <Link
            href="/metodologia"
            className="rounded-md px-2.5 py-1.5 transition hover:bg-panel-suave"
          >
            Metodología
          </Link>
          <TemaToggle />
        </nav>
      </div>
    </header>
  );
}
