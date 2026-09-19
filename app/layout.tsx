import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Cabecera from "./components/Cabecera";
import Pie from "./components/Pie";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deskmeter · Salud de tu mesa de ayuda",
  description:
    "Deskmeter: sube un CSV de tickets, clasifícalos con classifier.dev y mide la salud de tu mesa de ayuda por semana y por mes.",
};

const GUION_TEMA = `(function(){try{var t=localStorage.getItem("deskmeter-tema");var o=t?t==="oscuro":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",o);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: GUION_TEMA }} />
        <Cabecera />
        {children}
        <Pie />
      </body>
    </html>
  );
}
