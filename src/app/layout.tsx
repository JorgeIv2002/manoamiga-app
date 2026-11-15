import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ManoAmiga | Encuentra ayuda rápida para cualquier problema",
  description:
    "La plataforma donde cualquier persona encuentra rápidamente a alguien de confianza que le ayude a solucionar desde una reparación en casa hasta una necesidad cotidiana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
