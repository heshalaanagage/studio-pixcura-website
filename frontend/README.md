# Studio Pixcura Frontend

React + Vite frontend for Studio Pixcura photography website.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open the local URL shown in the terminal.

## Environment variables

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
VITE_WHATSAPP_NUMBER=94789391396
VITE_STUDIO_EMAIL=studiopixcura@gmail.com
VITE_FACEBOOK_URL=https://facebook.com/StudioPixcura
VITE_INSTAGRAM_URL=https://instagram.com/studiopixcura
```

## Admin URL

Because this project uses HashRouter for GitHub Pages compatibility, admin URL is:

```text
/#/admin
```

Login URL:

```text
/#/admin/login
```
