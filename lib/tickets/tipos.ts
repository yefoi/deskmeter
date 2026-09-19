export type Categoria =
  | "hardware"
  | "software"
  | "redes"
  | "cuentas_accesos"
  | "facturacion"
  | "otro";

export type Urgencia = "critico" | "alto" | "normal" | "bajo";

export type Dimension = "categoria" | "urgencia";

export type Granularidad = "semana" | "mes";

export type Tier = "fast" | "smart";

export interface TicketCrudo {
  id: string;
  fecha: Date;
  asunto: string;
  descripcion: string;
  estado?: string;
  prioridad?: string;
  tiempoResolucionHoras?: number;
}

export interface Asignacion {
  etiqueta: string;
  confianza: number | null;
  valida: boolean;
}

export interface AreaAdicional {
  etiqueta: Categoria;
  score: number;
}

export interface ResultadoMulti {
  etiquetas: string[];
  scores: Record<string, number>;
}

export interface Ticket extends TicketCrudo {
  textoRedactado: string;
  categoria: Asignacion;
  urgencia: Asignacion;
  areasAdicionales?: AreaAdicional[];
  revisionManual: boolean;
  motivosRevision: Dimension[];
}

export interface ResumenTickets {
  total: number;
  porCategoria: Record<Categoria, number>;
  criticosAltos: number;
  revisionManual: number;
  porcentajeCriticosAltos: number;
  porcentajeRevisionManual: number;
  tiempoMedioResolucion: number | null;
}

export interface ResultadoClasificacion {
  etiqueta: string;
  confianza: number | null;
}
