"use client";

import { MovementWalletAdapterProvider } from "@moveindustries/wallet-adapter-react";
import type { ReactNode } from "react";

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <MovementWalletAdapterProvider
      autoConnect={false}
      onError={(error) => console.error("Wallet error:", error)}
    >
      {children}
    </MovementWalletAdapterProvider>
  );
}
