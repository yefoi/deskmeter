"use client";

import { useEffect, useState } from "react";

export function useNumeroAnimado(
  valor: number | null,
  duracion = 700,
): number | null {
  const [mostrado, setMostrado] = useState<number | null>(
    valor === null ? null : 0,
  );

  useEffect(() => {
    if (valor === null) {
      setMostrado(null);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMostrado(valor);
      return;
    }

    let frame = 0;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const avance = Math.min(1, (ahora - inicio) / duracion);
      const suavizado = 1 - Math.pow(1 - avance, 3);
      setMostrado(valor * suavizado);
      if (avance < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [valor, duracion]);

  return mostrado;
}
