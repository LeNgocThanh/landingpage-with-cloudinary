import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from '@/components/Footer'
import FloatingContact from '@/components/FloatingContact'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lầu Mây",
  description: "Với Lều Mây trải nghiệm của khách hàng là vô cùng quan trọng",
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
         <main className="min-h-screen">
        {children}
        </main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
