import { nombreCategoria, nombreUrgencia } from "./etiquetas";
import { formatearFechaIso } from "./formato";
import type { Idioma } from "./idioma";
import { textosDe } from "./textos";
import type { Categoria, Ticket, Urgencia } from "./tipos";

export type FiltroRevision =
  | "todas"
  | "categoria"
  | "urgencia"
  | "baja"
  | "sin_score";

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

function confianzaCsv(confianza: number | null): string {
  return confianza === null ? "" : confianza.toFixed(2);
}

export function exportarRevisionCsv(
  tickets: Ticket[],
  idioma: Idioma = "es",
): string {
  const cabecera = textosDe(idioma).revisionCsv.cabecera;
  const filas = tickets.map((ticket) => [
    formatearFechaIso(ticket.fecha),
    ticket.asunto,
    ticket.textoRedactado,
    nombreCategoria(categoriaDeTicket(ticket), idioma),
    confianzaCsv(ticket.categoria.confianza),
    nombreUrgencia(urgenciaDeTicket(ticket), idioma),
    confianzaCsv(ticket.urgencia.confianza),
    ticket.motivosRevision.join("+"),
  ]);

  return (
    "\uFEFF" +
    [[...cabecera], ...filas]
      .map((fila) => fila.map(escaparCampoCsv).join(";"))
      .join("\r\n")
  );
}
