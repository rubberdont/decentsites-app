import type { Metadata } from "next";
import { Montserrat, Lora, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "The Modern Gentleman - Premium Barber Services",
  description: "The Premier Grooming Experience for the Modern Gentleman. Book premium barber services with expert barbers.",
  icons: {
    icon: '/barchair.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${montserrat.variable} ${lora.variable} ${inter.variable} antialiased m-0 p-0`}
      >
        <AuthProvider>
          <Header />
          <main className="min-h-screen m-0 p-0">
            {children}
          </main>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
