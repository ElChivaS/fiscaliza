import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "FISCALIZA — Tu bóveda vehicular digital",
  description:
    "Centraliza tu licencia, revisión técnica, permiso de circulación y SOAP. Muéstralos al fiscalizador desde tu celular en segundos.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FISCALIZA",
  },
};

export const viewport: Viewport = {
  themeColor: "#111010",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${syne.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full bg-background text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
