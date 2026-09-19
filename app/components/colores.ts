import type { Categoria, Urgencia } from "@/lib/tickets/tipos";

export type Tema = "claro" | "oscuro";

export const PALETA_CATEGORIAS: Record<Tema, Record<Categoria, string>> = {
  claro: {
    hardware: "#0284c7",
    software: "#7c3aed",
    redes: "#059669",
    cuentas_accesos: "#d97706",
    facturacion: "#dc2626",
    otro: "#64748b",
  },
  oscuro: {
    hardware: "#38bdf8",
    software: "#a78bfa",
    redes: "#34d399",
    cuentas_accesos: "#fbbf24",
    facturacion: "#f87171",
    otro: "#94a3b8",
  },
};

export const PALETA_URGENCIAS: Record<Tema, Record<Urgencia, string>> = {
  claro: {
    critico: "#dc2626",
    alto: "#ea580c",
    normal: "#0284c7",
    bajo: "#64748b",
  },
  oscuro: {
    critico: "#f87171",
    alto: "#fb923c",
    normal: "#38bdf8",
    bajo: "#94a3b8",
  },
};

export const COLOR_INDICE: Record<Tema, string> = {
  claro: "#0d9488",
  oscuro: "#2dd4bf",
};

export const PALETA_SEMAFORO: Record<
  Tema,
  { baja: string; media: string; alta: string }
> = {
  claro: { baja: "#dc2626", media: "#d97706", alta: "#059669" },
  oscuro: { baja: "#f87171", media: "#fbbf24", alta: "#34d399" },
};

export function colorCategoria(categoria: Categoria, tema: Tema): string {
  return PALETA_CATEGORIAS[tema][categoria];
}

export function colorUrgencia(urgencia: Urgencia, tema: Tema): string {
  return PALETA_URGENCIAS[tema][urgencia];
}
