import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MiProne — Mi Producción, Mi Negocio",
  description: "Sistema de gestión avícola para pequeños y medianos productores rurales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              style: { fontFamily: 'inherit' },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
