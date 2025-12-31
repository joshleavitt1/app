# Stripe setup

1. Create a **Product + recurring Price** in Stripe. Copy the price id into `STRIPE_PRICE_ID`.
2. Create a **Customer portal** configuration with return URL `https://your-site.com/billing`.
3. Add webhook endpoint `https://your-site.com/api/stripe/webhook` listening to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the generated webhook secret into `STRIPE_WEBHOOK_SECRET`.
5. Set environment variables:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRICE_ID=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_SITE_URL=https://your-site.com
   ```
6. Local testing: start Next.js and run `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

## How subscription state is stored

- Stripe customer id is stored on `profiles.stripe_customer_id`.
- Subscription status is stored on `profiles.subscription_status` and is set to `"active"` when Stripe status is `active` or `trialing`; otherwise `"canceled"`.
- `profiles.billing_cycle_anchor` tracks the subscription period end.
- Webhooks update these fields so the paywall can check `subscription_status` before letting a user access narratives.
