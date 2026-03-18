"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useWallet } from "@moveindustries/wallet-adapter-react";

export type WalletLinkStatus = "idle" | "linking" | "linked" | "error";

export function useWalletLink() {
  const { data: session } = useSession();
  const { account, signMessage, connected } = useWallet();
  const [status, setStatus] = useState<WalletLinkStatus>("idle");
  const [linkedAddress, setLinkedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false); // debounce concurrent calls

  useEffect(() => {
    // Check if wallet is already linked on mount
    if (session?.user?.discordId) {
      fetch("/api/wallet/status")
        .then((r) => r.json())
        .then((d) => {
          if (d.walletAddress) {
            setLinkedAddress(d.walletAddress);
            setStatus("linked");
          }
        })
        .catch(() => {});
    }
  }, [session?.user?.discordId]);

  const link = useCallback(async () => {
    if (inFlightRef.current) return; // idempotent — debounce
    if (status === "linked") return; // already linked — no-op
    if (!connected || !account?.address) {
      setError("Wallet not connected");
      return;
    }

    inFlightRef.current = true;
    setStatus("linking");
    setError(null);

    try {
      // 1. Get nonce from server
      const nonceRes = await fetch("/api/wallet/nonce");
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce, expiresAt } = await nonceRes.json();

      // 2. Sign the challenge
      const discordId = session?.user?.discordId ?? "";
      const message = `Link wallet to Movement Guilds\nDiscord: ${discordId}\nNonce: ${nonce}\nExpires: ${expiresAt}`;
      const { signature } = await signMessage({ message, nonce });

      // 3. Submit to server
      const linkRes = await fetch("/api/wallet/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: account.address.toString(),
          signature,
          nonce,
        }),
      });

      if (!linkRes.ok) {
        const err = await linkRes.json();
        throw new Error(err.error ?? "Link failed");
      }

      setLinkedAddress(account.address.toString());
      setStatus("linked");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      inFlightRef.current = false;
    }
  }, [status, connected, account, session, signMessage]);

  const unlink = useCallback(async () => {
    // Blocked when REQUIRE_WALLET_LINK=true — use swap instead
    if (process.env.NEXT_PUBLIC_REQUIRE_WALLET_LINK === "true") {
      setError("Cannot unlink when wallet linking is required. Connect a new wallet to swap.");
      return;
    }
    if (!linkedAddress) return; // already unlinked — no-op
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      await fetch("/api/wallet/unlink", { method: "POST" });
      setLinkedAddress(null);
      setStatus("idle");
    } finally {
      inFlightRef.current = false;
    }
  }, [linkedAddress]);

  return { status, linkedAddress, error, link, unlink };
}
