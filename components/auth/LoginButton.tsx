"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className="h-9 w-24 animate-pulse bg-white/10 rounded" />;

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/70">{session.user.username}</span>
        <button
          onClick={() => signOut()}
          className="text-sm px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("discord")}
      className="text-sm px-4 py-2 rounded bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium transition"
    >
      Sign in with Discord
    </button>
  );
}
