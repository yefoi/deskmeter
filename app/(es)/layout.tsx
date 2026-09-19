import type { Metadata, Viewport } from "next";
import "../globals.css";
import Estructura from "@/app/components/Estructura";
import { sitioPublico } from "@/lib/sitio";

export const metadata: Metadata = {
  metadataBase: new URL(sitioPublico()),
  title: {
    default: "Deskmeter · Salud de tu helpdesk",
    template: "%s · Deskmeter",
  },
  description:
    "Sube el CSV de tickets de tu helpdesk y obtén un panel de salud: índice por semana y por mes, categorías, urgencia y revisión manual. Clasificación con classifier.dev, sin registro y sin guardar datos.",
  applicationName: "Deskmeter",
  keywords: [
    "helpdesk",
    "mesa de ayuda",
    "tickets",
    "CSV de tickets",
    "panel de helpdesk",
    "índice de salud",
    "clasificación de tickets",
    "classifier.dev",
    "soporte técnico",
  ],
  authors: [{ name: "Deskmeter" }],
  creator: "Deskmeter",
  category: "technology",
  openGraph: {
    type: "website",
    siteName: "Deskmeter",
    locale: "es_ES",
    url: "/",
    title: "Deskmeter · Salud de tu helpdesk",
    description:
      "Panel de salud de un helpdesk a partir del CSV de tickets: índice abierto, categorías, urgencia y revisión manual. Sin registro y sin guardar datos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deskmeter · Salud de tu helpdesk",
    description:
      "Sube tu CSV de tickets y mira la salud del helpdesk en segundos. Índice de metodología abierta, sin registro y sin guardar datos.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Estructura idioma="es">{children}</Estructura>;
}
