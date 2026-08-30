# reels/

Instagram apne server se video **khud download** karta hai, isliye publish karne se
pehle file yahan aani chahiye aur live honi chahiye:

    public/reels/foo.mp4  →  https://pricevichar.com/reels/foo.mp4

Kaam ka tareeka:

1. Reel yahan copy karo, commit + push karo, deploy hone do
2. `python3 marketing/publish_instagram.py https://pricevichar.com/reels/foo.mp4 "caption"`
3. Publish hote hi file yahan se **hata do** aur commit karo

Step 3 zaroori hai: har reel 4-6 MB ki hai. Yahan chhodte gaye to repo mahine bhar me
100 MB+ bhaari ho jayega. Instagram ko file sirf processing ke waqt (2-3 min) chahiye,
uske baad wo apni copy rakhta hai — link toot ne se reel par koi asar nahi padta.
