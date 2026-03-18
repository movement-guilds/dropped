const GUILD_ID = process.env.DISCORD_GUILD_ID!;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export type DiscordRole = {
  id: string;
  name: string;
  color: number;
  position: number;
};

let cachedRoles: DiscordRole[] | null = null;
let cacheExpiry = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export async function getGuildRoles(): Promise<DiscordRole[]> {
  if (cachedRoles && Date.now() < cacheExpiry) {
    return cachedRoles;
  }

  if (!BOT_TOKEN) {
    console.warn("DISCORD_BOT_TOKEN not set - cannot fetch role names");
    return [];
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/roles`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("Failed to fetch guild roles:", res.status);
      return cachedRoles ?? [];
    }

    const roles = await res.json();
    cachedRoles = roles.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: r.name as string,
      color: r.color as number,
      position: r.position as number,
    }));
    cacheExpiry = Date.now() + CACHE_DURATION_MS;

    return cachedRoles;
  } catch (err) {
    console.error("Error fetching guild roles:", err);
    return cachedRoles ?? [];
  }
}

export function getRoleById(roles: DiscordRole[], id: string): DiscordRole | undefined {
  return roles.find((r) => r.id === id);
}

export function intToHex(color: number): string {
  if (color === 0) return "#99AAB5"; // Discord default gray
  return `#${color.toString(16).padStart(6, "0")}`;
}
