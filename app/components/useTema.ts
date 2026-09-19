"use client";

import { useEffect, useState } from "react";
import type { Tema } from "./colores";

export function useTema(): Tema {
  const [tema, setTema] = useState<Tema>("claro");

  useEffect(() => {
    const raiz = document.documentElement;
    const actualizar = () =>
      setTema(raiz.classList.contains("dark") ? "oscuro" : "claro");
    actualizar();
    const observador = new MutationObserver(actualizar);
    observador.observe(raiz, { attributes: true, attributeFilter: ["class"] });
    return () => observador.disconnect();
  }, []);

  return tema;
}
