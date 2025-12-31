# App — Client Readiness Narratives

An MVP built with **Next.js (App Router) + TypeScript + Tailwind + Supabase + Stripe**. Users authenticate via Supabase magic link, subscribe with Stripe, and build autosaving client narratives with presenter/export views.

## Features
- Magic link authentication (Supabase).
- Stripe subscription gating; non-subscribers are routed to Billing.
- CRUD for narratives with the **Client Readiness Update** template.
- Builder UI with repeatable sections, debounced autosave to Supabase, and a sticky talk track preview.
- Presenter mode with copy + print-to-PDF export.
- Supabase RLS so users only access their own narratives.

## File structure
```
app/
  (marketing)/page.tsx          # Landing page
  (auth)/sign-in/page.tsx       # Magic link entry
  (protected)/layout.tsx        # Paywall (auth + subscription)
  (protected)/narratives/       # CRUD + presenter
  billing/page.tsx              # Non-subscriber view + portal/checkout
  api/stripe/                   # Checkout, portal, webhook handlers
components/
  narratives/                   # Builder + presenter controls
  shell/                        # App shell + nav
  ui/                           # Buttons
docs/
  supabase/schema.sql           # Tables + RLS
  STRIPE.md                     # Stripe setup steps
lib/
  supabase/                     # Server, browser, and service clients
  narrative.ts                  # Template types + defaults
  talk-track.ts                 # Pure formatter
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in Supabase + Stripe secrets.
3. Apply Supabase SQL:
   ```bash
   supabase db push --file docs/supabase/schema.sql
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Auth + database
- Uses `@supabase/ssr` to create server/browser clients.
- `profiles` table stores `stripe_customer_id`, `subscription_status`, and timestamps.
- `narratives` table stores the template JSON (`content`) and is owned by `user_id`.
- RLS restricts all reads/writes to `auth.uid()`.

## Stripe
- `/api/stripe/checkout` creates a subscription checkout session (requires `STRIPE_PRICE_ID`).
- `/api/stripe/portal` opens the billing portal for existing customers.
- `/api/stripe/webhook` syncs `subscription_status` + `billing_cycle_anchor` to Supabase using the service role key.
- Detailed steps in [`docs/STRIPE.md`](docs/STRIPE.md).

## Export/Presenter
- Presenter view is print-friendly; use the browser print dialog to generate PDFs (no server-side PDF).
- Talk track is a pure function (`lib/talk-track.ts`) and can be copied to clipboard from builder or presenter.
