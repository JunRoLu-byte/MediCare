import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediCare - Sistema de Consultorio Médico",
  description: "Gestiona tu salud desde un solo lugar. Agenda citas, consulta tu historial médico y mantente conectado con profesionales de la salud.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
