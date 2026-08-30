#!/usr/bin/env bash
# One-time Instagram Graph API setup.
#
# Takes the short-lived token from Graph API Explorer, exchanges it for a
# 60-day token, finds the Instagram Business Account id behind your Facebook
# Page, and writes both to ~/.pricevichar/instagram.env (chmod 600).
#
# Nothing here is ever echoed back in full or committed to git.

set -euo pipefail

API="https://graph.facebook.com/v21.0"
ENV_DIR="$HOME/.pricevichar"
ENV_FILE="$ENV_DIR/instagram.env"

say()  { printf '%s\n' "$*"; }
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

# Pull one value out of a JSON blob without needing jq installed.
jget() { python3 -c '
import json,sys
try: d=json.load(sys.stdin)
except Exception: print(""); sys.exit()
for k in sys.argv[1:]:
    if d is None: break
    d = d.get(k) if isinstance(d,dict) else None
print("" if d is None else d)
' "$@"; }

jerr() { python3 -c '
import json,sys
try: d=json.load(sys.stdin)
except Exception: print(""); sys.exit()
e=d.get("error") or {}
print(e.get("message","") if e else "")
'; }

say ""
say "=== PriceVichar · Instagram auto-posting setup ==="
say ""
say "Ye 3 cheezein chahiye (INSTAGRAM_API_SETUP.md ke Step 2 aur 3 se):"
say "  1. App ID"
say "  2. App Secret"
say "  3. Short-lived access token (Graph API Explorer se)"
say ""

read -r -p "App ID: " APP_ID
[ -n "$APP_ID" ] || fail "App ID khaali hai."

read -r -s -p "App Secret: " APP_SECRET; echo
[ -n "$APP_SECRET" ] || fail "App Secret khaali hai."

read -r -s -p "Short-lived token: " SHORT_TOKEN; echo
[ -n "$SHORT_TOKEN" ] || fail "Token khaali hai."

say ""
say "[1/3] Token ko 60-din wala bana raha hoon..."

RESP=$(curl -sS -G "$API/oauth/access_token" \
  --data-urlencode "grant_type=fb_exchange_token" \
  --data-urlencode "client_id=$APP_ID" \
  --data-urlencode "client_secret=$APP_SECRET" \
  --data-urlencode "fb_exchange_token=$SHORT_TOKEN")

LONG_TOKEN=$(printf '%s' "$RESP" | jget access_token)
if [ -z "$LONG_TOKEN" ]; then
  MSG=$(printf '%s' "$RESP" | jerr)
  fail "Long-lived token nahi mila. Meta ne kaha: ${MSG:-unknown error}"
fi
EXPIRES=$(printf '%s' "$RESP" | jget expires_in)
say "      ho gaya (${EXPIRES:-?} seconds valid)"

say "[2/3] Facebook Pages dhoondh raha hoon..."

PAGES=$(curl -sS -G "$API/me/accounts" \
  --data-urlencode "fields=id,name" \
  --data-urlencode "access_token=$LONG_TOKEN")

PAGE_COUNT=$(printf '%s' "$PAGES" | python3 -c '
import json,sys
try: print(len(json.load(sys.stdin).get("data",[])))
except Exception: print(0)
')

if [ "$PAGE_COUNT" = "0" ]; then
  MSG=$(printf '%s' "$PAGES" | jerr)
  fail "Koi Facebook Page nahi mila. ${MSG:-Step 1 dobara check karo — Instagram Page se juda hona chahiye.}"
fi

say "[3/3] Instagram Business Account nikaal raha hoon..."

FOUND=$(printf '%s' "$PAGES" | python3 -c '
import json,subprocess,sys
api, token = sys.argv[1], sys.argv[2]
for page in json.load(sys.stdin).get("data", []):
    out = subprocess.run(
        ["curl","-sS","-G", f"{api}/{page[\"id\"]}",
         "--data-urlencode","fields=instagram_business_account{id,username}",
         "--data-urlencode", f"access_token={token}"],
        capture_output=True, text=True).stdout
    try: iba = json.loads(out).get("instagram_business_account")
    except Exception: iba = None
    if iba:
        print(f"{iba[\"id\"]}\t{iba.get(\"username\",\"\")}\t{page[\"name\"]}")
        break
' "$API" "$LONG_TOKEN")

IG_ID=$(printf '%s' "$FOUND" | cut -f1)
IG_USER=$(printf '%s' "$FOUND" | cut -f2)
PAGE_NAME=$(printf '%s' "$FOUND" | cut -f3)

if [ -z "$IG_ID" ]; then
  fail "Page mila par usse koi Instagram Business Account juda nahi hai.
       Step 1 dobara karo: Instagram ko Facebook Page se link karo,
       aur account type Professional (Business) hona chahiye."
fi

say "      mila: @${IG_USER} (Page: ${PAGE_NAME})"

mkdir -p "$ENV_DIR"
umask 077
cat > "$ENV_FILE" <<ENV_CONTENT
# PriceVichar Instagram publishing credentials
# Banaya: $(date '+%Y-%m-%d %H:%M %Z')
# Token ~60 din chalta hai. Refresh: ig_setup_helper.sh dobara chala lo.
IG_APP_ID=$APP_ID
IG_APP_SECRET=$APP_SECRET
IG_ACCESS_TOKEN=$LONG_TOKEN
IG_USER_ID=$IG_ID
IG_USERNAME=$IG_USER
ENV_CONTENT
chmod 600 "$ENV_FILE"

say ""
say "Sab ho gaya. Credentials yahan save hain:"
say "  $ENV_FILE  (sirf aap padh sakte ho)"
say ""
say "Ab main reels API se publish kar sakta hoon. Bas bata dena."
say ""
