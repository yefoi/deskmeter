import type { Categoria, Dimension, Ticket, Urgencia } from "@/lib/tickets/tipos";
import { nombreCategoria, nombreUrgencia } from "@/lib/tickets/etiquetas";
import {
  formatearConfianza,
  formatearFecha,
} from "@/lib/tickets/formato";
import { redactar } from "@/lib/tickets/pii";
import { COLOR_CATEGORIA, COLOR_URGENCIA } from "./colores";

interface Props {
  tickets: Ticket[];
  limite?: number;
}

const MOTIVO: Record<Dimension, string> = {
  categoria: "categoría",
  urgencia: "urgencia",
};

export default function TablaRevision({ tickets, limite = 60 }: Props) {
  if (tickets.length === 0) {
    return (
      <p className="text-sm text-foreground/60">
        Ningún ticket necesita revisión manual.
      </p>
    );
  }

  const visibles = tickets.slice(0, limite);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-borde text-xs uppercase tracking-wide text-foreground/50">
              <th className="py-2 pr-3 font-medium">Fecha</th>
              <th className="py-2 pr-3 font-medium">Ticket</th>
              <th className="py-2 pr-3 font-medium">Categoría</th>
              <th className="py-2 pr-3 font-medium">Urgencia</th>
              <th className="py-2 pr-3 font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-borde/60 align-top"
              >
                <td className="whitespace-nowrap py-2.5 pr-3 text-xs text-foreground/70">
                  {formatearFecha(ticket.fecha)}
                </td>
                <td className="py-2.5 pr-3">
                  <p className="font-medium">
                    {redactar(ticket.asunto) || "(sin asunto)"}
                  </p>
                  <p
                    className="mt-0.5 line-clamp-2 max-w-md text-xs text-foreground/60"
                    title={ticket.textoRedactado}
                  >
                    {ticket.textoRedactado}
                  </p>
                </td>
                <td className="py-2.5 pr-3">
                  <Chip
                    color={
                      COLOR_CATEGORIA[
                        (ticket.categoria.valida
                          ? ticket.categoria.etiqueta
                          : "otro") as Categoria
                      ]
                    }
                    etiqueta={nombreCategoria(
                      (ticket.categoria.valida
                        ? ticket.categoria.etiqueta
                        : "otro") as Categoria,
                    )}
                    confianza={ticket.categoria.confianza}
                  />
                </td>
                <td className="py-2.5 pr-3">
                  <Chip
                    color={
                      COLOR_URGENCIA[
                        (ticket.urgencia.valida
                          ? ticket.urgencia.etiqueta
                          : "normal") as Urgencia
                      ]
                    }
                    etiqueta={nombreUrgencia(
                      (ticket.urgencia.valida
                        ? ticket.urgencia.etiqueta
                        : "normal") as Urgencia,
                    )}
                    confianza={ticket.urgencia.confianza}
                  />
                </td>
                <td className="py-2.5 pr-3 text-xs text-foreground/70">
                  {ticket.motivosRevision.map((motivo) => MOTIVO[motivo]).join(" y ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tickets.length > limite && (
        <p className="mt-3 text-xs text-foreground/50">
          Se muestran {limite} de {tickets.length} tickets en revisión.
        </p>
      )}
    </div>
  );
}

function Chip({
  color,
  etiqueta,
  confianza,
}: {
  color: string;
  etiqueta: string;
  confianza: number | null;
}) {
  const baja = confianza === null || confianza < 0.7;
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      {etiqueta}
      <span
        className={`tabular-nums ${baja ? "font-semibold" : "opacity-70"}`}
      >
        {formatearConfianza(confianza)}
      </span>
    </span>
  );
}
