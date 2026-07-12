import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WBC NotePad - Caderno Digital de Senhas",
    short_name: "WBC NotePad",
    description: "Seu caderno de senhas online e seguro",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#13D0D0",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
