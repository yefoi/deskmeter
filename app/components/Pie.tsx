export default function Pie() {
  return (
    <footer className="mt-12 border-t border-borde/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          El CSV se procesa en tu navegador y nada se guarda en el servidor.
        </p>
        <p>
          Clasificación:{" "}
          <a
            className="underline underline-offset-2 hover:text-foreground"
            href="https://classifier.dev"
            target="_blank"
            rel="noreferrer"
          >
            classifier.dev
          </a>
        </p>
      </div>
    </footer>
  );
}
