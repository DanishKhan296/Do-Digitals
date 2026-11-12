# TIMES UP COLLECTIONS — Full-Stack E-Commerce + CMS

> **Time Defines Your Style.** A premium, responsive e-commerce website for TIMES UP COLLECTIONS with a complete admin CMS, WhatsApp-based ordering, secure authentication, and full content management.

## Major Update — What's New

This version adds a complete Content Management System, Reviews management, Media Library, strengthened security (bcrypt, rate limiting, server-side sessions, activity logging), transparent logos, and a reorganized admin dashboard with 12 sections.

### Logo Improvements
- **Transparent PNGs**: Both dark and light logos have been converted from JPEG (with solid rectangular backgrounds) to transparent PNGs. The original artwork (TU watch emblem, TIMES/UP typography, COLLECTIONS subtitle, tagline) is preserved exactly — only the unwanted rectangular background was removed.
- **Larger size**: The navbar logo is now ~39% larger than the original (78×78px on desktop, 48×48px on mobile) for better visibility while maintaining proportions and not overlapping navigation.
- **Auto theme switching**: The correct transparent logo is automatically displayed based on the active theme.

### Mobile Buy Now Button Fix
- The main "Buy Now on WhatsApp" button is now `h-14` (56px) on mobile with `text-base` font and `whitespace-normal` to prevent text clipping.
- The sticky mobile bottom purchase bar button is now `h-12` (48px) with `min-w-[140px]` and `whitespace-nowrap` so "Buy Now" is always fully visible.
- Safe-area inset padding is respected on iOS devices.

### Direct Image Upload (URL field removed)
- The Image URL textarea has been **completely removed** from both Add Product and Edit Product forms.
- The only way to add product images is now **direct upload from computer**.
- Supports JPG, JPEG, PNG, WebP. Max 8 MB per file. Multiple images supported per product.
- Live preview during upload with progress indicator.
- Thumbnail list with "MAIN" badge, remove, and reorder buttons.
- All uploads are stored permanently on the server in `public/uploads/` and recorded in the `MediaAsset` database table.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma + SQLite |
| Auth | bcrypt + server-side sessions + rate limiting |
| Icons | Lucide React |
| Image processing | sharp (for logo background removal) |

## Admin Dashboard

The admin dashboard at `/#/admin` is organized into 12 sections accessible via a sidebar:

### Content Sections
1. **Overview** — Stats grid (products, reviews, media, stock), quick actions, launch checklist
2. **Homepage** — Edit hero (heading, description, CTA, image, badge), benefits strip (4 items with icon picker), section visibility toggles, section titles/subtitles, promo banner, final CTA
3. **Website Pages** — Edit About (with image), Contact intro, FAQ (add/remove/reorder), Shipping/Returns/Privacy/Terms policies
4. **Reviews** — Add/edit/delete customer reviews, approve/hide toggle, star ratings. Only approved reviews appear on the storefront.

### Catalogue Sections
5. **Products** — Full CRUD with direct image upload, variants, specs, stock status, featured/bestseller/new-arrival flags
6. **Media Library** — Browse, search, and delete all uploaded images. Shows file size, category, and label.

### Settings Sections
7. **Navigation & Footer** — Edit nav menu links (label + path, add/remove/reorder), footer tagline, copyright text, promotional announcement bar
8. **Contact & WhatsApp** — WhatsApp number (with live validation), default inquiry message, contact email/phone, address, currency
9. **Social Media** — Instagram, Facebook, TikTok, YouTube links (leave blank to hide)
10. **Admin Account** — Change username and email (requires current password), change password
11. **Security** — View active sessions, revoke individual sessions or all others, security feature checklist
12. **Activity Log** — Last 100 admin actions with timestamp, user, action type, detail, and IP address

## Security Features

- **bcrypt password hashing** (12 rounds). Legacy SHA-256 hashes auto-upgrade on next login.
- **Server-side session table** — sessions tracked in the database, can be revoked instantly
- **Login rate limiting** — max 5 failed attempts per username, 10 per IP, per 15 minutes (returns HTTP 429)
- **HttpOnly + SameSite cookies** — protected against XSS and CSRF
- **Forced password change** on first login (when using the default seeded password)
- **Admin activity logging** — all admin actions recorded (product/content/review/account changes, logins, password changes, session revocations). Logs auto-expire after 90 days.
- **Upload validation** — MIME type + extension + magic-number sniffing. Max 8 MB. Path traversal protection.
- **All admin APIs protected** — every write operation requires a valid session (returns 401 otherwise)
- **No secrets in frontend** — admin credentials never hardcoded in client code

## Getting Started

### Install & Run
```bash
bun install
bun run db:push
bun run scripts/seed.ts    # seeds products, settings, content, reviews, admin user
bun run dev
```

### Default Admin Credentials
- URL: `/#/admin`
- Username: `admin`
- Password: `admin123`

> **You will be forced to change the password on first login.**

### Logo Processing
The transparent PNG logos were generated from the original JPEGs using:
```bash
bun run scripts/process-logos.ts
```
This script is idempotent and can be re-run. It uses `sharp` to:
1. Load the JPEG
2. Make background pixels transparent (threshold-based, with soft edge transition)
3. Decontaminate edge pixels (remove halos)
4. Save as lossless PNG with alpha channel

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `file:.../db/custom.db` | SQLite database path |
| `ADMIN_SESSION_SECRET` | dev fallback | Signs session cookies. **Set in production.** |
| `UPLOADS_DIR` | `<project>/public/uploads` | Upload storage. Set to a persistent volume in production. |
| `NODE_ENV` | `development` | Standard |

## API Reference

### Public
- `GET /api/products` — list products (filters: category, featured, bestSeller, newArrival, q, sort)
- `GET /api/products/:slug` — single product
- `GET /api/settings` — site settings
- `GET /api/content` — CMS content (homepage, sections)
- `GET /api/reviews?approved=true` — approved reviews only
- `GET /api/admin/me` — session status

### Admin-only (returns 401 without valid session)
- `POST /api/admin/login` — login (rate-limited)
- `POST /api/admin/logout`
- `POST /api/admin/change-password`
- `GET/PUT /api/admin/account` — view/update username & email
- `GET/DELETE /api/admin/sessions` — list/revoke sessions
- `GET /api/admin/activity` — activity log
- `POST/GET/DELETE /api/upload` — image upload/list/delete
- `POST /api/products/create` | `PUT/DELETE /api/products/:slug`
- `PUT /api/settings` | `PUT /api/content`
- `POST/PUT/DELETE /api/reviews[/:id]`

## What Still Requires Configuration Before Launch

1. **Change admin password** (forced on first login)
2. **Replace sample products** with real catalogue
3. **Approve genuine reviews** (or delete sample ones) — do not publish fake reviews
4. **Edit all policy pages** with verified legal text
5. **Set `ADMIN_SESSION_SECRET`** env var in production
6. **Set `UPLOADS_DIR`** to a persistent volume in production (so uploads survive redeployments)
7. **Verify WhatsApp number** is correct
8. **Test the Buy Now → WhatsApp flow** on a real product

## Cost

All features use built-in functionality, open-source libraries, and the existing architecture. **No paid third-party APIs are required.** Image upload, admin dashboard, CMS, reviews, authentication, and security all use free, open-source solutions (Next.js, Prisma, SQLite, bcrypt, sharp).

© TIMES UP COLLECTIONS. Time Defines Your Style.
