import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
      <h1 className="text-4xl font-bold">Movement Guild</h1>
      {session ? (
        <p className="text-white/60">Welcome, {session.user.username}</p>
      ) : (
        <p className="text-white/60">Sign in with Discord to continue</p>
      )}
    </div>
  );
}
