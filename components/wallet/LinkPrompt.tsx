"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useWalletLink } from "@/hooks/useWalletLink";
import { ConnectButton } from "./ConnectButton";

export function LinkPrompt() {
  const { connected } = useWallet();
  const { status, error, link } = useWalletLink();

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-white/10 bg-white/5 max-w-md mx-auto mt-12">
      <h2 className="text-lg font-semibold text-white">Link Your Wallet</h2>
      <p className="text-sm text-white/60 text-center">
        This app requires a linked Movement wallet to continue.
      </p>
      {!connected ? (
        <ConnectButton />
      ) : (
        <button
          onClick={link}
          disabled={status === "linking"}
          className="px-6 py-2 rounded bg-movement-blue hover:bg-blue-600 text-white font-medium transition disabled:opacity-50"
        >
          {status === "linking" ? "Signing…" : "Link Wallet"}
        </button>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
