# Deskmeter

Panel de salud de una mesa de ayuda a partir del CSV de tickets exportado, con la
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
De cada respuesta se guarda la etiqueta y su confianza calibrada.

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
  etiquetas.ts   taxonomía, instrucciones y umbral de revisión
  clasificar.ts  lotes, reintentos, progreso y composición del ticket
  agregar.ts     resumen, agrupación por periodo y mapa de calor
  indice.ts      índice de salud y pesos
  demo.ts        datos sintéticos deterministas
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
