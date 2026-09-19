export const LIMITE_TEXTO = 500;

const PATRONES_PII: { regex: RegExp; reemplazo: string }[] = [
  {
    regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    reemplazo: "[EMAIL]",
  },
  {
    regex: /\b[XYZ][\s.-]?\d{7}[\s.-]?[A-Za-z]\b/gi,
    reemplazo: "[DNI]",
  },
  {
    regex: /\b\d{8}[\s.-]?[A-Za-z]\b/g,
    reemplazo: "[DNI]",
  },
  {
    regex: /(?:\+34[\s.-]?)?\b[6789](?:[\s.-]?\d){8}\b/g,
    reemplazo: "[TELEFONO]",
  },
];

export function redactar(texto: string): string {
  let resultado = texto;
  for (const patron of PATRONES_PII) {
    resultado = resultado.replace(patron.regex, patron.reemplazo);
  }
  return resultado;
}

export function textoClasificable(
  asunto: string,
  descripcion: string,
  limite = LIMITE_TEXTO,
): string {
  const concatenado = `${redactar(asunto)} ${redactar(descripcion)}`
    .replace(/\s+/g, " ")
    .trim();
  if (concatenado.length <= limite) return concatenado;
  return `${concatenado.slice(0, limite - 1).trimEnd()}…`;
}
