import type { Metadata, Viewport } from "next";
import Estructura from "@/app/components/Estructura";
import { sitioPublico } from "@/lib/sitio";

export const metadata: Metadata = {
  metadataBase: new URL(sitioPublico()),
  title: {
    default: "Deskmeter · Your helpdesk health",
    template: "%s · Deskmeter",
  },
  description:
    "Upload your helpdesk ticket CSV and get a health dashboard: index per week and month, categories, urgency and manual review. Classification with classifier.dev, no sign-up and no stored data.",
  applicationName: "Deskmeter",
  keywords: [
    "helpdesk",
    "support tickets",
    "ticket CSV",
    "helpdesk dashboard",
    "health index",
    "ticket classification",
    "classifier.dev",
    "customer support",
  ],
  authors: [{ name: "Deskmeter" }],
  creator: "Deskmeter",
  category: "technology",
  openGraph: {
    type: "website",
    siteName: "Deskmeter",
    locale: "en_US",
    url: "/en",
    title: "Deskmeter · Your helpdesk health",
    description:
      "A helpdesk health dashboard from your ticket CSV: open index, categories, urgency and manual review. No sign-up, no stored data.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deskmeter · Your helpdesk health",
    description:
      "Upload your ticket CSV and see your helpdesk health in seconds. Open-methodology index, no sign-up, no stored data.",
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
  return <Estructura idioma="en">{children}</Estructura>;
}
