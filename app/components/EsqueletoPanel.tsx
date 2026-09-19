export default function EsqueletoPanel() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, indice) => (
          <div
            key={indice}
            className="animate-pulse rounded-xl border border-borde bg-panel p-4"
          >
            <div className="h-3 w-2/3 rounded bg-panel-suave" />
            <div className="mt-4 h-8 w-1/2 rounded bg-panel-suave" />
            <div className="mt-3 h-3 w-3/4 rounded bg-panel-suave" />
          </div>
        ))}
      </section>
      <div className="h-80 animate-pulse rounded-xl border border-borde bg-panel" />
      <div className="h-72 animate-pulse rounded-xl border border-borde bg-panel" />
    </div>
  );
}
