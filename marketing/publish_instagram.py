#!/usr/bin/env python3
"""Publish a reel to Instagram through the Graph API.

    python3 marketing/publish_instagram.py <public-video-url> "<caption>"

Instagram pulls the video from a public URL, so the file must already be live
(we serve ours from pricevichar.com/reels/). Credentials come from
~/.pricevichar/instagram.env, written once by ig_setup_helper.sh — nothing
secret is passed on the command line or printed back.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://graph.facebook.com/v21.0"
ENV_FILE = os.path.expanduser("~/.pricevichar/instagram.env")

# Instagram Reels limits, worth failing on before we burn an API call.
MAX_CAPTION = 2200
MAX_SECONDS = 900


def die(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def load_env():
    if not os.path.exists(ENV_FILE):
        die(f"{ENV_FILE} nahi mila.\n"
            f"       Pehle setup chalao: bash marketing/ig_setup_helper.sh")
    env = {}
    with open(ENV_FILE) as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    for key in ("IG_ACCESS_TOKEN", "IG_USER_ID"):
        if not env.get(key):
            die(f"{key} {ENV_FILE} me nahi hai. Setup dobara chalao.")
    return env


def call(method, path, params):
    url = f"{API}/{path}"
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=data, method=method) if method == "POST" \
        else urllib.request.Request(f"{url}?{urllib.parse.urlencode(params)}")
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode(errors="replace")
        try:
            err = json.loads(body).get("error", {})
            msg = err.get("error_user_msg") or err.get("message") or body
        except Exception:
            msg = body
        die(f"Instagram API ne mana kar diya ({exc.code}): {msg}")
    except urllib.error.URLError as exc:
        die(f"Instagram tak pahunch nahi paya: {exc.reason}")


def check_reachable(url):
    """Instagram must be able to fetch this itself — catch a dead link early."""
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=30) as resp:
            ctype = resp.headers.get("Content-Type", "")
            size = int(resp.headers.get("Content-Length") or 0)
            if not ctype.startswith("video/"):
                die(f"URL video nahi de raha (Content-Type: {ctype or 'unknown'}).")
            return size
    except urllib.error.HTTPError as exc:
        die(f"Video URL khul nahi raha (HTTP {exc.code}). Pehle deploy ho gaya?")
    except urllib.error.URLError as exc:
        die(f"Video URL tak pahunch nahi paya: {exc.reason}")


def main():
    if len(sys.argv) < 3:
        die("Usage: publish_instagram.py <public-video-url> \"<caption>\"")

    video_url, caption = sys.argv[1], sys.argv[2]

    if not video_url.startswith("https://"):
        die("Video URL https:// hona chahiye — Instagram http se nahi uthata.")
    if len(caption) > MAX_CAPTION:
        die(f"Caption {len(caption)} characters ka hai, limit {MAX_CAPTION} hai.")

    env = load_env()
    token, ig_user = env["IG_ACCESS_TOKEN"], env["IG_USER_ID"]
    handle = env.get("IG_USERNAME", ig_user)

    print(f"Account   : @{handle}")
    print(f"Video     : {video_url}")
    size = check_reachable(video_url)
    if size:
        print(f"            {size/1_048_576:.1f} MB, reachable")
    print(f"Caption   : {len(caption)} characters")
    print()

    print("[1/3] Reel container bana raha hoon...")
    created = call("POST", f"{ig_user}/media", {
        "media_type": "REELS",
        "video_url": video_url,
        "caption": caption,
        "share_to_feed": "true",
        "access_token": token,
    })
    container = created.get("id")
    if not container:
        die(f"Container id nahi mila: {created}")
    print(f"      container {container}")

    print("[2/3] Instagram video process kar raha hai (2-3 min lag sakte hain)...")
    deadline = time.time() + MAX_SECONDS
    last = None
    while time.time() < deadline:
        time.sleep(10)
        status = call("GET", container, {
            "fields": "status_code,status",
            "access_token": token,
        })
        code = status.get("status_code")
        if code != last:
            print(f"      {code}")
            last = code
        if code == "FINISHED":
            break
        if code == "ERROR":
            die(f"Instagram video process nahi kar paya: {status.get('status')}")
        if code == "EXPIRED":
            die("Container expire ho gaya — dobara try karo.")
    else:
        die("Processing bahut lamba chal gaya. Baad me try karo.")

    print("[3/3] Publish kar raha hoon...")
    published = call("POST", f"{ig_user}/media_publish", {
        "creation_id": container,
        "access_token": token,
    })
    media_id = published.get("id")
    if not media_id:
        die(f"Publish nahi hua: {published}")

    info = call("GET", media_id, {"fields": "permalink", "access_token": token})
    link = info.get("permalink", "")

    print()
    print("Reel live hai.")
    if link:
        print(f"  {link}")
    print(f"  media id: {media_id}")


if __name__ == "__main__":
    main()
