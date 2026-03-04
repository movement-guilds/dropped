"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";

export function ConnectButton() {
  const { connect, disconnect, connected, account, wallets } = useWallet();

  if (connected && account) {
    return (
      <button
        onClick={() => disconnect()}
        className="text-sm px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition font-mono"
      >
        {account.address.slice(0, 6)}...{account.address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => wallets[0] && connect(wallets[0].name)}
      className="text-sm px-4 py-2 rounded bg-movement-blue hover:bg-blue-600 text-white font-medium transition"
    >
      Connect Wallet
    </button>
  );
}
