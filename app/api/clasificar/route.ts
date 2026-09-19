import { NextResponse } from "next/server";
import {
  ETIQUETAS_CATEGORIA,
  ETIQUETAS_URGENCIA,
  INSTRUCCIONES_CATEGORIA,
  INSTRUCCIONES_URGENCIA,
} from "@/lib/tickets/etiquetas";
import { LOTE_MAXIMO } from "@/lib/tickets/clasificar";

export const maxDuration = 60;

const URL_CLASIFICADOR = "https://classifier.dev/v1/classify";
const MAX_CARACTERES_TEXTO = 32000;
const TIEMPO_LIMITE_MS = 55000;

interface CuerpoPeticion {
  textos?: unknown;
  dimension?: unknown;
  tier?: unknown;
}

export async function POST(request: Request) {
  let cuerpo: CuerpoPeticion;
  try {
    cuerpo = (await request.json()) as CuerpoPeticion;
  } catch {
    return NextResponse.json(
      { error: "El cuerpo debe ser JSON." },
      { status: 400 },
    );
  }

  const textos = Array.isArray(cuerpo.textos) ? cuerpo.textos : [];
  const dimension = cuerpo.dimension;
  const tier = cuerpo.tier ?? "fast";

  if (dimension !== "categoria" && dimension !== "urgencia") {
    return NextResponse.json(
      { error: 'La dimensión debe ser "categoria" o "urgencia".' },
      { status: 400 },
    );
  }

  if (tier !== "fast" && tier !== "smart") {
    return NextResponse.json(
      { error: 'El tier debe ser "fast" o "smart".' },
      { status: 400 },
    );
  }

  if (textos.length === 0 || textos.length > LOTE_MAXIMO) {
    return NextResponse.json(
      { error: `Cada lote admite entre 1 y ${LOTE_MAXIMO} textos.` },
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
    return NextResponse.json(
      {
        error:
          "Cada texto debe ser una cadena no vacía de hasta 32.000 caracteres.",
      },
      { status: 400 },
    );
  }

  const etiquetas =
    dimension === "categoria" ? ETIQUETAS_CATEGORIA : ETIQUETAS_URGENCIA;
  const instrucciones =
    dimension === "categoria" ? INSTRUCCIONES_CATEGORIA : INSTRUCCIONES_URGENCIA;

  let respuesta: Response;
  try {
    respuesta = await fetch(URL_CLASIFICADOR, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        inputs: textos,
        labels: etiquetas,
        tier,
        instructions: instrucciones,
      }),
      signal: AbortSignal.timeout(TIEMPO_LIMITE_MS),
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo contactar con classifier.dev." },
      { status: 502 },
    );
  }

  if (!respuesta.ok) {
    let mensaje = `classifier.dev respondió ${respuesta.status}.`;
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
    results?: { label?: unknown; confidence?: unknown }[];
    model?: unknown;
    tier?: unknown;
  };

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
