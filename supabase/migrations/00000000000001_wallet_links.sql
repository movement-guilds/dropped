-- linked_wallets: Discord ↔ wallet address identity linking
-- Always present in every guild app. Enforcement is opt-in via REQUIRE_WALLET_LINK env var.

CREATE TABLE IF NOT EXISTS dropped.linked_wallets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_user_id TEXT NOT NULL,
  wallet_address  TEXT NOT NULL CHECK (wallet_address = lower(wallet_address)),
  -- wallet_address MUST be lowercased before insert (enforced here + in server action)
  signature       TEXT NOT NULL,
  nonce           TEXT NOT NULL,
  verified_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_discord_user   UNIQUE (discord_user_id),  -- one wallet per Discord user
  CONSTRAINT uq_wallet_address UNIQUE (wallet_address)    -- one Discord user per wallet
);

CREATE INDEX IF NOT EXISTS idx_linked_wallets_discord
  ON dropped.linked_wallets (discord_user_id);

CREATE INDEX IF NOT EXISTS idx_linked_wallets_wallet
  ON dropped.linked_wallets (wallet_address);

-- RLS: deny all direct client access
-- All reads/writes go through server actions using the service role key (bypasses RLS)
ALTER TABLE dropped.linked_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct client access"
  ON dropped.linked_wallets
  FOR ALL
  USING (false);
