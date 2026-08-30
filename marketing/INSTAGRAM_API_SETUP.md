# Instagram auto-posting — one-time setup

Aapko ye sirf **ek baar** karna hai. Uske baad har reel API se apne aap publish hogi —
file kabhi select nahi karni padegi.

Kyun zaroori hai: instagram.com ka web uploader programmatically di gayi file accept
nahi karta (4 tareeke test kiye — sab pe loader chalke ruk jaata hai). Graph API hi
supported, official raasta hai.

---

## Step 1 — Instagram ko ek Facebook Page se jodo

Graph API sirf **Business/Creator** account ke saath kaam karta hai, aur wo account ek
Facebook Page se juda hona chahiye.

1. Instagram app → **Settings and privacy** → **Accounts Centre**
2. **Connected experiences** → **Accounts** → **Add accounts** → Facebook Page jodo
   - Page nahi hai to bana lo (naam: PriceVichar)
3. Instagram → Settings → **Account type and tools** → confirm karo ki **Professional
   (Business)** hai

Check: Facebook Page → Settings → Linked accounts → Instagram wahan dikhna chahiye.

---

## Step 2 — Meta app banao

1. Kholo <https://developers.facebook.com/apps>
2. **Create app**
3. Use case pucha jaye to → **Other** → app type **Business**
4. App ka naam: `PriceVichar Publisher` · apni email daalo
5. App ban jaye to → **App settings → Basic** → **App ID** aur **App Secret** note kar lo

App ko **Development mode** mein hi rakhna hai — apne hi account pe post karne ke liye
App Review ki zaroorat nahi hai.

---

## Step 3 — Token banao

1. Kholo <https://developers.facebook.com/tools/explorer>
2. Upar right mein apna app select karo (`PriceVichar Publisher`)
3. **Generate Access Token** → Facebook se login karo
4. Permissions add karo (Add a Permission dropdown se):
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
5. Dobara **Generate Access Token** → permissions allow karo
6. Jo token mile use copy kar lo (ye short-lived hai, ~1 ghanta)

---

## Step 4 — Token ko long-lived banao aur IDs nikalo

Terminal kholo aur ye chalao — script khud pooch legi:

```bash
bash "/Users/mithun/Desktop/Mithun Personal/bestdaam-price/marketing/ig_setup_helper.sh"
```

Ye script:
- short-lived token ko **60-din wale long-lived token** mein badal degi
- aapka **Instagram Business Account ID** dhoond legi
- dono ko `~/.pricevichar/instagram.env` mein `chmod 600` ke saath save kar degi

Bas. Setup khatam.

---

## Uske baad

Main har reel aise publish kar doonga:

```bash
python3 marketing/publish_instagram.py <video-url> "<caption>"
```

Video pehle aapki apni site pe jayega (`public/reels/`), jahan se Instagram khud
download karega — jaise abhi `/earnkaro-live/` ki images serve hoti hain.

Poora flow (main karunga, aapko kuch nahi):

1. Reel `public/reels/` me copy → commit → push → deploy
2. `publish_instagram.py` chalao — Instagram video uthata hai, process karta hai, publish
3. File `public/reels/` se hata do (Instagram apni copy rakh leta hai)

Step 3 isliye ki har reel 4-6 MB ki hai — repo bhaari na ho jaye.

---

## Dhyan rakhne ki baatein

- **Token 60 din chalta hai.** Expire hone se pehle main refresh kar dunga; script
  expiry date bhi print karti hai.
- **Token kabhi chat mein mat bhejna** aur kabhi git mein commit mat karna. Wo
  `~/.pricevichar/` mein rahega, repo ke bahar.
- **App Secret** bhi wahin rahega, kahin aur nahi.
- Token leak ho jaye to Meta app dashboard se turant invalidate kar dena.
