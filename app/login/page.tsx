"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6">
      <h1 className="text-3xl font-bold">Sign In</h1>
      {error === "MembershipRevoked" && (
        <p className="text-red-400 text-sm">
          You are no longer a member of the Movement Discord server.
        </p>
      )}
      <button
        onClick={() => signIn("discord", { callbackUrl: "/" })}
        className="px-8 py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition"
      >
        Sign in with Discord
      </button>
    </div>
  );
}
