import { NextResponse } from "next/server";
import {
  etiquetasCategoria,
  etiquetasUrgencia,
  INSTRUCCIONES_CATEGORIA,
} from "@/lib/tickets/etiquetas";
import { esIdioma, type Idioma } from "@/lib/tickets/idioma";
import { LOTE_MAXIMO } from "@/lib/tickets/clasificar";
import { esSector, instruccionesUrgencia } from "@/lib/tickets/sectores";
import { TEXTOS_API } from "@/lib/tickets/textos";

export const maxDuration = 60;

const RUTAS_CLASIFICADOR = [
  "https://classifier.dev/v1/classify",
  "https://classifier.dev/",
];
const MAX_CARACTERES_TEXTO = 32000;
const TIEMPO_LIMITE_MS = 55000;

interface CuerpoPeticion {
  textos?: unknown;
  dimension?: unknown;
  tier?: unknown;
  idioma?: unknown;
  sector?: unknown;
  multi?: unknown;
}

export async function POST(request: Request) {
  let cuerpo: CuerpoPeticion;
  try {
    cuerpo = (await request.json()) as CuerpoPeticion;
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON." }, { status: 400 });
  }

  const idioma: Idioma = esIdioma(cuerpo.idioma) ? cuerpo.idioma : "es";
  const sector = esSector(cuerpo.sector) ? cuerpo.sector : "general";
  const multi = cuerpo.multi === true;
  const mensajes = TEXTOS_API[idioma];
  const textos = Array.isArray(cuerpo.textos) ? cuerpo.textos : [];
  const dimension = cuerpo.dimension;
  const tier = cuerpo.tier ?? "fast";

  if (dimension !== "categoria" && dimension !== "urgencia") {
    return NextResponse.json({ error: mensajes.dimension }, { status: 400 });
  }

  if (tier !== "fast" && tier !== "smart") {
    return NextResponse.json({ error: mensajes.tier }, { status: 400 });
  }

  if (textos.length === 0 || textos.length > LOTE_MAXIMO) {
    return NextResponse.json(
      { error: mensajes.lote(LOTE_MAXIMO) },
      { status: 400 },
    );
  }

  if (
    !textos.every(
      (texto): texto is string =>
        typeof texto === "string" &&
        texto.trim().length > 0 &&
        texto.length <= MAX_CARACTERES_TEXTO,
    )
  ) {
    return NextResponse.json({ error: mensajes.texto }, { status: 400 });
  }

  const etiquetas =
    dimension === "categoria"
      ? etiquetasCategoria(idioma).map((etiqueta) => etiqueta.prompt)
      : etiquetasUrgencia(idioma).map((etiqueta) => etiqueta.prompt);
  const instrucciones =
    dimension === "categoria"
      ? INSTRUCCIONES_CATEGORIA[idioma]
      : instruccionesUrgencia(idioma, sector);

  let respuesta: Response | undefined;
  for (const ruta of RUTAS_CLASIFICADOR) {
    try {
      const intento = await fetch(ruta, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          inputs: textos,
          labels: etiquetas,
          tier,
          instructions: instrucciones,
          ...(multi ? { multi: true } : {}),
        }),
        signal: AbortSignal.timeout(TIEMPO_LIMITE_MS),
      });
      respuesta = intento;
      if (intento.status !== 404) break;
    } catch {
      if (ruta === RUTAS_CLASIFICADOR[RUTAS_CLASIFICADOR.length - 1]) {
        return NextResponse.json(
          { error: mensajes.sinConexion },
          { status: 502 },
        );
      }
    }
  }

  if (!respuesta) {
    return NextResponse.json({ error: mensajes.sinConexion }, { status: 502 });
  }

  if (!respuesta.ok) {
    let mensaje = mensajes.respuesta(respuesta.status);
    try {
      const error = (await respuesta.json()) as { error?: unknown };
      if (typeof error.error === "string" && error.error) mensaje = error.error;
    } catch {
      // Sin cuerpo JSON: se conserva el mensaje por defecto.
    }
    const retryAfter = Number(respuesta.headers.get("retry-after"));
    return NextResponse.json(
      {
        error: mensaje,
        ...(Number.isFinite(retryAfter) && retryAfter > 0 ? { retryAfter } : {}),
      },
      { status: respuesta.status },
    );
  }

  const datos = (await respuesta.json()) as {
    results?: {
      label?: unknown;
      confidence?: unknown;
      labels?: unknown;
      scores?: unknown;
    }[];
    model?: unknown;
    tier?: unknown;
  };

  if (multi) {
    const areas = (datos.results ?? []).map((resultado) => ({
      etiquetas: Array.isArray(resultado.labels)
        ? resultado.labels.filter((label): label is string => typeof label === "string")
        : [],
      scores:
        typeof resultado.scores === "object" && resultado.scores !== null
          ? (resultado.scores as Record<string, number>)
          : {},
    }));
    return NextResponse.json({
      multi: true,
      areas,
      modelo: typeof datos.model === "string" ? datos.model : undefined,
    });
  }

  const resultados = (datos.results ?? []).map((resultado) => ({
    etiqueta: typeof resultado.label === "string" ? resultado.label : "",
    confianza:
      typeof resultado.confidence === "number" &&
      Number.isFinite(resultado.confidence)
        ? resultado.confidence
        : null,
  }));

  return NextResponse.json({
    resultados,
    modelo: typeof datos.model === "string" ? datos.model : undefined,
    tier: typeof datos.tier === "string" ? datos.tier : undefined,
  });
}
