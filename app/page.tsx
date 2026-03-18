import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGuildRoles, getRoleById, intToHex } from "@/lib/discord";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const guildRoles = session ? await getGuildRoles() : [];

  // Filter out @everyone role and sort by position (highest first)
  const userRoles = session?.user.roles
    ?.map((id) => getRoleById(guildRoles, id))
    .filter((r): r is NonNullable<typeof r> => r !== undefined && r.name !== "@everyone")
    .sort((a, b) => b.position - a.position) ?? [];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6 p-4">
      <h1 className="text-4xl font-bold">Movement Guild</h1>
      {session ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <p className="text-white/60">Welcome, {session.user.username}</p>

          <div className="w-full bg-white/5 border border-white/10 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Your Roles</h2>
            {userRoles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userRoles.map((role) => (
                  <span
                    key={role.id}
                    className="px-2 py-1 rounded text-sm font-medium"
                    style={{
                      backgroundColor: `${intToHex(role.color)}20`,
                      borderWidth: 1,
                      borderColor: `${intToHex(role.color)}60`,
                      color: intToHex(role.color),
                    }}
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm">
                {guildRoles.length === 0 ? "Add DISCORD_BOT_TOKEN to show role names" : "No roles found"}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-white/60">Sign in with Discord to continue</p>
      )}
    </div>
  );
}
