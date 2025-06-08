import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { TokenProvider } from "./contexts/TokenContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Okto Demo App",
  description: "Okto Demo App using direct API calls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <TokenProvider>
            {children}
          </TokenProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
