import Deskmeter from "@/app/components/Deskmeter";
import { ProveedorIdioma } from "@/app/components/idioma";

export default function Page() {
  return (
    <ProveedorIdioma idioma="es">
      <Deskmeter />
    </ProveedorIdioma>
  );
}
