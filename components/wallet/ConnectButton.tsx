"use client";

import { useWallet } from "@moveindustries/wallet-adapter-react";
import { useState } from "react";
import { WalletModal } from "./WalletModal";

export function ConnectButton() {
  const { disconnect, connected, account } = useWallet();
  const [showModal, setShowModal] = useState(false);

  if (connected && account) {
    const addr = account.address.toString();
    return (
      <button
        onClick={() => disconnect()}
        className="text-sm px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition font-mono"
      >
        {addr.slice(0, 6)}...{addr.slice(-4)}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm px-4 py-2 rounded bg-movement-blue hover:bg-blue-600 text-white font-medium transition"
      >
        Connect Wallet
      </button>
      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </>
  );
}
