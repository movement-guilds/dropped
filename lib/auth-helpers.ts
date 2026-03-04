import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.error === "MembershipRevoked") redirect("/login?error=MembershipRevoked");
  return session;
}

export function isAdmin(roles: string[]): boolean {
  const adminRoleId = process.env.DISCORD_ADMIN_ROLE_ID;
  return !!adminRoleId && roles.includes(adminRoleId);
}

export function isMod(roles: string[]): boolean {
  const modRoleId = process.env.DISCORD_MOD_ROLE_ID;
  return !!modRoleId && roles.includes(modRoleId);
}

export function hasRole(roles: string[], roleId: string): boolean {
  return roles.includes(roleId);
}
