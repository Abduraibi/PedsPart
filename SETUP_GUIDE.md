# Pediatrics Part 1 — Board Trainer — Setup Guide

Your study app is built and working on all five exam files (2021–2025): **579 questions**, verbatim, with explanations, source lines, page snapshots, zones, and difficulty. This guide gets it online with login + cross-device sync.

There are **4 stages**. Take them in order. Total time ≈ 30–40 minutes, no coding required.

- Stage A — Create your Supabase project (login + database)
- Stage B — Upload the page-snapshot images
- Stage C — Paste your keys into the app
- Stage D — Publish on the web (Netlify)

The app runs in **local demo mode** out of the box (progress saved only in the current browser). Stages A–C are what turn on real accounts and sync.

---

## What's in the folder

| File / folder | What it is |
|---|---|
| `index.html` | The app (open this to run it). |
| `app.js` | All the app logic. You edit a few lines near the top in Stage C. |
| `questions_data.json` | All 579 questions, verbatim, with zones & difficulty. |
| `assets/` | The page-snapshot images (2021–2025), the originals shown under "View original page". |
| `supabase_setup.sql` | Database setup — you paste this into Supabase once. |
| `upload_snapshots.js` | One-time helper to upload the images to Supabase. |

---

## Stage A — Create your Supabase project (≈10 min)

1. Go to **https://supabase.com** → **Start your project** → sign up (free).
2. Click **New project**. Pick any name (e.g. `peds-part1`), set a strong database password (save it somewhere), choose the region closest to you, and create it. Wait ~2 minutes for it to finish provisioning.
3. In the left sidebar open **SQL Editor** → **New query**.
4. Open `supabase_setup.sql` (in your app folder) in any text editor, copy **all** of it, paste into the query box, and click **Run**. You should see "Success". This creates the `progress` table and locks it so each user can only touch their own data.
5. Turn on email login: left sidebar → **Authentication** → **Sign In / Providers** → make sure **Email** is enabled.
   - Optional but recommended for personal use: in **Authentication → Sign In / Providers → Email**, turn **Confirm email** *off*. Then you can sign in instantly without a confirmation email. (Leave it on if you prefer the extra step.)
6. Get your two public keys: left sidebar → **Project Settings** → **API**. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

Keep these two handy for Stage C. These two are safe to put in the app — they're meant to be public. *Never* put the `service_role` key in the app; it's only used once in Stage B from your own computer.

---

## Stage B — Upload the page-snapshot images (≈10 min)

The images (~80 MB) live in Supabase Storage so the app stays light and the snapshots load on any device.

1. In Supabase: left sidebar → **Storage** → **New bucket**. Name it exactly **`snapshots`** and toggle **Public bucket** ON. Create it.
2. Get a **service_role** key: **Project Settings → API → service_role** (click reveal, copy it). This is a secret — only used in the next step, on your machine.
3. Install **Node.js** if you don't have it: https://nodejs.org (the "LTS" version).
4. Open a terminal **inside your app folder** and run:
   ```
   npm install @supabase/supabase-js
   ```
5. Then run the uploader, pasting in your URL and service_role key:
   - **Mac / Linux:**
     ```
     SUPABASE_URL="https://YOURPROJECT.supabase.co" \
     SERVICE_KEY="your-service-role-key" \
     node upload_snapshots.js
     ```
   - **Windows (PowerShell):**
     ```
     $env:SUPABASE_URL="https://YOURPROJECT.supabase.co"
     $env:SERVICE_KEY="your-service-role-key"
     node upload_snapshots.js
     ```
6. It uploads ~560 images and prints a **public base URL** at the end, like:
   ```
   https://YOURPROJECT.supabase.co/storage/v1/object/public/snapshots/
   ```
   Copy that — you need it in Stage C.

> Prefer not to use the command line? You can instead drag-and-drop the `2021`–`2025` folders straight into the `snapshots` bucket in the Storage web UI. Just keep the folder names (`2021/p-004.jpg`, etc.) intact. The command-line script is faster for hundreds of files.

---

## Stage C — Paste your keys into the app (≈5 min)

Open **`app.js`** in any text editor. The very top has a config block. Fill in all three:

```js
const SUPABASE_CONFIG = {
  url:  "https://YOURPROJECT.supabase.co",   // ← your Project URL (Stage A)
  anon: "your-anon-public-key"               // ← your anon public key (Stage A)
};

const ASSET_BASE = "https://YOURPROJECT.supabase.co/storage/v1/object/public/snapshots/";
// ↑ the public base URL the uploader printed (Stage B). Keep the trailing slash.
```

Save. That's it — the app now uses real accounts and loads snapshots from Supabase.

**Test it locally first.** Because the app loads files, you can't just double-click `index.html` — open it through a tiny local server:
- In a terminal inside the folder, run: `python3 -m http.server 8000`
- Visit **http://localhost:8000** in your browser.
- Create an account, answer a question, open "View original page" to confirm snapshots load, then refresh — your progress should persist.

---

## Stage D — Publish on the web (≈10 min, free)

Easiest free option is **Netlify Drop** (no account-wrangling, no build step):

1. Go to **https://app.netlify.com/drop**.
2. Sign in (free — GitHub/Google/email).
3. **Drag your entire app folder** onto the drop zone. Netlify uploads it and gives you a live URL like `https://your-name-12345.netlify.app`.
4. Open that URL on your phone, laptop, anywhere — sign in with the same email/password and your plan continues across devices. Done.

To update later (e.g. tweaks): repeat the drag-and-drop, or connect the folder to a Netlify site for auto-updates.

**Alternative — Vercel:** create a free account at https://vercel.com, click **Add New → Project**, drag/import the folder, deploy. Same result.

**Custom domain (optional):** in Netlify → Domain settings you can add a domain you own, or use a free `*.netlify.app` subdomain you rename.

---

## How the app works (quick tour)

- **Today** — your dashboard: mastery %, accuracy, days left, the rule-based **Coach** (tells you what to focus on, your weakest zone/subject, and whether you're on pace), and one-tap **Full Day** / **Busy Day** start.
- **Daily Plan** — the adaptive plan for today. It always leads with **Memory Review** (spaced-repetition items due) and the **Wrong Loop** (questions you missed on earlier days), then **Red Zone**, **High-Yield**, and new questions.
  - **Full Day mode:** the complete plan.
  - **Busy Day mode:** memory review + wrong loop + 10–20 red-zone only.
  - **Catch-up:** the daily quota recalculates from how many questions remain and how many days are left until **July 6, 2026**. Skip a day and the load redistributes so you still finish on time.
  - **Fudul** appears as a daily reminder task linking to fudoul.com — no Fudul content is stored here; you practice those on their site as you asked.
- **Question Bank** — all 579, filterable by year, zone, difficulty, subject, search text, and status (unseen / last-wrong / mastered). Study any slice.
- **Review** — everything you saved with the **☆ Review** button on a question. Revisit anytime.
- **Mock Exam** — a timed, mixed 25/50/75/100-question paper sampled across all years and zones; no explanations until you submit, then a score ring + per-zone breakdown + "review my mistakes." Mock answers also feed spaced repetition and the wrong loop.
- **Dark / light mode** — the ◐ button, top right. Your choice is remembered.
- Every question shows its **source** (file, year, question number), its **type** (Red Zone / High-Yield / Trap / Common), and a **difficulty** dot (green / yellow / red). The **"View original page"** toggle shows the exact PDF page(s) — so any x-ray, ECG, growth chart, or clinical photo that's part of a question is shown faithfully, in full context.

---

## How questions were classified (so you can trust the labels)

All question text, options, answers, and explanations are **verbatim** from your files — nothing added or rewritten. Only the organizational labels are layered on, derived from signals *in the files*:

- **Red Zone** = high-frequency, must-master material: the question's topic recurs across **3+ of the five exam years**, or it centers on a core disease concept that appears in **12+ questions** across the whole set.
- **High-Yield** = a clear decision point ("best initial step", "most appropriate management", "most likely diagnosis", etc.) backed by a rich teaching explanation (clinical pearls / red flags / mnemonics).
- **Trap** = the explanation itself flags a look-alike or common mistake ("distinguishes from", "unlike", "commonly confused", "mimics", "key difference", "in contrast to"). Tracked as an extra tag wherever it applies.
- **Common** = everything else.
- **Difficulty** (green / yellow / red) reflects vignette length and whether the stem demands multi-step decision-making.

---

## Troubleshooting

- **"Setup needed" banner stays / can't make an account:** the keys in `app.js` aren't filled in or have a typo. Re-check Stage C (URL must start with `https://`, anon key is the long one).
- **Snapshots don't load (broken image):** `ASSET_BASE` is wrong or the bucket isn't public. Confirm the bucket is named `snapshots` and **Public**, and that `ASSET_BASE` ends with a `/`.
- **Login works but progress doesn't sync:** make sure you ran `supabase_setup.sql` (Stage A step 4) — that creates the `progress` table.
- **Email confirmation is annoying for personal use:** turn off "Confirm email" (Stage A step 5).
- **Double-clicking index.html shows a blank page:** browsers block file loading from `file://`. Use the local server command in Stage C, or just use your published Netlify URL.

You're set. Build the habit, lead with the red zone, clear the wrong loop daily, and let the coach keep you honest on pace. Good luck with the Part 1.
