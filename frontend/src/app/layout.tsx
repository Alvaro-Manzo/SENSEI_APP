import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sensei App — Gestión de academias deportivas",
  description: "La herramienta de automatización de alumnos #1 de LATAM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
