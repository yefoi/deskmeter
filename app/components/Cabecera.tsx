import Link from "next/link";
import Logo from "./Logo";
import TemaToggle from "./TemaToggle";

export default function Cabecera() {
  return (
    <header className="no-imprimir sticky top-0 z-20 border-b border-borde/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <Logo className="h-7 w-7 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">
              Desk<span className="text-acento">meter</span>
            </span>
            <span className="hidden text-xs text-foreground/60 sm:inline">
              salud de tu helpdesk
            </span>
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
