# ResuFit — Setup Guide

Follow these steps in order. Steps marked **[You]** require your accounts/credentials. Steps marked **[Claude]** will be done together once you have the keys.

---

## 1. Push the code to GitHub [You]

```bash
# In a terminal, navigate to the resufit folder, then:
git init
git add .
git commit -m "Initial ResuFit scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/resufit.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## 2. Install dependencies [You]

```bash
npm install
```

This installs everything in `package.json`. Requires Node.js 18+. Check with `node -v`.

---

## 3. Set up Supabase [You]

1. Create a project at [supabase.com](https://supabase.com) named `resufit`
2. Choose region: `eu-west-1` (London) or `us-east-1`
3. Go to **SQL Editor** → paste the full contents of `supabase/schema.sql` → Run
4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` / `public` key
   - `service_role` key (keep secret)

---

## 4. Set up Stripe [You]

1. Create account at [stripe.com](https://stripe.com), complete identity verification
2. Create three products with prices:

   | Product | Mode | USD | GBP | EUR |
   |---------|------|-----|-----|-----|
   | Resume Optimization | One-time | $5 | £5 | €5 |
   | ResuFit Pro | Monthly recurring | $15 | £15 | €15 |
   | ResuFit Annual | Yearly recurring | $99 | £99 | €99 |

3. Copy the **Price ID** for each (format: `price_xxxxx`) — you need all 9
4. Go to **Developers → API Keys**, copy publishable + secret keys
5. Enable Apple Pay and Google Pay in **Settings → Payment methods**
6. Webhooks → add endpoint after deploying (URL will be `https://your-domain.com/api/webhooks/stripe`)

---

## 5. Get your Anthropic API key [You]

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Set a monthly spend limit (recommend $20 while testing)

---

## 6. Set up Resend (email) [You]

1. Create account at [resend.com](https://resend.com)
2. Create an API key
3. Verify your sending domain once your domain is live

---

## 7. Set up Upstash Redis (rate limiting) [You]

1. Create account at [upstash.com](https://upstash.com)
2. Create a Redis database (free tier is sufficient)
3. Copy the REST URL and token

---

## 8. Configure environment variables [You]

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in all values from steps 3–7.

---

## 9. Run locally [You]

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 10. Deploy to Vercel [Claude + You]

1. Go to [vercel.com](https://vercel.com) → Import Git Repository → select `resufit`
2. Add all environment variables from `.env.local` in the Vercel dashboard
3. Deploy
4. Copy your production URL (`https://resufit.vercel.app` or your custom domain)
5. Add the production URL to `NEXT_PUBLIC_APP_URL` in Vercel
6. Register the Stripe webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
7. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel

---

## 11. Connect custom domain [You]

1. Purchase your domain (recommend Cloudflare Domains)
2. In Vercel: **Settings → Domains** → add your domain
3. Vercel provides DNS records → add them in Cloudflare
4. Update `NEXT_PUBLIC_APP_URL` to your final domain

---

## File structure reference

```
resufit/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage (upload + job description)
│   ├── layout.tsx          # Root layout + SEO metadata
│   ├── (auth)/             # Sign-in and sign-up pages
│   ├── results/[id]/       # Results + payment flow
│   ├── dashboard/          # User dashboard
│   └── api/                # Server-side API routes
│       ├── upload/         # File extraction (no AI, no cost)
│       ├── optimize/       # Core AI optimization (payment required)
│       ├── skill-gap/      # Skill gap revision (single call)
│       ├── checkout/       # Stripe Checkout session creation
│       └── webhooks/stripe # Stripe webhook handler (writes entitlements)
├── components/             # Shared React components
├── lib/                    # Utilities: Supabase, Stripe, Anthropic, rate limiting
├── supabase/schema.sql     # Run this in Supabase SQL Editor
├── types/index.ts          # TypeScript types
├── middleware.ts            # Auth protection + session refresh
├── .env.example            # Template — copy to .env.local
└── SETUP.md                # This file
```
