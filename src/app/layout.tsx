import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreeFy - Encuentra objetos gratis en Madrid",
  description: "Descubre muebles, electrodomésticos, bicicletas y más que personas regalan cerca de ti en Madrid. Sé el primero en saberlo.",
  keywords: ["gratis", "Madrid", "muebles", "objetos gratis", "donaciones"],
  authors: [{ name: "FreeFy" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://freefy.es",
    siteName: "FreeFy",
    title: "FreeFy - Encuentra objetos gratis en Madrid",
    description: "Descubre muebles, electrodomésticos, bicicletas y más que personas regalan cerca de ti en Madrid.",
    images: [
      {
        url: "https://freefy.es/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FreeFy - Objetos gratis en Madrid",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreeFy - Encuentra objetos gratis en Madrid",
    description: "Descubre objetos gratis cerca de ti en Madrid.",
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
