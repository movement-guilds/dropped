"use server";

import { Redis } from "@upstash/redis";
import { supabaseAdmin } from "./supabase";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const APP_SCHEMA = process.env.APP_SCHEMA ?? "public";
const NONCE_TTL_SECONDS = 300; // 5 minutes

export interface NoncePayload {
  nonce: string;
  expiresAt: string;
}

// Issue a server-side nonce bound to discord_user_id + origin
export async function issueNonce(
  discordUserId: string,
  origin: string
): Promise<NoncePayload> {
  const nonce = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + NONCE_TTL_SECONDS * 1000).toISOString();

  await redis.setex(`wallet-nonce:${nonce}`, NONCE_TTL_SECONDS, {
    discordUserId,
    origin,
    expiresAt,
  });

  return { nonce, expiresAt };
}

export type VerifyResult =
  | { success: true }
  | { success: false; error: string };

// Verify signature + nonce, write to linked_wallets
export async function verifyAndLink(params: {
  discordUserId: string;
  walletAddress: string;
  signature: string;
  nonce: string;
  origin: string;
}): Promise<VerifyResult> {
  const { discordUserId, walletAddress, signature, nonce, origin } = params;

  // 1. Look up and consume nonce atomically
  const stored = await redis.getdel(`wallet-nonce:${nonce}`);
  if (!stored) return { success: false, error: "Invalid or expired nonce" };

  const storedData = stored as { discordUserId: string; origin: string; expiresAt: string };

  // 2. Verify nonce bindings
  if (storedData.discordUserId !== discordUserId) {
    return { success: false, error: "Nonce not issued for this user" };
  }
  if (storedData.origin !== origin) {
    return { success: false, error: "Origin mismatch" };
  }
  if (new Date(storedData.expiresAt) < new Date()) {
    return { success: false, error: "Nonce expired" };
  }

  // 3. Normalize wallet address (lowercase)
  const normalizedAddress = walletAddress.toLowerCase();

  // 4. Verify Ed25519 signature
  // Expected message: "Link wallet to Movement Guilds\nDiscord: {discordUserId}\nNonce: {nonce}\nExpires: {expiresAt}"
  const expectedMessage = `Link wallet to Movement Guilds\nDiscord: ${discordUserId}\nNonce: ${nonce}\nExpires: ${storedData.expiresAt}`;

  // Signature verification using Web Crypto API (Ed25519)
  try {
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(expectedMessage);
    const signatureBytes = Buffer.from(signature, "hex");
    const publicKeyBytes = Buffer.from(normalizedAddress.replace("0x", ""), "hex");

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      publicKeyBytes,
      { name: "Ed25519" },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify("Ed25519", cryptoKey, signatureBytes, messageBytes);
    if (!valid) return { success: false, error: "Invalid signature" };
  } catch {
    return { success: false, error: "Signature verification failed" };
  }

  // 5. Write to linked_wallets (upsert — handles swap case)
  const { error } = await supabaseAdmin
    .schema(APP_SCHEMA)
    .from("linked_wallets")
    .upsert(
      { discord_user_id: discordUserId, wallet_address: normalizedAddress, signature, nonce },
      { onConflict: "discord_user_id" }
    );

  if (error) return { success: false, error: `DB error: ${error.message}` };
  return { success: true };
}

export async function getLinkedWallet(discordUserId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .schema(APP_SCHEMA)
    .from("linked_wallets")
    .select("wallet_address")
    .eq("discord_user_id", discordUserId)
    .single();
  return data?.wallet_address ?? null;
}
