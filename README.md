# dropped

Next.js 15 template for Movement Guild apps. Pre-wired with Discord OAuth, Movement wallet connection, and Supabase.

## What's Included

- **Discord OAuth** via next-auth — guild membership verified on sign-in, roles cached in JWT
- **Movement Wallet** — @moveindustries/wallet-adapter-react pre-configured
- **Supabase** — per-app Postgres schema, service role server actions
- **Wallet ↔ Discord linking** — opt-in via `REQUIRE_WALLET_LINK=true`
- **Shared config** — ESLint, Prettier, TypeScript, Tailwind via `@movement-guilds/shared-config`

## Using This Template

Don't clone this repo directly. Use the bootstrap script from the `.github` repo:

```bash
git clone https://github.com/movement-guilds/.github
cd .github
./scripts/new-app.sh <your-app-name> <schema-prefix>
```

See [movement-guilds-setup.md](https://github.com/movement-guilds/.github) for the full setup guide.

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local values
npm run dev
```

## Contributing

See [CONTRIBUTING.md](https://github.com/movement-guilds/.github/blob/main/CONTRIBUTING.md).
