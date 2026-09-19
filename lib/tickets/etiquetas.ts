import type { Categoria, Urgencia } from "./tipos";

export interface EtiquetaDimension<T extends string> {
  valor: T;
  prompt: string;
}

export const CATEGORIAS: EtiquetaDimension<Categoria>[] = [
  { valor: "hardware", prompt: "hardware" },
  { valor: "software", prompt: "software" },
  { valor: "redes", prompt: "redes" },
  { valor: "cuentas_accesos", prompt: "cuentas y accesos" },
  { valor: "facturacion", prompt: "facturación" },
  { valor: "otro", prompt: "otro" },
];

export const URGENCIAS: EtiquetaDimension<Urgencia>[] = [
  { valor: "critico", prompt: "crítico" },
  { valor: "alto", prompt: "alto" },
  { valor: "normal", prompt: "normal" },
  { valor: "bajo", prompt: "bajo" },
];

export const UMBRAL_REVISION = 0.7;

export const INSTRUCCIONES_CATEGORIA =
  "Clasifica un ticket de una mesa de ayuda de soporte técnico por el área que debe resolverlo. " +
  "hardware: equipos físicos, impresoras, periféricos. " +
  "software: aplicaciones, errores, licencias, actualizaciones. " +
  "redes: conectividad, wifi, VPN, correo. " +
  "cuentas y accesos: contraseñas, permisos, altas y bajas de usuarios. " +
  "facturación: cobros, facturas, tarifas. " +
  "otro: no encaja en ninguna de las anteriores.";

export const INSTRUCCIONES_URGENCIA =
  "Clasifica la urgencia de un ticket de soporte. " +
  "crítico: servicio caído, bloqueo total de una persona o de un equipo. " +
  "alto: impacto serio, varios usuarios afectados o trabajo bloqueado sin alternativa. " +
  "normal: incidencia estándar con solución o alternativa disponible. " +
  "bajo: consulta, duda o petición menor sin impacto inmediato.";

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

export const ETIQUETAS_CATEGORIA = CATEGORIAS.map((etiqueta) => etiqueta.prompt);
export const ETIQUETAS_URGENCIA = URGENCIAS.map((etiqueta) => etiqueta.prompt);

export function nombreCategoria(valor: Categoria): string {
  return CATEGORIAS.find((categoria) => categoria.valor === valor)?.prompt ?? valor;
}

export function nombreUrgencia(valor: Urgencia): string {
  return URGENCIAS.find((urgencia) => urgencia.valor === valor)?.prompt ?? valor;
}
