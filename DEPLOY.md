# Deploying Pesoman

Stack this repo targets:

| Piece | Service |
|--------|---------|
| App + API | **Vercel** (Next.js server components & `/api/*` route handlers as serverless functions) |
| Database | **Supabase** (PostgreSQL) |
| Firebase | **Optional** — not required for this codebase today |

API routes (`src/app/api/**`) are your backend; they run on Vercel alongside the frontend. Moving every endpoint to **Firebase Cloud Functions** would mean rewriting those handlers — only do that if you explicitly need Firebase as the compute layer.

## 1. Supabase database

1. Create a project at [supabase.com](https://supabase.com).
2. **Settings → Database**  
   - Copy the **connection string** (URI).  
   - Use the **transaction pooler** (often port `6543`) for `DATABASE_URL` when deploying serverless.  
   - Use the **direct** connection (often port `5432`) for `DIRECT_URL` (migrations / `prisma db push`).
3. Append `?pgbouncer=true` to the pooled URL if Supabase docs say to.

Locally, copy `.env.example` → `.env` and fill both URLs.

**Quick local DB:** from the `pesoman` folder run `docker compose up -d`, then use the default URLs already shown in this repo’s `.env` (postgres/postgres, database `pesoman`).

Apply schema:

```bash
npx prisma generate
npx prisma db push
# or: npx prisma migrate dev --name init
```

## 2. Vercel

1. Import the Git repo in Vercel (root directory = `pesoman` if the repo is monorepo).
2. **Environment variables** (Production & Preview):

   - `DATABASE_URL` — pooled Supabase URL  
   - `DIRECT_URL` — direct Supabase URL  
   - `AUTH_SECRET` — random secret (`openssl rand -base64 32`)  
   - `AUTH_URL` — `https://<your-vercel-domain>`  
   - `NEXTAUTH_URL` — same as `AUTH_URL` (legacy compat)  
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — if using Google sign-in  

3. Build command: `npm run build` (already runs `prisma generate`).

Prisma on Vercel uses `binaryTargets` including `rhel-openssl-3.0.x` so the query engine matches Linux.

## 3. Auth URLs

After first deploy, add your production URL to any OAuth provider’s authorized redirect list if you use Google login.

## 4. Firebase (optional)

Use Firebase later for:

- **Firebase Auth** instead of / in addition to credentials (would require code changes),
- **FCM** notifications,
- **Storage** for receipts.

Hosting on Firebase **instead of Vercel** would duplicate what Next.js already gives you here; this project is optimized for **Vercel + Supabase**.

## 5. Static assets you replace locally

- **Logo:** `public/branding/logo.svg` (see `public/branding/README.txt`).
- **Trip banners:** `public/trip-banners/*.{png}` by default (see `public/trip-banners/README.txt` and `TRIP_BANNER_EXT` in `src/lib/trip-emoji-banners.ts`).
