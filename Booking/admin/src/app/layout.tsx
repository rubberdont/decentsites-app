import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Booking Admin",
    template: "%s | Booking Admin",
  },
  description: "Admin dashboard for managing bookings, profiles, and availability",
  keywords: ["admin", "booking", "management", "dashboard"],
  authors: [{ name: "Booking Admin" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-admin-bg-light dark:bg-admin-bg text-admin-text-light dark:text-admin-text transition-colors duration-200">
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e293b",
                color: "#f1f5f9",
                border: "1px solid #334155",
                borderRadius: "8px",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#f1f5f9",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#f1f5f9",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
