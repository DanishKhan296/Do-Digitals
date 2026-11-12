# DO DIGITALS — Deployment Guide (Vercel)

Full-stack Next.js 16 site: public marketing website + admin CMS dashboard at `/#/admin`.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Prisma ORM · JWT auth (jose + bcryptjs)

---

## 0. What is included in this package

```
├── src/                  # All application code
│   ├── app/              # App Router pages + /api routes (auth, admin, public APIs)
│   ├── components/       # site/, pages/, admin/, ui/ (shadcn), premium.tsx (motion)
│   ├── hooks/            # SWR-based site data hooks
│   └── lib/              # auth, db, seed, rate-limit, api helpers, brand theming
├── prisma/schema.prisma  # Full database schema (all CMS models)
├── scripts/              # Asset generation & content reset scripts
├── public/               # Logos, OG image, favicon, robots.txt, sitemap.xml
├── db/custom.db          # SQLite snapshot of current site content (for local use)
├── package.json          # Scripts + dependencies (includes postinstall: prisma generate)
├── .env.example          # Documented environment template
├── next.config.ts · tsconfig.json · tailwind.config.ts · postcss.config.mjs
├── eslint.config.mjs · components.json · .gitignore · README.md
└── README-DEPLOY.md      # This guide
```

The app **self-seeds a fresh database on first request** (`src/lib/seed.ts`): admin account,
site content, services, portfolio categories + projects, testimonials, statistics, blog
categories + posts, navigation, social links and media placeholders. You never need to
import data manually — deploy, open the site once, then manage everything from the dashboard.

---

## 1. CRITICAL — the database

The sandbox version uses **SQLite** (`db/custom.db`). **SQLite cannot run on Vercel**:
serverless functions have a read-only, ephemeral filesystem, so nothing written to a file
survives. You must use a hosted database in production. Pick ONE option:

### Option A — Vercel Postgres or Neon (recommended)

1. In Vercel: **Storage → Create Database → Postgres (Neon)** → connect it to your project.
   Vercel injects `DATABASE_URL` automatically.
2. In `prisma/schema.prisma`, change the datasource provider:

   ```prisma
   datasource db {
     provider = "postgresql"        // was: "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. Push the schema to the new database (from your machine, with the same DATABASE_URL in `.env`):

   ```bash
   npm install
   npx prisma db push
   ```

4. Deploy. On the first page visit the app seeds itself.

### Option B — Turso (libSQL — closest to SQLite, keeps schema as-is)

1. Create a free Turso database (`turso db create …`), get the `libsql://…` URL + token.
2. `prisma/schema.prisma` stays `provider = "sqlite"`, but `src/lib/db.ts` must use the
   libSQL driver adapter:

   ```bash
   npm install @prisma/adapter-libsql @libsql/client
   ```

   ```ts
   // src/lib/db.ts
   import { PrismaClient } from '@prisma/client'
   import { PrismaLibSQL } from '@prisma/adapter-libsql'
   import { createClient } from '@libsql/client'

   const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

   const factory = () => {
     const libsql = createClient({
       url: process.env.TURSO_DATABASE_URL!,
       authToken: process.env.TURSO_AUTH_TOKEN!,
     })
     const adapter = new PrismaLibSQL(libsql)
     return new PrismaClient({ adapter })
   }

   export const db = globalForPrisma.prisma ?? factory()
   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
   ```

3. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel, run `npx prisma db push`
   against the Turso URL, then deploy.

### Option C — Supabase / Railway Postgres

Same as Option A with their connection string (append `?sslmode=require` if required).

> **Content note:** the SQLite snapshot in `db/custom.db` is for **local** use only.
> On a fresh hosted database the demo content seeds itself; your dashboard is the tool to
> replace it with real content (Services, Portfolio, Testimonials, Blog, Media, SEO, etc.).

---

## 2. Environment variables (Vercel → Settings → Environment Variables)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | From your hosted DB (Option A/C). Vercel Postgres injects it automatically. |
| `AUTH_SECRET` | **Yes** | JWT signing secret for admin sessions. Generate: `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | Recommended | Password for the auto-created `admin` account on first seed. Default: `DoDigitals@2025` |
| `ADMIN_ALLOWED_ORIGINS` | Optional | Comma-separated origins, only if login ever returns "Invalid origin" behind a proxy |
| `APP_URL` | Optional | Canonical site URL (used by the origin allowlist) |

---

## 3. Deploy steps

### A. Via GitHub (recommended)

```bash
# in the unzipped project folder
git init && git add . && git commit -m "DO DIGITALS website"
git remote add origin https://github.com/<you>/dodigitals.git
git push -u origin main
```

1. Vercel → **Add New → Project → Import** your repo.
2. Framework preset: **Next.js** (auto-detected). Build command and output are picked up
   from `package.json` automatically (the `postinstall` hook runs `prisma generate`).
3. Add the environment variables from section 2.
4. **Deploy.** First build takes ~2 minutes.

### B. Via Vercel CLI

```bash
npm i -g vercel
vercel            # link the project
vercel --prod     # production deploy
```

### After the first deploy — checklist

1. Open `https://<your-app>.vercel.app` — the site seeds itself on first view.
2. Go to `/#/admin` → log in with `admin` + your `ADMIN_PASSWORD` (default `DoDigitals@2025`).
3. **Account → Update password** immediately.
4. Replace seeded demo content (Services, Portfolio, Testimonials, Blog, Statistics)
   and upload your media. The homepage/about/contact copy lives under Homepage/About/SEO.
5. Attach your custom domain in Vercel → Settings → Domains.

---

## 4. Local development (with the included SQLite snapshot)

```bash
npm install                  # or: bun install
npx prisma generate          # happens automatically via postinstall
npm run dev                  # http://localhost:3000
```

- Admin: `http://localhost:3000/#/admin` → `admin` / `DoDigitals@2025`
- Content reset (restore demo data): `npx tsx scripts/reset-content.ts`

---

## 5. Troubleshooting on Vercel

| Symptom | Cause & fix |
|---|---|
| Build fails with Prisma error "did not initialize yet" | Ensure `postinstall: prisma generate` exists (it does in this package) and `prisma` is in `dependencies` |
| Login returns "Invalid origin" | Your proxy rewrites `Host`. Add your public URL to `ADMIN_ALLOWED_ORIGINS` (e.g. `https://yourdomain.com`). Validation is never disabled — this allowlists your domain. |
| "Too many login attempts" | Rate limiter: 8 attempts / 15 min per IP+username. Wait or redeploy (resets in-memory state). |
| 500 on any `/api/*` | `DATABASE_URL` missing/wrong, or schema provider doesn't match the DB engine |
| Images fail to load from Media | Vercel's filesystem is read-only at runtime — the sandbox SQLite media flow stores files in DB rows, so uploads work, but large files are capped; use an external host/CDN for heavy assets |

---

## 6. Security model (kept intact — nothing disabled)

- Admin session: JWT (HS256) in an **httpOnly, SameSite=Lax, Secure** cookie, 7-day expiry
- Passwords: bcrypt (cost 10)
- CSRF: `Origin` checked against `X-Forwarded-Host`/`Host`, an explicit allowlist, and
  browser-provided `Sec-Fetch-Site` metadata; cross-site mutations rejected (403) and logged
- Login/contact rate limiting (in-memory sliding window per instance)
- All admin mutations require both a valid session **and** the origin check
