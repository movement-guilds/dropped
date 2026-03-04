import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      discordId: string;
      username: string;
      discriminator: string;
      avatar: string | null;
      roles: string[];
      joinedAt: string | null;
    } & DefaultSession["user"];
    error?: "MembershipRevoked" | "RefreshError";
  }

  interface User extends DefaultUser {
    discordId: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    roles: string[];
    joinedAt: string | null;
    rolesRefreshedAt: number;
    error?: "MembershipRevoked" | "RefreshError";
  }
}
