import type { Categoria, Urgencia } from "@/lib/tickets/tipos";

export const COLOR_CATEGORIA: Record<Categoria, string> = {
  hardware: "#0ea5e9",
  software: "#8b5cf6",
  redes: "#10b981",
  cuentas_accesos: "#f59e0b",
  facturacion: "#ef4444",
  otro: "#64748b",
};

export const COLOR_URGENCIA: Record<Urgencia, string> = {
  critico: "#dc2626",
  alto: "#ea580c",
  normal: "#0284c7",
  bajo: "#64748b",
};

export const COLOR_INDICE = "#0d9488";
