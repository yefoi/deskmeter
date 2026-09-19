import { INSTRUCCIONES_URGENCIA } from "./etiquetas";
import type { Idioma } from "./idioma";

export type Sector = "general" | "clinica" | "comercio" | "colegio";

export const SECTORES: Sector[] = ["general", "clinica", "comercio", "colegio"];

export function esSector(valor: unknown): valor is Sector {
  return typeof valor === "string" && (SECTORES as string[]).includes(valor);
}

const URGENCIA_CLINICA: Record<Idioma, string> = {
  es:
    "Clasifica la urgencia de un ticket de soporte de una clínica o centro sanitario. " +
    "crítico: cualquier fallo que impida atender pacientes o ponga en riesgo datos clínicos (historia clínica, citas, recetas, resultados). " +
    "alto: bloquea a uno o varios profesionales durante su jornada o retrasa la atención. " +
    "normal: incidencia con alternativa disponible que no retrasa la atención. " +
    "bajo: consulta o petición menor.",
  en:
    "Classify the urgency of a support ticket for a clinic or healthcare centre. " +
    "critical: any failure that prevents seeing patients or risks clinical data (medical records, appointments, prescriptions, results). " +
    "high: blocks one or several professionals during their shift or delays care. " +
    "normal: incident with a workaround that does not delay care. " +
    "low: question or minor request.",
};

const URGENCIA_COMERCIO: Record<Idioma, string> = {
  es:
    "Clasifica la urgencia de un ticket de soporte de un comercio con TPV. " +
    "crítico: no se puede cobrar o falla el catálogo o el stock y se detienen las ventas. " +
    "alto: bloquea parte de la jornada (devoluciones, facturación, un datáfono) sin alternativa. " +
    "normal: incidencia con alternativa disponible que no detiene las ventas. " +
    "bajo: consulta o petición menor.",
  en:
    "Classify the urgency of a support ticket for a shop with a point of sale. " +
    "critical: the till cannot charge or the catalogue/stock fails, so sales stop. " +
    "high: blocks part of the shift (returns, invoicing, one card terminal) with no workaround. " +
    "normal: incident with a workaround that does not stop sales. " +
    "low: question or minor request.",
};

const URGENCIA_COLEGIO: Record<Idioma, string> = {
  es:
    "Clasifica la urgencia de un ticket de soporte de un colegio o centro educativo. " +
    "crítico: impide dar clase o examinar (equipos del aula, plataforma educativa, entrega de exámenes). " +
    "alto: bloquea a un docente o a varios alumnos en su trabajo diario sin alternativa. " +
    "normal: incidencia con alternativa disponible que no interrumpe las clases. " +
    "bajo: consulta o petición menor.",
  en:
    "Classify the urgency of a support ticket for a school or education centre. " +
    "critical: it prevents teaching or examining a class (classroom devices, learning platform, exam delivery). " +
    "high: blocks a teacher or several students in their daily work with no workaround. " +
    "normal: incident with a workaround that does not interrupt lessons. " +
    "low: question or minor request.",
};

const URGENCIA_POR_SECTOR: Record<Idioma, Record<Sector, string | null>> = {
  es: {
    general: null,
    clinica: URGENCIA_CLINICA.es,
    comercio: URGENCIA_COMERCIO.es,
    colegio: URGENCIA_COLEGIO.es,
  },
  en: {
    general: null,
    clinica: URGENCIA_CLINICA.en,
    comercio: URGENCIA_COMERCIO.en,
    colegio: URGENCIA_COLEGIO.en,
  },
};

export function instruccionesUrgencia(
  idioma: Idioma,
  sector: Sector = "general",
): string {
  return URGENCIA_POR_SECTOR[idioma][sector] ?? INSTRUCCIONES_URGENCIA[idioma];
}
