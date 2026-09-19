import type { Idioma } from "@/lib/tickets/idioma";
import { geistMono, geistSans } from "../fuentes";
import Cabecera from "./Cabecera";
import Pie from "./Pie";

const GUION_TEMA = `(function(){try{var t=localStorage.getItem("deskmeter-tema");var o=t?t==="oscuro":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",o);}catch(e){}})();`;

export default function Estructura({
  idioma,
  children,
}: {
  idioma: Idioma;
  children: React.ReactNode;
}) {
  return (
    <html lang={idioma} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: GUION_TEMA }} />
        <Cabecera idioma={idioma} />
        {children}
        <Pie idioma={idioma} />
      </body>
    </html>
  );
}
