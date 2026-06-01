import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pillalo.app"),
  title: "Píllalo - Cosas gratis cerca de ti",
  description: "Descubre muebles, electrodomésticos, bicicletas y más que personas regalan cerca de ti en Madrid. Píllalo antes de que desaparezca.",
  keywords: ["gratis", "Madrid", "muebles", "objetos gratis", "donaciones"],
  authors: [{ name: "Pillalo" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "Píllalo",
    title: "Píllalo - Cosas gratis cerca de ti",
    description: "Descubre muebles, electrodomésticos, bicicletas y más que personas regalan cerca de ti en Madrid.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Píllalo - Objetos gratis en Madrid",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Píllalo - Cosas gratis cerca de ti",
    description: "Descubre objetos gratis cerca de ti en Madrid.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased scroll-smooth`}>
      <body className="bg-white text-slate-900 font-sans antialiased flex flex-col min-h-full">
        {children}
      </body>
    </html>
  );
}
