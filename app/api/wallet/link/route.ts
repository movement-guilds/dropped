import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { verifyAndLink } from "@/lib/wallet-link";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { walletAddress, signature, nonce } = body;

  if (!walletAddress || !signature || !nonce) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "";
  const result = await verifyAndLink({
    discordUserId: session.user.discordId,
    walletAddress,
    signature,
    nonce,
    origin,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
