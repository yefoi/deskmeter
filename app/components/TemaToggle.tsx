"use client";

export default function TemaToggle({ aria }: { aria: string }) {
  const alternar = () => {
    const oscuro = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("deskmeter-tema", oscuro ? "oscuro" : "claro");
    } catch {
      // Sin almacenamiento disponible: solo cambia la clase.
    }
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={aria}
      className="rounded-md p-2 text-foreground/70 transition hover:bg-panel-suave hover:text-foreground"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="hidden h-4 w-4 dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="block h-4 w-4 dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </button>
  );
}
