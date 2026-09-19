"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Idioma } from "@/lib/tickets/idioma";
import { TEXTOS, type Textos } from "@/lib/tickets/textos";

interface ValorIdioma {
  idioma: Idioma;
  t: Textos;
}

const Contexto = createContext<ValorIdioma>({ idioma: "es", t: TEXTOS.es });

export function ProveedorIdioma({
  idioma,
  children,
}: {
  idioma: Idioma;
  children: ReactNode;
}) {
  return (
    <Contexto.Provider value={{ idioma, t: TEXTOS[idioma] }}>
      {children}
    </Contexto.Provider>
  );
}

export function useIdioma(): ValorIdioma {
  return useContext(Contexto);
}
