# Studio Pixcura Website — Admin V3 Fixed

React + Vite + Supabase photography website with albums, bookings, packages, admin panel, photo upload, and site settings.

## What is fixed in V3

- Removed Supabase relationship join dependency from frontend API calls.
- Fixed admin errors like:
  - `couldn't find a relationship`
  - `column packages.display_order does not exist`
  - `column packages.grade does not exist`
  - package/category dropdown loading issues
- Added safe database migration in `backend/supabase/schema.sql`.
- Added starter categories, packages, add-ons, and sample albums in `backend/supabase/seed.sql`.
- Admin tabs remain clean: Dashboard, Albums, Packages, Bookings, Contact / Site.

## Important setup after replacing files

1. Copy your old `frontend/.env.local` into this new `frontend` folder.
2. Supabase Dashboard > SQL Editor > run:
   - `backend/supabase/schema.sql`
   - `backend/supabase/seed.sql`
3. Restart the frontend.

## Run locally

```powershell
cd "C:\Users\Ange\Downloads\STUDIO PIXCURA WEBSITE\studio-pixcura-website-admin-v3-final\studio-pixcura-website\frontend"
npm.cmd install --no-audit --no-fund
npm.cmd run dev
```

Public site: http://localhost:5173
Admin login: http://localhost:5173/#/admin/login

## Supabase files

- `backend/supabase/schema.sql` — run first. Creates/fixes tables, columns, RLS policies, storage bucket, and schema cache reload.
- `backend/supabase/seed.sql` — run second. Adds default categories, packages, add-ons, and sample albums.
- `backend/supabase/RUN_THIS_FIRST_ADMIN_V3_FIX.sql` — same as schema.sql, added to make the required first SQL file easy to identify.

## Security note

Do not commit `frontend/.env.local` to GitHub if it contains real keys. Use `.env.example` as the public template.
