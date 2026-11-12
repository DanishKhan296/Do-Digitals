# TIMES UP COLLECTIONS — Deployment Guide

## Quick Start (Local Development)

```bash
# 1. Install dependencies
bun install

# 2. Create .env file (see Environment Setup below)
cp .env.example .env
# Edit .env with your values

# 3. Generate Prisma client
bun run db:generate

# 4. Push database schema (creates tables)
bun run db:push

# 5. (Optional) Seed sample data
bun run scripts/seed.ts

# 6. Start dev server
bun run dev
```

Visit http://localhost:3000

## Environment Setup

### For Local Development (SQLite)
```
DATABASE_URL=file:./db/custom.db
ADMIN_SESSION_SECRET=<run: openssl rand -hex 32>
```

### For Vercel Production (Neon PostgreSQL)
1. Create a free account at https://neon.com
2. Create a new project
3. Copy the pooled connection string
4. Set these environment variables in Vercel:
   - `DATABASE_URL` = your Neon connection string
   - `ADMIN_SESSION_SECRET` = a random 64-char hex string

## Deploy to Vercel

1. Push this project to GitHub
2. Go to https://vercel.com → New Project → Import your repo
3. Add environment variables (DATABASE_URL, ADMIN_SESSION_SECRET)
4. Deploy

### Vercel Build Settings
- Framework: Next.js (auto-detected)
- Build Command: `bun run build` (or `npm run build`)
- Install Command: `bun install` (or `npm install`)
- The `postinstall` script auto-runs `prisma generate`

## Admin Access

Default credentials (CHANGE IMMEDIATELY):
- URL: /#/admin
- Username: admin
- Password: admin123

## Database Migration (SQLite → PostgreSQL)

If migrating from SQLite to PostgreSQL:

```bash
# 1. Export data from SQLite
bun run scripts/export-sqlite-data.ts

# 2. Update prisma/schema.prisma: change "sqlite" to "postgresql"

# 3. Push new schema to PostgreSQL
bun run db:push

# 4. Import data into PostgreSQL
bun run scripts/import-postgres-data.ts

# 5. Verify migration
bun run scripts/verify-migration.ts
```

## Project Structure

```
├── src/                    # Application source code
│   ├── app/                # Next.js App Router
│   │   └── api/            # 18 API routes
│   ├── components/         # React components
│   │   ├── pages/          # Page components
│   │   ├── admin/          # Admin dashboard
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                # Shared libraries
│   └── hooks/              # React hooks
├── prisma/                 # Prisma schema
├── public/                 # Static assets (logos)
├── db/                     # SQLite database
├── scripts/                # Utility scripts
├── package.json
├── next.config.ts
└── tsconfig.json
```

## Tech Stack

- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- bcryptjs (password hashing)
- Z.ai SDK (optional AI features)
