# sMessage (IRC-style chat)

**Stack:** Vite + React (Vercel), Supabase Realtime + Postgres.

## Setup
1. Create a Supabase project → copy URL & anon key.
2. Run `supabase/schema.sql` in the SQL editor.
3. In Database → Replication → Publications → add `channels` and `messages` to `supabase_realtime`.
4. Clone or create a new Vercel project.
5. Add env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Build & deploy.

## Local (optional)
```bash
npm i
cp .env.example .env  # fill values
npm run dev


---

## That’s it!

Paste these files exactly as named, add your **Supabase URL and anon key**, run the SQL, and deploy to **Vercel**. You’ll get:

- Landing with **animated sMessage** title → **slider gate** → **join page**  
- **Username** + **channel list** + **Create Channel** (public/private)  
- **Chat screen** centered, **user list** on the right, **input with embedded Send**  
- **Header** with sMessage logo (left) and **Settings / Logout** (right)  
- **Settings**: font size (16–24), 6 font families, **10 themes**  
- **Realtime** messages + **presence** user list via Supabase WebSockets  
- **Persistent** channels + messages in Supabase.

If you want me to switch to **JWT auth** or move channel passwords to a secure flow, say the word and I’ll refactor the minimal pieces.

