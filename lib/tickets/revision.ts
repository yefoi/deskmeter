import { nombreCategoria, nombreUrgencia } from "./etiquetas";
import { formatearFechaIso } from "./formato";
import type { Categoria, Ticket, Urgencia } from "./tipos";

export type FiltroRevision =
  | "todas"
  | "categoria"
  | "urgencia"
  | "baja"
  | "sin_score";

export const FILTROS_REVISION: { id: FiltroRevision; etiqueta: string }[] = [
  { id: "todas", etiqueta: "Todas" },
  { id: "categoria", etiqueta: "Categoría dudosa" },
  { id: "urgencia", etiqueta: "Urgencia dudosa" },
  { id: "baja", etiqueta: "Confianza < 50 %" },
  { id: "sin_score", etiqueta: "Sin score" },
];

export function categoriaDeTicket(ticket: Ticket): Categoria {
  return (ticket.categoria.valida
    ? ticket.categoria.etiqueta
    : "otro") as Categoria;
}

export function urgenciaDeTicket(ticket: Ticket): Urgencia {
  return (ticket.urgencia.valida
    ? ticket.urgencia.etiqueta
    : "normal") as Urgencia;
}

export function confianzaBaja(ticket: Ticket): boolean {
  return [ticket.categoria.confianza, ticket.urgencia.confianza].some(
    (confianza) => confianza !== null && confianza < 0.5,
  );
}

export function sinScore(ticket: Ticket): boolean {
  return [ticket.categoria.confianza, ticket.urgencia.confianza].some(
    (confianza) => confianza === null,
  );
}

export function filtrarRevision(
  tickets: Ticket[],
  filtro: FiltroRevision,
  busqueda: string,
): Ticket[] {
  const texto = busqueda.trim().toLowerCase();
  return tickets.filter((ticket) => {
    switch (filtro) {
      case "categoria":
        if (!ticket.motivosRevision.includes("categoria")) return false;
        break;
      case "urgencia":
        if (!ticket.motivosRevision.includes("urgencia")) return false;
        break;
      case "baja":
        if (!confianzaBaja(ticket)) return false;
        break;
      case "sin_score":
        if (!sinScore(ticket)) return false;
        break;
      case "todas":
        break;
    }
    if (texto) {
      const contenido =
        `${ticket.asunto} ${ticket.textoRedactado}`.toLowerCase();
      if (!contenido.includes(texto)) return false;
    }
    return true;
  });
}

export function escaparCampoCsv(valor: string | number): string {
  const texto = String(valor);
  if (/[";\n\r]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

const CABECERA_REVISION = [
  "fecha",
  "asunto",
  "texto_redactado",
  "categoria",
  "confianza_categoria",
  "urgencia",
  "confianza_urgencia",
  "motivos_revision",
];

function confianzaCsv(confianza: number | null): string {
  return confianza === null ? "" : confianza.toFixed(2);
}

export function exportarRevisionCsv(tickets: Ticket[]): string {
  const filas = tickets.map((ticket) => [
    formatearFechaIso(ticket.fecha),
    ticket.asunto,
    ticket.textoRedactado,
    nombreCategoria(categoriaDeTicket(ticket)),
    confianzaCsv(ticket.categoria.confianza),
    nombreUrgencia(urgenciaDeTicket(ticket)),
    confianzaCsv(ticket.urgencia.confianza),
    ticket.motivosRevision.join("+"),
  ]);

  return (
    "\uFEFF" +
    [CABECERA_REVISION, ...filas]
      .map((fila) => fila.map(escaparCampoCsv).join(";"))
      .join("\r\n")
  );
}
