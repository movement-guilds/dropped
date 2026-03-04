import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const GUILD_ID = process.env.DISCORD_GUILD_ID!;
const ADMIN_ROLE_ID = process.env.DISCORD_ADMIN_ROLE_ID ?? "";
const MOD_ROLE_ID = process.env.DISCORD_MOD_ROLE_ID ?? "";
const ROLES_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getGuildMember(accessToken: string, guildId: string) {
  const res = await fetch(`https://discord.com/api/v10/users/@me/guilds/${guildId}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: { scope: "identify guilds guilds.members.read" },
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (!account?.access_token) return false;
      try {
        const member = await getGuildMember(account.access_token, GUILD_ID);
        // Fails closed — if Discord API is down or user not in guild, block sign-in
        return member !== null;
      } catch {
        return false;
      }
    },

    async jwt({ token, account, profile }) {
      // Initial sign-in
      if (account && profile) {
        const member = await getGuildMember(account.access_token!, GUILD_ID);
        const discordProfile = profile as Record<string, unknown>;
        return {
          ...token,
          discordId: discordProfile.id as string,
          username: discordProfile.username as string,
          discriminator: (discordProfile.discriminator as string) ?? "0",
          avatar: discordProfile.avatar as string | null,
          roles: (member?.roles ?? []) as string[],
          joinedAt: (member?.joined_at ?? null) as string | null,
          rolesRefreshedAt: Date.now(),
          accessToken: account.access_token,
        };
      }

      // Refresh roles every 24h
      if (Date.now() - (token.rolesRefreshedAt ?? 0) > ROLES_REFRESH_INTERVAL_MS) {
        try {
          const member = await getGuildMember(token.accessToken as string, GUILD_ID);
          if (!member) {
            return { ...token, error: "MembershipRevoked" as const };
          }
          return {
            ...token,
            roles: member.roles as string[],
            joinedAt: member.joined_at as string | null,
            rolesRefreshedAt: Date.now(),
            error: undefined,
          };
        } catch {
          return { ...token, error: "RefreshError" as const };
        }
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? token.discordId,
          discordId: token.discordId,
          username: token.username,
          discriminator: token.discriminator,
          avatar: token.avatar,
          roles: token.roles ?? [],
          joinedAt: token.joinedAt ?? null,
        },
        error: token.error,
      };
    },
  },
  pages: { signIn: "/login" },
};
