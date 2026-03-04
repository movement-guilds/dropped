import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { WalletProvider } from "@/lib/wallet-provider";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movement Guild App",
  description: "A Movement community guild app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-movement-dark min-h-screen text-white">
        <SessionProvider>
          <WalletProvider>
            <Header />
            <main>{children}</main>
          </WalletProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
