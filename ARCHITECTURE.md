# BestDaam.in — Architecture Plan (Master Plan)

> **Ye kya hai?** BestDaam ek India price comparison website hai. User koi bhi product
> search karega (jaise "iPhone" ya "mixer grinder"), aur website dikhayegi ki wo product
> Amazon, Flipkart, Croma, Reliance Digital jaise stores par **kitne me mil raha hai** —
> taaki user sabse saste daam par kharide.

> **Domain:** `bestdaam.in` (GoDaddy se kharida hua). Website live hone par ye domain
> use hoga.

---

## Kamai ka tarika (Business Model)

Website free rahegi. Jab user hamari site se kisi store ke link par click karke
kharidari karega, to store humein **affiliate commission** dega (Amazon Associates,
Flipkart Affiliate, etc.). User ko koi extra paisa nahi dena padta.

---

## Technology (simple language me)

| Cheez | Kya use karenge | Kyun |
|---|---|---|
| Website banane ka tool | **Next.js** (React) | Google search me achhi ranking milti hai, free hosting possible |
| Design | Simple CSS | Fast aur mobile-friendly |
| Hosting | **Vercel** (free plan) | Free me website live hoti hai, bestdaam.in domain connect ho jata hai |
| Data (shuru me) | Demo data (JSON file) | Pehle site ka dhancha ready karo, asli data baad me |
| Data (baad me) | Amazon PA-API + Flipkart Affiliate API | Official tarika prices lene ka |
| Database (baad me) | PostgreSQL (Supabase/Neon free plan) | Price history aur alerts ke liye |

---

## Phases (kaam ke stage)

### ✅ Phase 1 — Website ka dhancha (Foundation) — ABHI CHAL RAHA HAI
Goal: Ek poori chalne wali website, demo data ke saath.
- [x] Homepage — search box + popular products
- [x] Product page — sabhi stores ke prices ki tulna (comparison), sabse sasta highlight
- [x] Mobile-friendly design
- [x] Demo products (10 popular Indian products, 4 stores ke prices)
- [x] Categories (Mobile, Electronics, Kitchen, Home)

**Note:** Phase 1 me prices demo/sample hain — asli nahi. Ye sirf dikhane ke liye hai
ki website kaisi dikhegi aur kaam karegi.

### Phase 2 — Asli price data
Goal: Demo data hatakar asli prices dikhana.
- Amazon Associates account banana (affiliate) → Amazon PA-API se prices
- Flipkart Affiliate account → Flipkart API se prices
- Database me products aur prices store karna
- Din me kai baar prices auto-update hona

### Phase 3 — User features
Goal: Users ko baar-baar wapas laana.
- Price history graph ("ye product pichle mahine kitne ka tha?")
- Price drop alert ("jab ₹50,000 se kam ho, mujhe email karo")
- User login (Google se sign-in)

### Phase 4 — Launch aur kamai
Goal: Website ko duniya ke saamne laana.
- Vercel par deploy + **bestdaam.in** domain connect (GoDaddy DNS setting)
- SEO — Google search me aane ke liye
- Affiliate links active karna (kamai shuru)
- Aur stores jodna (Croma, Reliance, Tata CLiQ, Vijay Sales)

---

## Folder structure (repo me kya kahan hai)

```
bestdaam-price/
├── ARCHITECTURE.md   ← ye file (master plan)
├── README.md         ← project chalane ka tarika
├── app/              ← website ke pages
│   ├── page.js       ← homepage (search + product list)
│   └── product/[id]/ ← price comparison page
├── data/products.json ← demo products aur prices
└── lib/products.js   ← data padhne ke helper functions
```
