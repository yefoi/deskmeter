import type { Metadata } from "next";
import Link from "next/link";
import {
  faqJsonLd,
  JsonLd,
  migasJsonLd,
} from "@/app/components/DatosEstructurados";
import { sitioPublico } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Metodología",
  description:
    "Cómo se procesa el CSV de tickets en Deskmeter, cómo se redactan los datos personales, cómo clasifica classifier.dev y cómo se calcula el índice de salud.",
  alternates: {
    canonical: "/metodologia",
    languages: {
      es: "/metodologia",
      en: "/en/methodology",
      "x-default": "/metodologia",
    },
  },
  openGraph: {
    type: "article",
    url: "/metodologia",
    title: "Metodología · Deskmeter",
    description:
      "Pesos, umbrales y límites del índice de salud, la redacción de PII y la clasificación en dos pasadas con classifier.dev.",
  },
};

const PREGUNTAS = [
  {
    pregunta: "¿Qué columnas necesita el CSV?",
    respuesta:
      "Fecha, asunto y descripción. Son opcionales estado, prioridad y tiempo_resolucion_horas. Los encabezados se normalizan (tildes, mayúsculas y separadores dan igual) y se aceptan alias como date, subject o description, además de fechas ISO (2026-09-18) o españolas (18/09/2026).",
  },
  {
    pregunta: "¿Sirve el CSV de cualquier herramienta de tickets?",
    respuesta:
      "Sí, siempre que incluya esas tres columnas o sus equivalentes (por ejemplo created at, subject y description). El parser acepta alias habituales de Zendesk, Freshdesk, Jira o Zoho y separadores de coma, punto y coma o tabulador. Si el export es muy distinto —sin fecha o con columnas partidas— el panel avisa de las columnas que faltan y no envía nada a classifier.dev.",
  },
  {
    pregunta: "¿Se guardan mis tickets en algún servidor?",
    respuesta:
      "No. El CSV se procesa en el navegador y desaparece al recargar la página. Solo viaja a classifier.dev el texto redactado de cada ticket, y classifier.dev declara que no lo almacena.",
  },
  {
    pregunta: "¿Cómo se calcula el índice de salud?",
    respuesta:
      "Pondera volumen invertido (20 %), porcentaje de críticos y altos (40 %), porcentaje en revisión manual (20 %) y tiempo medio de resolución (20 %), con renormalización entre los componentes disponibles cuando falta el tiempo. La tabla completa está más arriba, en esta misma página.",
  },
  {
    pregunta: "¿Qué pasa si la clasificación no está segura?",
    respuesta:
      "Los tickets con confianza menor que 0,7 (o sin score) se marcan para revisión manual y aparecen en una tabla con su etiqueta, su confianza y el motivo. Esa tabla se puede exportar a CSV para trabajar sobre ella.",
  },
];

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-8 pt-8 sm:px-6">
      <JsonLd
        datos={migasJsonLd([
          { nombre: "Deskmeter", ruta: `${sitioPublico()}/` },
          { nombre: "Metodología", ruta: `${sitioPublico()}/metodologia` },
        ])}
      />
      <JsonLd datos={faqJsonLd(PREGUNTAS)} />
      <nav className="mb-6 text-xs text-foreground/60" aria-label="Migas de pan">
        <Link href="/" className="underline underline-offset-2 hover:text-foreground">
          Panel
        </Link>
        <span className="mx-1.5">/</span>
        <span>Metodología</span>
      </nav>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Metodología
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          De dónde sale cada número, cómo se calcula y qué no debe leerse en él.
        </p>
      </header>

      <section className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-foreground/80">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Qué es Deskmeter
          </h2>
          <p className="mt-2">
            Un panel para mirar la salud de un helpdesk a partir del CSV
            exportado de tickets. No hay cuenta, ni API key, ni base de datos:
            el CSV se procesa en el navegador, la clasificación se pide a
            classifier.dev y nada se guarda en el servidor.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            En qué se diferencia de un panel corporativo
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Instantáneo y público</strong>: abres la URL y el panel
              está en segundos. Sin demo comercial, sin formulario de contacto
              y sin esperas de 24-48 horas.
            </li>
            <li>
              <strong>Sin backend propio ni retención</strong>: el CSV no se
              sube a ningún servidor ni se guarda en una base de datos (otros
              paneles conservan el export hasta 30 días). Solo viaja a
              classifier.dev el texto redactado de cada ticket, que no se
              almacena.
            </li>
            <li>
              <strong>Metodología abierta</strong>: el índice de salud no es un
              informe cerrado; sus pesos, umbrales y límites están publicados
              aquí y el cálculo vive en <code>lib/tickets/indice.ts</code>.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Entrada: el CSV
          </h2>
          <p className="mt-2">
            Se esperan las columnas <code>fecha</code>, <code>asunto</code> y{" "}
            <code>descripcion</code>. Son opcionales <code>estado</code>,{" "}
            <code>prioridad</code> y <code>tiempo_resolucion_horas</code>. Los
            encabezados se normalizan (tildes, mayúsculas y separadores dan
            igual) y se aceptan alias habituales como <code>date</code> o{" "}
            <code>subject</code>. Las fechas se leen en ISO (2026-09-18) o en
            formato español (18/09/2026, 18-09-2026). Las filas con fecha no
            válida se descartan y se avisa de cuántas.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Redacción de datos personales
          </h2>
          <p className="mt-2">
            Antes de enviar nada a classifier.dev, el texto (asunto +
            descripción) pasa por expresiones regulares que sustituyen correos,
            teléfonos y DNI/NIE por <code>[EMAIL]</code>,{" "}
            <code>[TELEFONO]</code> y <code>[DNI]</code>. El texto se concatena,
            se limpian los espacios y se trunca a unos 500 caracteres. El CSV
            original nunca sale del navegador; solo viaja ese texto redactado.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Clasificación con classifier.dev
          </h2>
          <p className="mt-2">
            Cada ticket se clasifica en dos pasadas independientes, cada una con
            su propia lista de etiquetas:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Categoría</strong>: hardware, software, redes,
              cuentas_accesos, facturacion u otro.
            </li>
            <li>
              <strong>Urgencia</strong>: critico, alto, normal o bajo.
            </li>
          </ul>
          <p className="mt-2">
            Las peticiones se agrupan en lotes de hasta 1000 tickets (el máximo
            de la API), con un máximo de dos en paralelo, y se reintentan los
            límites de tasa (429) y los fallos del proveedor respetando{" "}
            <code>Retry-After</code>. El tier por defecto es{" "}
            <code>fast</code>, una pasada del modelo de decisión;{" "}
            <code>smart</code> vuelve a preguntar las respuestas con confianza
            por debajo de 0,7 y tarda más. De cada pasada se guarda la etiqueta
            elegida y su confianza calibrada.
          </p>
          <p className="mt-2">
            Antes de clasificar, los textos redactados idénticos se deduplican:
            cada texto se envía una sola vez y todos los tickets con ese mismo
            texto comparten etiqueta y confianza. Así un duplicado del export
            nunca aparece con dos clasificaciones distintas y la cuota del
            clasificador se aprovecha mejor.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Revisión manual
          </h2>
          <p className="mt-2">
            Un ticket se marca para revisión manual cuando la confianza de
            cualquiera de las dos dimensiones es menor que <strong>0,7</strong>,
            cuando classifier.dev la devuelve como <code>null</code> (texto que
            no parece lenguaje natural) o cuando la etiqueta no encaja en la
            taxonomía. Es el mismo criterio que el flag <code>--review 0.7</code>{" "}
            de la CLI de classifier.dev. La tabla de revisión muestra el motivo
            y la confianza de cada dimensión.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Agregación por semana y por mes
          </h2>
          <p className="mt-2">
            Las semanas son ISO (lunes a domingo, <code>2026-W38</code>) y los
            meses naturales. Para cada periodo se calcula el histograma de
            tickets por categoría, el porcentaje de críticos y altos, el
            porcentaje en revisión manual y el tiempo medio de resolución (solo
            si la columna existe; la media se hace sobre los tickets que traen
            valor).
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Índice de salud (0–100)
          </h2>
          <p className="mt-2">
            El índice resume cada periodo en una nota de 0 a 100, donde{" "}
            <strong>100 es la mejor salud</strong>. Pondera cuatro componentes:
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-borde uppercase tracking-wide text-foreground/50">
                  <th className="py-2 pr-3 font-medium">Componente</th>
                  <th className="py-2 pr-3 font-medium">Peso</th>
                  <th className="py-2 pr-3 font-medium">Normalización</th>
                  <th className="py-2 pr-3 font-medium">Mejor si…</th>
                </tr>
              </thead>
              <tbody className="text-foreground/80">
                <tr className="border-b border-borde/60">
                  <td className="py-2 pr-3">Volumen total</td>
                  <td className="py-2 pr-3 tabular-nums">20 %</td>
                  <td className="py-2 pr-3">
                    min-max invertido entre los periodos
                  </td>
                  <td className="py-2 pr-3">menos tickets</td>
                </tr>
                <tr className="border-b border-borde/60">
                  <td className="py-2 pr-3">% críticos / altos</td>
                  <td className="py-2 pr-3 tabular-nums">40 %</td>
                  <td className="py-2 pr-3">
                    1 − porcentaje / 100
                  </td>
                  <td className="py-2 pr-3">menos críticos</td>
                </tr>
                <tr className="border-b border-borde/60">
                  <td className="py-2 pr-3">% revisión manual</td>
                  <td className="py-2 pr-3 tabular-nums">20 %</td>
                  <td className="py-2 pr-3">
                    1 − porcentaje / 100
                  </td>
                  <td className="py-2 pr-3">menos revisión</td>
                </tr>
                <tr className="border-b border-borde/60">
                  <td className="py-2 pr-3">Tiempo medio de resolución</td>
                  <td className="py-2 pr-3 tabular-nums">20 %</td>
                  <td className="py-2 pr-3">
                    min-max invertido entre los periodos
                  </td>
                  <td className="py-2 pr-3">menos horas</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            El volumen y el tiempo se normalizan con mínimo y máximo sobre los
            periodos presentes en los datos; la nota es relativa a la serie que
            estás viendo, no un valor absoluto. Si no hay columna{" "}
            <code>tiempo_resolucion_horas</code> (o ningún ticket trae valor),
            ese componente desaparece y los pesos se renormalizan entre los
            disponibles. Con un único periodo no hay referencia para el mínimo y
            el máximo, así que volumen y tiempo valen 0,5 (neutro) y el índice
            queda determinado por los porcentajes.
          </p>
          <p className="mt-2">
            La versión del cálculo vive en{" "}
            <code>lib/tickets/indice.ts</code> y los pesos son constantes
            explícitas (<code>PESOS_INDICE</code>), para que cualquiera pueda
            revisarlos o discutirlos.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Datos demo
          </h2>
          <p className="mt-2">
            El modo demo genera tickets sintéticos en el navegador, con su
            clasificación simulada (incluidas confianzas bajas y textos con
            datos personales ficticios) para que el panel se pueda ver sin subir
            nada ni llamar a ninguna API. No es una muestra real de ninguna
            organización.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Preguntas frecuentes
          </h2>
          <dl className="mt-3 flex flex-col gap-4">
            {PREGUNTAS.map((pregunta) => (
              <div key={pregunta.pregunta}>
                <dt className="font-medium text-foreground">
                  {pregunta.pregunta}
                </dt>
                <dd className="mt-1 text-foreground/80">
                  {pregunta.respuesta}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Límites conocidos
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              La confianza es una previsión calibrada de que la etiqueta sea
              correcta, no una medida de si el ticket encaja en la taxonomía: un
              ticket que no es de ninguno de los seis tipos acabará en «otro»
              con la confianza que le toque.
            </li>
            <li>
              El tier gratuito de classifier.dev permite 3.000 clasificaciones
              por minuto y 20.000 al día por IP; un ticket consume dos. El CSV
              acepta hasta 5.000 filas para no agotar la cuota compartida.
            </li>
            <li>
              El índice es una métrica editorial del proyecto: mezcla volumen,
              urgencia, confianza del clasificador y tiempo, y no es un dato
              oficial de ninguna herramienta de helpdesk.
            </li>
            <li>
              La redacción de PII es por expresiones regulares simples: reduce
              el riesgo, pero no es un anonimizador completo. No subas CSV con
              datos sensibles que no quieras enviar a un tercero.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Privacidad</h2>
          <p className="mt-2">
            No hay backend con estado: la API route solo reenvía los textos
            redactados a classifier.dev y devuelve la respuesta. classifier.dev
            no pide clave ni cuenta y declara que no almacena el texto enviado.
            El CSV completo se queda en tu navegador y desaparece al recargar la
            página.
          </p>
        </div>
      </section>

      <footer className="mt-10 border-t border-borde pt-4 text-xs text-foreground/60">
        <Link href="/" className="underline underline-offset-2 hover:text-foreground">
          Volver al panel
        </Link>
      </footer>
    </main>
  );
}
