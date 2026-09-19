import type { Metadata } from "next";
import Estructura from "@/app/components/Estructura";

export const metadata: Metadata = {
  title: "Deskmeter · Salud de tu helpdesk",
  description:
    "Deskmeter: sube un CSV de tickets, clasifícalos con classifier.dev y mide la salud de tu helpdesk por semana y por mes.",
  alternates: { languages: { es: "/", en: "/en" } },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Estructura idioma="es">{children}</Estructura>;
}
