import type { Metadata } from "next";
import Deskmeter from "@/app/components/Deskmeter";
import {
  aplicacionJsonLd,
  JsonLd,
} from "@/app/components/DatosEstructurados";
import { ProveedorIdioma } from "@/app/components/idioma";

export const metadata: Metadata = {
  alternates: {
    canonical: "/en",
    languages: { es: "/", en: "/en", "x-default": "/" },
  },
};

export default function Page() {
  return (
    <>
      <JsonLd datos={aplicacionJsonLd("en")} />
      <ProveedorIdioma idioma="en">
        <Deskmeter />
      </ProveedorIdioma>
    </>
  );
}
