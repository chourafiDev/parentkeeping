# Parentkeeping store

Digital-product store for Parentkeeping (US buyers, Stripe Checkout), with an admin
dashboard that uses the same design system as the Noria admin (Sage palette).

Stack: Next.js 16 · Tailwind v4 + shadcn (radix-nova) · Drizzle + Postgres (Neon in
production) · Better Auth (admin only) · Hono API under `/api`.

## Local setup

```bash
pnpm install
cp .env.example .env.local   # fill DATABASE_URL, BETTER_AUTH_SECRET
createdb parentkeeping       # local Postgres, or use a Neon URL
pnpm db:migrate
pnpm db:seed               # 4 products, their files, default settings
pnpm auth:create-owner       # first admin account
pnpm dev                     # http://localhost:3001/admin
```

The dev server runs on port 3001 so it can run next to the Noria store on 3000.

## File storage

Product files (PDFs) live in a private Cloudflare R2 bucket and are only reachable
through short-lived signed links; cover images go to a public bucket. Set the `R2_*`
variables from `.env.example`. Without them, development stores files in `./.storage`
(signed local URLs via `/api/dev-storage`); production refuses uploads until R2 is set.
