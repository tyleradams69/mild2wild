# Mild 2 Wild live-site client review

Target: https://mild2wild.vercel.app
Scope: customer-facing website, login, dashboard visibility, website-only project scope.

## Executive summary

The graffiti/pastel UI is live and the login path works. The site is now aligned to the updated website-only scope: no worker agent, Telegram bot, or phone/call-agent automation is part of the active product surface.

The current polish pass focused on launch-readiness items that do not require new client assets: cleaner public copy, customer-facing staff names, reduced CTA duplication, friendlier booking fallback errors, SEO metadata/schema, and a client handoff checklist.

## What was checked

- Homepage first impression and CTAs.
- Header/footer navigation.
- Booking page and booking request language.
- Staff naming/profile presentation.
- Products/tour/legal copy for customer-facing tone.
- Login/dashboard continuity.
- Repo references for removed automation scope.
- Tests, lint, and build.

## Current high-value remaining client-dependent items

1. Replace temporary/illustrative staff names with final approved staff roster.
2. Add final business address, hours, phone, public email, and social links.
3. Confirm final services, pricing/ranges, durations, deposit rules, and consultation requirements.
4. Confirm final tattoo/minor/ID/waiver/cancellation/aftercare policy language.
5. Add final shop tour video or approved interior/community photos.
6. Confirm whether gift cards/products are showcase-only, message-to-buy, or ecommerce later.

## Website-only scope confirmation

Removed from active scope:

- Worker agent.
- Telegram bot.
- Phone/call-agent automation.

Kept in active scope:

- Public website.
- Website booking request flow.
- Staff/service pages.
- Owner/staff dashboard.
- First-party calendar/dashboard workflow.
- Client handoff documentation.

## Verification gate

Run before every client-facing deploy:

```bash
npm test
npm run lint
npm run build
```

Then browser-check:

- `/`
- `/book`
- `/staff`
- one staff profile
- one service page
- `/products`
- `/tour`
- `/legal`
- `/login`
- `/dashboard`

For production booking verification, submit one clearly labeled QA request and clean it up if it writes to production.
