import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "WBC NotePad - Caderno Digital de Senhas",
  description:
    "Guarde todas as suas senhas em um caderno digital seguro. Acesso online, criptografado e disponível 24/7.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WBC NotePad",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  if (reg.installing) {
                    reg.installing.addEventListener('statechange', function() {
                      if (this.state === 'activated') {
                        document.dispatchEvent(new CustomEvent('sw-activated'))
                      }
                    })
                  } else if (reg.active) {
                    document.dispatchEvent(new CustomEvent('sw-activated'))
                  }
                })
              }
              window.__deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredPrompt = e;
                document.dispatchEvent(new CustomEvent('install-ready'));
              });
              window.__installApp = async function() {
                var prompt = window.__deferredPrompt;
                if (!prompt) return false;
                prompt.prompt();
                var result = await prompt.userChoice;
                window.__deferredPrompt = null;
                return result.outcome === 'accepted';
              };
            `,
          }}
        />
      </body>
    </html>
  )
}
