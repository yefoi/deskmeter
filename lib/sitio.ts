/** URL pública del sitio para canonical, sitemap y OpenGraph; Vercel la expone sin configuración. */
export function sitioPublico(): string {
  const produccion = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (produccion) return `https://${produccion}`;
  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;
  return "http://localhost:3000";
}
