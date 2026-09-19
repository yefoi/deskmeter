export type Idioma = "es" | "en";

export const IDIOMAS: Idioma[] = ["es", "en"];

export function esIdioma(valor: unknown): valor is Idioma {
  return valor === "es" || valor === "en";
}
