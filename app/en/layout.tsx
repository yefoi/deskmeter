import type { Metadata } from "next";
import Estructura from "@/app/components/Estructura";

export const metadata: Metadata = {
  title: "Deskmeter · Your helpdesk health",
  description:
    "Deskmeter: upload a ticket CSV, classify it with classifier.dev and measure your helpdesk's health per week and per month.",
  alternates: { languages: { es: "/", en: "/en" } },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Estructura idioma="en">{children}</Estructura>;
}
