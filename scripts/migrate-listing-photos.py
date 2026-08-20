"""Copy the listing photographs out of the rentals project into ours.

Run repeatedly and it does the remaining work: the destination path is derived
from the source path, so a file already there is skipped and a partial run
simply continues.
"""
import json, os, subprocess, sys, time
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

PG = "postgresql://postgres.wgryjqfokqiorfuihjqc:odp7A7lLMHzFBmWG@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
DEST_URL = os.environ["DEST_URL"].rstrip("/")
SECRET = os.environ["SECRET_KEY"]
BUCKET = "listing-photos"
OLD_PREFIX = "https://fwraryuyywuxlefopcsq.supabase.co/storage/v1/object/public/listing-photos/"

def sniff(body: bytes, declared: str) -> str:
    """The file's own bytes, not the header it was stored with.

    Three images in the source bucket are stored as text/plain and are plainly
    JPEGs. Trusting the declared type meant the destination refused them.
    """
    if body[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if body[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if body[:4] == b"RIFF" and body[8:12] == b"WEBP":
        return "image/webp"
    return declared if declared.startswith("image/") else "image/jpeg"


def q(sql):
    out = subprocess.run(["psql", PG, "-X", "-t", "-A", "-F", "\t", "-c", sql],
                         capture_output=True, text=True, check=True).stdout
    return [l.split("\t") for l in out.splitlines() if l.strip()]

rows = q("select id, photo_url from mls_listing_photos "
         "where photo_url like 'https://fwraryuyywuxlefopcsq%' order by id")
print(f"to migrate: {len(rows)}", flush=True)

done, failed, skipped = [], [], 0
lock_out = []

def work(item):
    pid, url = item
    if not url.startswith(OLD_PREFIX):
        return ("skip", pid, url, None)
    path = url[len(OLD_PREFIX):]
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "merge/1.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read()
            ctype = sniff(body, r.headers.get("Content-Type", ""))
    except Exception as e:
        return ("fail", pid, url, f"download: {e}")

    put = urllib.request.Request(
        f"{DEST_URL}/storage/v1/object/{BUCKET}/{path}",
        data=body, method="POST",
        headers={"Authorization": f"Bearer {SECRET}", "apikey": SECRET,
                 "Content-Type": ctype, "x-upsert": "true"})
    try:
        with urllib.request.urlopen(put, timeout=120) as r:
            if r.status not in (200, 201):
                return ("fail", pid, url, f"upload status {r.status}")
    except urllib.error.HTTPError as e:
        return ("fail", pid, url, f"upload {e.code}: {e.read()[:120]!r}")
    except Exception as e:
        return ("fail", pid, url, f"upload: {e}")

    return ("ok", pid, f"{DEST_URL}/storage/v1/object/public/{BUCKET}/{path}", None)

start = time.time()
with ThreadPoolExecutor(max_workers=8) as pool:
    for i, (kind, pid, new_url, err) in enumerate(pool.map(work, rows), 1):
        if kind == "ok":
            done.append((pid, new_url))
        elif kind == "skip":
            skipped += 1
        else:
            failed.append((pid, err))
        if i % 200 == 0:
            print(f"  {i}/{len(rows)}  ok={len(done)} fail={len(failed)}  {time.time()-start:.0f}s", flush=True)

print(f"downloaded+uploaded: {len(done)}  failed: {len(failed)}  skipped: {skipped}", flush=True)

# Repoint the rows in one statement.
if done:
    payload = json.dumps([{"id": p, "url": u} for p, u in done])
    with open("/tmp/repoint.sql", "w") as f:
        f.write("UPDATE public.mls_listing_photos p SET photo_url = t.url "
                f"FROM jsonb_to_recordset($j${payload}$j$) AS t(id uuid, url text) "
                "WHERE p.id = t.id;")
    subprocess.run(["psql", PG, "-X", "-q", "-f", "/tmp/repoint.sql"], check=True)
    print("rows repointed", flush=True)

for pid, err in failed[:10]:
    print("  FAIL", pid, err, flush=True)
