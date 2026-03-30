import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { BottomNav } from "@/components/pwa/BottomNav";
import { PushPrompt } from "@/components/PushPrompt";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://ziben.onrender.com"),
  title: "Ziben — Ce soir, tu fais quoi ? | Événements à Nice",
  description:
    "Découvre les meilleurs événements à Nice : concerts, marchés, apéros, ateliers, expos. Tous les bons plans, au même endroit.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ziben",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Ziben — Ce soir, tu fais quoi ? | Événements à Nice",
    description: "Découvre les meilleurs événements à Nice : concerts, marchés, apéros, ateliers, expos. Tous les bons plans, au même endroit.",
    siteName: "Ziben",
    type: "website",
    locale: "fr_FR",
    url: "/",
    images: [{ url: "/icons/icon-512.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ziben — Ce soir, tu fais quoi ? | Événements à Nice",
    description: "Découvre les meilleurs événements à Nice : concerts, marchés, apéros, ateliers, expos. Tous les bons plans, au même endroit.",
    images: ["/icons/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ff5a36",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        {/* iOS PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ziben" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512.png" />
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#ff5a36" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.png" />
      </head>
      <body className={`${jakarta.variable} font-sans`}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen pb-20 md:pb-0">{children}</main>
          <BottomNav />
          <Footer />
          <PWAInstallPrompt />
          <PushPrompt />
        </AuthProvider>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
