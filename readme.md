# Food Log (Next.js + NextAuth + Google Drive)

A daily food diary that signs in with Google, stores your data as a JSON file
in your own Google Drive, and stays signed in across devices via NextAuth's
server-side token refresh — solving the "logging in constantly" problem from
the single-file version.

## What changed from the single-file version

- **Real login persistence.** NextAuth uses the OAuth *authorization code*
  flow (not the implicit flow), which gives the server a long-lived refresh
  token. Your browser's access token is silently refreshed server-side
  whenever it's close to expiring — you should rarely if ever need to
  manually reconnect.
- **Drive calls happen server-side.** Your Google access token never reaches
  the browser. The frontend talks to `/api/logs`, and the server handles all
  Drive API calls.
- **Proper component structure.** Same UI and features (quick-add buttons,
  meal tags, notes, search, 10-week history, entry edit/duplicate/delete,
  Copy JSON) — now organised as React components instead of one HTML file.
- **Drive scope:** `drive.file` — same as before. The app can only see files
  it creates itself, and `food-log-data.json` will be visible in your normal
  Drive view.

## Project structure

```
app/
  layout.tsx                      Root layout, loads Tabler icons
  globals.css                     All styling (ported from the original)
  page.tsx                        Main app — composes all components
  api/
    auth/[...nextauth]/route.ts   NextAuth handler
    logs/route.ts                 GET/PUT — reads/writes your Drive file

components/
  Header.tsx                      Top bar: sign in/out, sync status, panel toggles
  DriveBanner.tsx                 "Connect Google Drive" banner when signed out
  DayNav.tsx                      Previous/next/today navigation
  QuickAddButtons.tsx             Quick-add button row
  QuickButtonModal.tsx            Create/edit/delete a quick-add button
  LogForm.tsx                     The main entry form
  MealSelector.tsx                Breakfast/Lunch/Dinner/Snack/Drinks selector
  LogList.tsx                     Entries for the day, grouped by meal
  EntryModal.tsx                  Edit an existing entry
  SearchPanel.tsx                 Search all entries across all days
  HistoryPanel.tsx                10-week calendar grid
  Toast.tsx                       Bottom toast notifications
  Providers.tsx                   NextAuth SessionProvider wrapper

lib/
  auth.ts                         NextAuth config — Google provider, token refresh
  drive.ts                        Server-side Google Drive API helper functions
  useFoodLog.ts                   Client hook: loads/saves data, debounces writes
  date.ts                         Date formatting/parsing helpers

types/
  index.ts                        LogEntry, QuickButton, DriveData types
  next-auth.d.ts                  Type augmentation for session.accessToken
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Google OAuth credential (authorization code flow)

This is a **different credential setup** from the single-file version —
that one used the implicit flow (`response_type=token`), this one uses the
standard server-side flow with a client secret.

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and
   open your existing project (or the one you used for the single-file app
   — you can reuse it).
2. Go to **APIs & Services → Credentials**.
3. You can reuse your existing OAuth 2.0 Client ID, or create a new one —
   either way, you need the **Client Secret** this time too (the implicit
   flow didn't use one).
4. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local development)
   - your production Vercel URL, e.g. `https://food-log.vercel.app`
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://food-log.vercel.app/api/auth/callback/google` (your real domain)
6. Make sure **APIs & Services → OAuth consent screen → Test users** still
   includes your Google account (same as before, since the app is in
   Testing mode).

### 3. Environment variables

Copy the example file and fill it in:

```bash
cp .env.local.example .env.local
```

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
DRIVE_FILE_NAME=food-log-data.json
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Connect Drive**,
sign in, and approve access.

### 5. Deploy to Vercel

```bash
vercel
```

Or connect the GitHub repo in the Vercel dashboard. Either way, add the same
environment variables in **Project Settings → Environment Variables**:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` — set this to your production URL, e.g.
  `https://food-log.vercel.app`
- `DRIVE_FILE_NAME` — optional, defaults to `food-log-data.json`

After deploying, go back to Google Cloud Console and make sure your
production domain is in both the **Authorized JavaScript origins** and
**Authorized redirect URIs** lists (step 2 above).

## How the login persistence actually works

1. On first sign-in, Google returns both an **access token** (short-lived,
   ~1 hour) and a **refresh token** (long-lived, doesn't expire under normal
   use).
2. NextAuth stores both inside an encrypted JWT session cookie — the refresh
   token never leaves the server.
3. Every time the app calls `getSession()` server-side, NextAuth checks if
   the access token is expired or close to it. If so, it automatically
   exchanges the refresh token for a new access token before continuing —
   this happens transparently, with no popups or redirects.
4. You'll only be asked to sign in again if the refresh token itself is
   revoked (e.g. you remove the app's access from your Google Account
   settings, or don't use the app for an extended period — Google can expire
   long-unused refresh tokens).

## Migrating your existing data

Your existing `food-log-data.json` file from the single-file app is already
in your Google Drive (assuming you completed that setup). Once you sign in
to this new app with the same Google account, it'll find and use that exact
same file — no migration needed.

## Notes on the Testing/Production app status

Your Google Cloud OAuth app is likely still in **Testing** mode, which means
only accounts you've explicitly added as test users can sign in. This is
fine for personal use. If you ever want anyone else to be able to sign in,
you'd need to submit the app for Google's verification process.
