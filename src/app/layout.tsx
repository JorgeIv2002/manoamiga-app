import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://manoamiga-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "ManoAmiga Nuevo León | Encuentra Ayuda Confiable en Minutos (Plomeros, Limpieza, Fletes y Más)",
    template: "%s | ManoAmiga Nuevo León",
  },
  description:
    "Conecta en minutos con plomeros, electricistas, limpieza profunda, fletes, mudanzas, mandados y soporte técnico verificados en Monterrey y todo Nuevo León. Precios claros y trato directo.",
  keywords: [
    "plomero en Monterrey",
    "electricista urgente Monterrey",
    "servicios del hogar Nuevo León",
    "fletes y mudanzas Monterrey",
    "limpieza a domicilio San Pedro Garza García",
    "ayuda para mandados Monterrey",
    "reparaciones del hogar San Nicolás",
    "técnico en computadoras y WiFi Monterrey",
    "ManoAmiga",
    "oficios y servicios Nuevo León",
    "trabajos independientes Monterrey",
  ],
  authors: [{ name: "ManoAmiga Nuevo León", url: SITE_URL }],
  creator: "ManoAmiga",
  publisher: "ManoAmiga",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: "ManoAmiga Nuevo León",
    title:
      "ManoAmiga | ¿Un imprevisto en casa? Resuélvelo hoy con expertos verificados en Nuevo León",
    description:
      "Desde una fuga de agua o instalar un minisplit hasta una mudanza o limpieza profunda. Encuentra ayuda confiable en Monterrey y su área metropolitana en menos de 10 minutos.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "ManoAmiga - Expertos y Solucionadores Confiables en Nuevo León, México",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "ManoAmiga Nuevo León | Solucionadores Verificados para tu Hogar y Día a Día",
    description:
      "Encuentra plomeros, electricistas, limpieza, mudanzas y mandados en Monterrey y Nuevo León en minutos. Sin letras chiquitas y con precios justos.",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "ZWUKzq7-u_f7rTANN4V6nCobkcOENP6Amx9nFYD9O08",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#18181B] selection:bg-[#0F4C3A] selection:text-white">
        {children}
      </body>
    </html>
  );
}
