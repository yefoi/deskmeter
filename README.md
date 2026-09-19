# Deskmeter

Panel de salud de un helpdesk a partir del CSV de tickets exportado, con la
clasificación de [classifier.dev](https://classifier.dev) (sin API key ni cuenta) y un
índice propio. Next.js 15 (App Router), TypeScript, Recharts y papaparse.

- **Ingesta**: el CSV se lee en el navegador con papaparse. Columnas mínimas `fecha`,
  `asunto` y `descripcion`; opcionales `estado`, `prioridad` y
  `tiempo_resolucion_horas`. Se aceptan alias (`date`, `subject`, `description`…),
  fechas ISO o `dd/mm/aaaa` y coma decimal en las horas. Las filas con fecha no válida
  se descartan y se cuentan. Hay modo demo con datos sintéticos.
- **Redacción**: antes de enviar nada a classifier.dev, unas regex simples sustituyen
  correos, teléfonos y DNI/NIE por `[EMAIL]`, `[TELEFONO]` y `[DNI]`. El texto
  (asunto + descripción) se limpia y se trunca a ~500 caracteres.
- **Clasificación**: dos pasadas por lote (categoría y urgencia), hasta 1000 tickets
  por request cada una, tier `fast` por defecto. La API route es efímera: reenvía y
  devuelve, no guarda nada.
- **Agregación**: por semana ISO y por mes; histograma por categoría, % de críticos/altos,
  % de revisión manual y tiempo medio de resolución.
- **Visualización**: portada con tendencia del índice, mapa de calor categoría × semana,
  histograma apilado, tabla de tickets en revisión manual y KPI; página `/metodologia`;
  tema claro/oscuro; responsive.
- **Instrucciones por sector**: además del criterio general, la urgencia se afina con
  instrucciones propias para clínica/salud, comercio con TPV y colegio/educación
  (`lib/tickets/sectores.ts`), algo que un modelo genérico no hace.
- **Comparador de dos periodos**: la portada permite subir un segundo CSV (por ejemplo, el
  periodo anterior) y compara índice del último periodo, volumen, urgencia, revisión y
  tiempo entre ambos archivos, con la variación de cada métrica.
- **Bilingüe**: la interfaz está en español (`/`, `/metodologia`) e inglés (`/en`,
  `/en/methodology`), con conmutador en la cabecera, `<html lang>` y metadatos propios por
  versión. Los textos viven en `lib/tickets/textos.ts` y las etiquetas que se envían al
  clasificador cambian con el idioma.

## Qué cambia respecto a un panel corporativo

- **Instantáneo y público**: abrir la URL, subir el CSV y ver el panel en segundos. Sin
  demo comercial, sin formulario de contacto y sin esperas de 24-48 horas.
- **Sin backend propio ni persistencia**: el CSV se procesa en el navegador y no se
  guarda en ninguna base de datos (otros paneles retienen el export hasta 30 días). Solo
  viaja a classifier.dev el texto redactado de cada ticket.
- **Índice con metodología abierta**: pesos, umbrales y límites están en `/metodologia` y
  en `lib/tickets/indice.ts`, no en un informe corporativo cerrado.

## Compatibilidad del CSV

El parser normaliza encabezados y acepta alias de exportaciones habituales (Zendesk,
Freshdesk, Jira, Zoho): `Created at`, `Created time`, `Subject`, `Summary`, `Details`,
`Description`, `Status`, `Priority`, `Resolution time`… Los encabezados pueden estar en
español o en inglés, incluso mezclados en el mismo archivo (`date, asunto, Description`),
y la plantilla descargable usa el idioma activo. Además deduce la fecha por encabezados
que contengan `fecha`/`created`/`opened` y la descripción por
`description`/`body`/`details`/`detalle`. Se leen separadores de coma, punto y coma y
tabulador. Si faltan las tres columnas mínimas, el panel no envía nada a classifier.dev:
avisa de cuáles faltan y de las columnas que ha detectado.

También se aceptan hojas de Excel (`.xlsx`), convertidas a CSV en el navegador con
`read-excel-file` mediante import dinámico (no pesa en la carga inicial). Y cuando la
detección automática no basta, aparece el **mapeo manual de columnas**: una pantalla que
muestra los encabezados y las primeras filas del archivo para asignar a mano fecha,
asunto, descripción y los campos opcionales antes de clasificar. Hay tests con
exportaciones reales de GLPI (`Título`, `Descripción`, `Fecha de apertura`, `Estado`,
`Prioridad`, `Tiempo de resolución`) y OTRS (`Title`, `Description`, `State`, `Priority`,
`Created`).

## SEO

- Metadatos por idioma (título con plantilla, descripción, keywords, OpenGraph, Twitter y
  `theme-color`) con `metadataBase` resuelto desde Vercel sin variables obligatorias.
- Canónicas y `hreflang` (`es`, `en`, `x-default`) en cada página; `sitemap.xml` con
  alternates de idioma y `robots.txt`.
- Imagen OpenGraph 1200×630 generada en build para cada idioma, JSON-LD
  (`WebApplication`, `BreadcrumbList` y `FAQPage` con las preguntas frecuentes de
  metodología) y `manifest.webmanifest`.

## Puesta en marcha

Requisitos: Node.js 20 o superior y npm.

```bash
npm install
npm run dev            # web en http://localhost:3000
npm test               # tests de parser, índice, PII, fechas y agregación
npm run typecheck
npm run lint
npm run build
```

No hay variables de entorno: classifier.dev no pide clave y el proyecto funciona en
local o en Vercel tal cual. `ejemplos/tickets-ejemplo.csv` sirve para probar la subida;
el botón «Cargar datos demo» muestra el panel al instante con clasificación simulada.

## Clasificación con classifier.dev

Cada ticket se clasifica en dos pasadas independientes:

| Pasada | Etiquetas |
| --- | --- |
| `categoria` | hardware, software, redes, cuentas_accesos, facturacion, otro |
| `urgencia` | critico, alto, normal, bajo |

El texto que se envía es asunto + descripción, redactado y truncado. Las peticiones se
agrupan en lotes de hasta 1000 (el máximo de la API) con dos en paralelo, y se
reintentan los 429 respetando `Retry-After` y los fallos 5xx con espera exponencial.
De cada respuesta se guarda la etiqueta y su confianza calibrada. Antes de clasificar,
los textos idénticos se deduplican: cada texto se clasifica una sola vez y todos los
tickets con ese mismo texto comparten etiqueta y confianza, de modo que un duplicado del
export nunca aparece con dos clasificaciones distintas (y no consume cuota extra). Para
la urgencia, el parámetro `instructions` de classifier.dev se adapta al sector elegido
(general, clínica, comercio con TPV o colegio).

La casilla **«Detectar áreas adicionales»** añade una tercera pasada con `multi=true`
que guarda qué otras áreas toca cada ticket (por ejemplo, redes y cuentas de acceso a la
vez). Las áreas adicionales aparecen en la tabla de revisión (con su score) y en el CSV
exportado, pero la agregación, el índice y la comparación siguen contando solo la
categoría principal, para no contar dos veces el mismo ticket. Va desactivada por
defecto porque suma una clasificación por texto único.

Un ticket se marca para **revisión manual** cuando la confianza de cualquiera de las dos
dimensiones es menor que `0.7`, cuando llega como `null` (texto que no parece lenguaje
natural) o cuando la etiqueta no encaja en la taxonomía. Es el mismo criterio que
`classify --review 0.7` de la CLI de classifier.dev. El tier por defecto es `fast`; el
selector permite `smart`, que vuelve a preguntar lo dudoso y tarda más.

## Índice de salud (0–100)

Nota propia por semana y por mes, donde **100 es la mejor salud**. Pondera volumen total
(invertido), % de críticos/altos, % de revisión manual y tiempo medio de resolución. Los
pesos viven en `lib/tickets/indice.ts`:

| Componente | Peso | Normalización | Mejor si… |
| --- | --- | --- | --- |
| Volumen total | 20 % | min-max invertido entre periodos | menos tickets |
| % críticos / altos | 40 % | `1 − porcentaje / 100` | menos críticos |
| % revisión manual | 20 % | `1 − porcentaje / 100` | menos revisión |
| Tiempo medio | 20 % | min-max invertido entre periodos | menos horas |

Si no hay columna `tiempo_resolucion_horas` (o ningún ticket trae valor), ese componente
desaparece y los pesos se renormalizan entre los disponibles. Volumen y tiempo son
relativos a los periodos presentes en los datos; con un único periodo valen 0,5 y el
índice queda determinado por los porcentajes. La explicación completa está en
`/metodologia`.

## Estructura

```
lib/tickets/
  csv.ts         parser, alias de columnas y validación de filas
  fechas.ts      semana ISO, mes y lectura de fechas
  pii.ts         redacción de correos, teléfonos y DNI/NIE
  etiquetas.ts   taxonomía, instrucciones y umbral de revisión (es/en)
  textos.ts      diccionario de toda la interfaz y los mensajes (es/en)
  idioma.ts      tipo Idioma y guardas
  clasificar.ts  lotes, reintentos, progreso y composición del ticket
  agregar.ts     resumen, agrupación por periodo y mapa de calor
  indice.ts      índice de salud y pesos
  demo.ts        datos sintéticos deterministas (es/en)
app/(es)/        portada y metodología en español
app/en/          portada y /en/methodology en inglés
app/api/clasificar/route.ts   proxy efímero a classifier.dev
```

## Privacidad

El CSV se procesa en el navegador y no se persiste en ningún servidor. La API route solo
reenvía a classifier.dev el texto ya redactado de cada ticket y devuelve la respuesta;
classifier.dev declara que no almacena el texto. La redacción es por regex: reduce el
riesgo, no es un anonimizador completo.

## Límites

- La confianza de classifier.dev es una previsión de que la etiqueta sea correcta, no una
  medida de si el ticket encaja en la taxonomía.
- El tier gratuito permite 3.000 clasificaciones por minuto y 20.000 al día por IP; un
  ticket consume dos. El CSV acepta hasta 5.000 filas para no agotar la cuota.
- El índice es una métrica editorial del proyecto, no un dato oficial de ninguna
  herramienta de helpdesk.
- El modo demo genera datos sintéticos y clasificación simulada; no representa a ninguna
  organización.

## Deploy

Importa el repositorio en Vercel tal cual. No hay secretos que configurar. En Vercel, la
API route usa el runtime de Node y un límite de 60 segundos (`maxDuration`), suficiente
porque cada request reenvía un solo lote de hasta 1000 textos.
