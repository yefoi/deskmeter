import type { Idioma } from "./idioma";
import type { Categoria, Urgencia } from "./tipos";

export interface EtiquetaDimension<T extends string> {
  valor: T;
  prompt: string;
}

export const UMBRAL_REVISION = 0.7;

export const CATEGORIAS: Categoria[] = [
  "hardware",
  "software",
  "redes",
  "cuentas_accesos",
  "facturacion",
  "otro",
];

export const URGENCIAS: Urgencia[] = ["critico", "alto", "normal", "bajo"];

const PROMPTS_CATEGORIA: Record<Idioma, Record<Categoria, string>> = {
  es: {
    hardware: "hardware",
    software: "software",
    redes: "redes",
    cuentas_accesos: "cuentas y accesos",
    facturacion: "facturación",
    otro: "otro",
  },
  en: {
    hardware: "hardware",
    software: "software",
    redes: "networking",
    cuentas_accesos: "accounts & access",
    facturacion: "billing",
    otro: "other",
  },
};

const PROMPTS_URGENCIA: Record<Idioma, Record<Urgencia, string>> = {
  es: {
    critico: "crítico",
    alto: "alto",
    normal: "normal",
    bajo: "bajo",
  },
  en: {
    critico: "critical",
    alto: "high",
    normal: "normal",
    bajo: "low",
  },
};

export const INSTRUCCIONES_CATEGORIA: Record<Idioma, string> = {
  es:
    "Clasifica un ticket de un helpdesk de soporte técnico por el área que debe resolverlo. " +
    "hardware: equipos físicos, impresoras, periféricos. " +
    "software: aplicaciones, errores, licencias, actualizaciones. " +
    "redes: conectividad, wifi, VPN, correo. " +
    "cuentas y accesos: contraseñas, permisos, altas y bajas de usuarios. " +
    "facturación: cobros, facturas, tarifas. " +
    "otro: no encaja en ninguna de las anteriores.",
  en:
    "Classify a helpdesk ticket by the area that should resolve it. " +
    "hardware: physical devices, printers, peripherals. " +
    "software: applications, errors, licenses, updates. " +
    "networking: connectivity, wifi, VPN, email. " +
    "accounts & access: passwords, permissions, user onboarding and offboarding. " +
    "billing: charges, invoices, rates. " +
    "other: none of the above.",
};

export const INSTRUCCIONES_URGENCIA: Record<Idioma, string> = {
  es:
    "Clasifica la urgencia de un ticket de soporte. " +
    "crítico: servicio caído, bloqueo total de una persona o de un equipo. " +
    "alto: impacto serio, varios usuarios afectados o trabajo bloqueado sin alternativa. " +
    "normal: incidencia estándar con solución o alternativa disponible. " +
    "bajo: consulta, duda o petición menor sin impacto inmediato.",
  en:
    "Classify the urgency of a support ticket. " +
    "critical: service down, total blockage of a person or team. " +
    "high: serious impact, several users affected or work blocked with no workaround. " +
    "normal: standard incident with a workaround available. " +
    "low: question, doubt or minor request with no immediate impact.",
};

export function etiquetasCategoria(idioma: Idioma): EtiquetaDimension<Categoria>[] {
  return CATEGORIAS.map((valor) => ({
    valor,
    prompt: PROMPTS_CATEGORIA[idioma][valor],
  }));
}

export function etiquetasUrgencia(idioma: Idioma): EtiquetaDimension<Urgencia>[] {
  return URGENCIAS.map((valor) => ({
    valor,
    prompt: PROMPTS_URGENCIA[idioma][valor],
  }));
}

export function nombreCategoria(valor: Categoria, idioma: Idioma = "es"): string {
  return PROMPTS_CATEGORIA[idioma][valor] ?? valor;
}

export function nombreUrgencia(valor: Urgencia, idioma: Idioma = "es"): string {
  return PROMPTS_URGENCIA[idioma][valor] ?? valor;
}

export function normalizarEtiqueta(crudo: string): string {
  return crudo
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function valorCanonico<T extends string>(
  etiquetas: EtiquetaDimension<T>[],
  label: string,
): T | null {
  const buscado = normalizarEtiqueta(label);
  for (const etiqueta of etiquetas) {
    if (
      normalizarEtiqueta(etiqueta.prompt) === buscado ||
      normalizarEtiqueta(etiqueta.valor) === buscado
    ) {
      return etiqueta.valor;
    }
  }
  return null;
}
