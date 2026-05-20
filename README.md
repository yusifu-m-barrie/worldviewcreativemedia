# WorldView Creative Media

Professional online TV, news, and digital media platform for Sierra Leone and West Africa. Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **MongoDB**, **NextAuth**, **TipTap**, and **Cloudinary**.

## Features

- Public site: homepage, news, live TV, videos, blog, search, categories
- Breaking news ticker, featured slider, newsletter signup
- Dark mode via `next-themes`
- Admin CMS: dashboard, articles, TipTap editor, About page (super admin), team activity (super admin)
- Demo content when MongoDB is not configured (local preview)
- SEO: metadata, sitemap, robots.txt, RSS feed, JSON-LD

## Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas account (production)
- Cloudinary account (media uploads, optional for MVP)
- Vercel account (deployment, optional)

## Quick Start

```bash
# Clone and install
cd worldview-creative-media
npm install

# Environment
cp .env.example .env.local
# Edit .env.local — at minimum set NEXTAUTH_SECRET (openssl rand -base64 32)

# Run dev server (works without MongoDB using demo data)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access.
3. Network Access → add your IP (or `0.0.0.0/0` for development).
4. Connect → Drivers → copy the connection string.
5. Add to `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/worldview?retryWrites=true&w=majority
```

## Seed Admin User & Categories

```bash
npm run seed
```

Default credentials (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local`):

- Email: `admin@worldviewcreativemedia.com`
- Password: `WorldView2026!`

Sign in at `/login` → redirects to `/admin`.

### Admin roles

| Role | Access |
|------|--------|
| **super_admin** (main admin) | Full CMS + **Manage Admins** (`/admin/users`), About, Team Activity |
| **Staff admins** (editor, journalist, etc.) | Dashboard sections you enable per user: **Articles**, **Videos**, **Live TV**, **Settings** |

**Manage Admins** (main admin only): Admin → **Manage Admins** — add name, email, password, and check which areas they can use. They sign in at `/login` like you.

- **Articles**: create posts; edit **only their own** articles (main admin edits all).
- **Videos / Live TV / Settings**: full access to that section when enabled.

The seed script creates the login user as **super_admin**.

### About Us page

- Public: **`/about`** (also linked in the header and footer).
- Editable only by **super_admin**: **Admin → About Page**.

## Cloudinary Setup

1. Create an account at [cloudinary.com](https://cloudinary.com).
2. Dashboard → copy Cloud Name, API Key, API Secret.
3. Add to `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Use the featured image URL field in the article editor, or extend `lib/cloudinary.ts` for direct uploads.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Canonical site URL |
| `MONGODB_URI` | For CMS/DB | MongoDB connection string |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT sessions |
| `NEXTAUTH_URL` | Yes | Same as site URL |
| `CLOUDINARY_*` | Optional | Media hosting |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Optional | Seed script overrides |

See `.env.example` for the full list.

## Deploy to Vercel

**Live site:** [https://worldview-creative-media.vercel.app](https://worldview-creative-media.vercel.app)

1. Push the repo to GitHub (optional — CLI deploy works from local).
2. Import project in [vercel.com](https://vercel.com) or run `npx vercel deploy --prod`.
3. Add all environment variables from `.env.example` in **Project → Settings → Environment Variables**.
4. Set production URLs:
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.vercel.app`
   - `NEXTAUTH_URL` = same as above
5. Redeploy after adding env vars.

Post-deploy:

```bash
# Seed admin user + categories (uses MONGODB_URI from .env.local)
npm run seed
```

### Google Analytics

1. In [Google Analytics](https://analytics.google.com), create a **Web** property.
2. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
3. Either:
   - **Admin → Settings → Analytics** in the CMS, paste the ID and save, or
   - Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` on Vercel (overrides CMS).

Tracking runs on the public site only (not `/admin`). Verify in GA → Reports → Realtime after visiting the homepage.

## Project Structure

```
app/
  (site)/          # Public pages
  admin/           # CMS (protected)
  api/auth/        # NextAuth route
components/        # UI, layout, home, admin, editor
config/            # site.ts, roles.ts
lib/               # db, auth, seo, cloudinary, demo-data
models/            # Mongoose schemas
services/          # Data access layer
actions/           # Server actions
scripts/seed.ts    # Database seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run seed` | Seed admin + categories |
| `npm run lint` | ESLint |

## Brand

- Primary: `#2E2A86`
- Orange accent: `#E8872A`
- Logo: `public/images/logo.png`

## Troubleshooting

### Hydration error on theme toggle (Sun/Moon icon)
Fixed in `components/theme-toggle.tsx`. Restart `npm run dev` and hard-refresh the browser (Ctrl+Shift+R).

### `JWTSessionError: no matching decryption secret`
Your browser has an old session cookie from a previous `NEXTAUTH_SECRET`. Fix:
1. Set a stable secret in `.env.local`: `openssl rand -base64 32`
2. Clear site cookies for `localhost:3000` (or use a private window)
3. Restart the dev server

### `CredentialsSignin` on login
Run `npm run seed` after `MONGODB_URI` is set. Use:
- Email: `admin@worldviewcreativemedia.com`
- Password: `WorldView2026!`

### Admin page 404 / Edge runtime `stream` error
Middleware must not import Mongoose. If you see this again, ensure `middleware.ts` uses `getToken` from `next-auth/jwt` only.

### `querySrv ETIMEOUT` (MongoDB Atlas)
Your PC cannot resolve Atlas’s `mongodb+srv://` DNS record (common on some Windows networks).

**Fix (recommended):** In [MongoDB Atlas](https://cloud.mongodb.com) → **Database** → **Connect** → **Drivers** → copy the **Standard connection string** (starts with `mongodb://`, not `mongodb+srv://`). Add to `.env.local`:

```env
MONGODB_URI_STANDARD=mongodb://USER:PASSWORD@ac-xxxxx-shard-00-00.xxxxx.mongodb.net:27017,ac-xxxxx-shard-00-01.xxxxx.mongodb.net:27017,ac-xxxxx-shard-00-02.xxxxx.mongodb.net:27017/worldview?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin
```

Keep your existing `MONGODB_URI` or replace it — the app prefers `MONGODB_URI_STANDARD` when set.

**Also check:**
1. Atlas → **Network Access** → add your current IP (or `0.0.0.0/0` for testing).
2. Windows DNS: set adapter DNS to `8.8.8.8` and `1.1.1.1`, then `ipconfig /flushdns`.
3. Disable VPN/firewall blocking DNS, restart `npm run dev`.

### YouTube Live embed
Channel: [youtube.com/@worldview-creative-media](https://www.youtube.com/@worldview-creative-media)

For the live player iframe, copy the embed URL from **YouTube Studio → Go Live** when streaming, then set `NEXT_PUBLIC_YOUTUBE_LIVE_EMBED` in `.env.local`.

## License

Private — WorldView Creative Media.
