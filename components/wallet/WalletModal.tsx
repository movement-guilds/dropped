"use client";

import { useWallet } from "@moveindustries/wallet-adapter-react";
import { useState } from "react";

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { wallets, connect } = useWallet();
  const [connecting, setConnecting] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Select Wallet</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">×</button>
        </div>
        <div className="flex flex-col gap-2">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={async () => {
                setConnecting(wallet.name);
                await connect(wallet.name);
                onClose();
              }}
              disabled={connecting === wallet.name}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition disabled:opacity-50"
            >
              {wallet.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
