import type { Idioma } from "./idioma";

export const LIMITE_TEXTO = 500;

const MARCADORES: Record<
  Idioma,
  { email: string; telefono: string; dni: string }
> = {
  es: { email: "[EMAIL]", telefono: "[TELEFONO]", dni: "[DNI]" },
  en: { email: "[EMAIL]", telefono: "[PHONE]", dni: "[ID]" },
};

const PATRONES_PII: {
  regex: RegExp;
  marcador: "email" | "telefono" | "dni";
}[] = [
  {
    regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    marcador: "email",
  },
  {
    regex: /\b[XYZ][\s.-]?\d{7}[\s.-]?[A-Za-z]\b/gi,
    marcador: "dni",
  },
  {
    regex: /\b\d{8}[\s.-]?[A-Za-z]\b/g,
    marcador: "dni",
  },
  {
    regex: /(?:\+34[\s.-]?)?\b[6789](?:[\s.-]?\d){8}\b/g,
    marcador: "telefono",
  },
];

export function redactar(texto: string, idioma: Idioma = "es"): string {
  let resultado = texto;
  for (const patron of PATRONES_PII) {
    resultado = resultado.replace(
      patron.regex,
      MARCADORES[idioma][patron.marcador],
    );
  }
  return resultado;
}

export function textoClasificable(
  asunto: string,
  descripcion: string,
  limite = LIMITE_TEXTO,
  idioma: Idioma = "es",
): string {
  const concatenado = `${redactar(asunto, idioma)} ${redactar(descripcion, idioma)}`
    .replace(/\s+/g, " ")
    .trim();
  if (concatenado.length <= limite) return concatenado;
  return `${concatenado.slice(0, limite - 1).trimEnd()}…`;
}
