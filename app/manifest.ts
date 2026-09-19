import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Deskmeter",
    short_name: "Deskmeter",
    description:
      "Panel de salud de un helpdesk a partir del CSV de tickets, sin registro y sin guardar datos.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8fa",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
