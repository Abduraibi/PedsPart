/* ============================================================================
   upload_snapshots.js  —  bulk-upload the /assets page snapshots to Supabase
   ----------------------------------------------------------------------------
   You only run this ONCE, from your own computer, after creating the bucket.

   PREP (one time):
     1. Install Node.js  (https://nodejs.org)
     2. In a terminal, inside this app folder, run:
          npm install @supabase/supabase-js
     3. In Supabase → Storage → create a PUBLIC bucket named:  snapshots
     4. Get a SERVICE ROLE key:  Supabase → Project Settings → API →
        "service_role" secret key.  (Used only here, on your machine — never
        put the service_role key inside index.html / app.js.)

   RUN:
        SUPABASE_URL="https://xxxx.supabase.co" \
        SERVICE_KEY="your-service-role-key" \
        node upload_snapshots.js

   It walks assets/<year>/p-XXX.jpg and uploads them to the same paths in the
   bucket, so the app's ASSET_BASE just points at the bucket's public URL.
   ============================================================================ */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SERVICE_KEY;
if (!URL || !KEY) { console.error("Set SUPABASE_URL and SERVICE_KEY env vars."); process.exit(1); }

const sb = createClient(URL, KEY);
const BUCKET = "snapshots";
const ROOT = path.join(__dirname, "assets");

async function run() {
  const years = fs.readdirSync(ROOT).filter(d => fs.statSync(path.join(ROOT, d)).isDirectory());
  let ok = 0, fail = 0;
  for (const y of years) {
    const dir = path.join(ROOT, y);
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".jpg"));
    for (const f of files) {
      const buf = fs.readFileSync(path.join(dir, f));
      const dest = `${y}/${f}`;
      const { error } = await sb.storage.from(BUCKET).upload(dest, buf, {
        contentType: "image/jpeg", upsert: true
      });
      if (error) { console.error("FAIL", dest, error.message); fail++; }
      else { ok++; if (ok % 50 === 0) console.log(`uploaded ${ok}…`); }
    }
  }
  console.log(`\nDone. Uploaded ${ok} images, ${fail} failures.`);
  console.log(`Public base URL to put in app.js ASSET_BASE:`);
  console.log(`${URL}/storage/v1/object/public/${BUCKET}/`);
}
run();
