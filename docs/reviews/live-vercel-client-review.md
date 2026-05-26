# Mild 2 Wild live Vercel client review

Target: https://mild2wild.vercel.app
Reviewed as: prospective client/customer and business owner
Date: 2026-05-26

## Executive summary

The live site has a strong visual direction: bold blacklight-inspired styling, memorable typography, colorful service categories, illustrated staff portraits, and a clear multi-service structure. The core architecture is visible and working: pages load, service pages filter to the right staff categories, the shop dog is no longer bookable, and the main navigation is clear.

From a client-facing launch perspective, the site still reads like a polished prototype because several pages expose placeholder or internal copy. The highest-priority concerns are public booking not persisting on production, visible demo language, placeholder staff names/bios, internal admin/security notes on the login page, draft/legal approval notes on the legal page, and placeholder product/tour content.

## What worked

- Production URL is live and reachable at https://mild2wild.vercel.app.
- Main pages return expected statuses:
  - / 200
  - /services/nails 200
  - /services/hair 200
  - /services/tattoo 200
  - /services/aesthetics 200
  - /staff 200
  - /staff/team-member-12 200
  - /staff/team-member-13 200
  - /book 200
  - /tour 200
  - /products 200
  - /legal 200
  - /login 200
  - /dashboard redirects to /login
- No JavaScript console errors appeared during browser review of the pages checked.
- Tattoo page showed only tattoo staff: Team Member 03, Team Member 07, Team Member 10.
- Booking service/staff filtering works in the browser: selecting Tattoo Consultation produced only tattoo artist options.
- Shop Dog Mascot profile is clearly non-bookable and does not show Book with me or Personal calendar.
- Staff images exist on Vercel and return 200 for team-member-01 through team-member-17.

## High-priority findings

### 1. Public booking and call-agent lead APIs fail on production

Severity: High
Category: Functional / Launch blocker

Observed:
- POST /api/booking-requests returned HTTP 500 with: Booking data has not been seeded yet.
- POST /api/call-agent-leads returned HTTP 500 with: Could not save call-agent lead.

Client impact:
A real customer may fill out the booking form but the backend cannot save the request. The call-agent lead endpoint also cannot persist leads.

Recommendation:
Before public launch, connect/seed the production Supabase database and verify both endpoints create records successfully. If the site is still only a demo, make the booking form show a clear demo-safe message instead of silently failing or exposing backend errors.

### 2. Public pages contain internal/prototype copy

Severity: High
Category: Content / Trust

Examples:
- Homepage: mentions protected calendars and AI call-agent handoff in a product-spec way.
- Staff page: “The real names and bios can drop in later.”
- Booking page: “The final system can swap this prototype endpoint...”
- Tour page: “Embed YouTube/Vimeo or host a walkthrough video here.”
- Products page: “Placeholder product card. Add real image, price...”
- Legal page: “Draft policy language...” and “Have Caitlin approve...”
- Login page: “Temporary for now. We’ll add a settings page...”

Client impact:
The design feels polished, but the copy makes the live site feel unfinished or accidentally public.

Recommendation:
Create a “public-safe demo copy” pass. Remove words like draft, prototype, final system, before launch, client-supplied bio soon, and temporary.

### 3. Login page exposes internal/security-sensitive information

Severity: High
Category: Security / Trust / UX

Observed:
- Email field is prefilled with Hyer.quality.craft@gmail.com.
- Copy says the login uses Supabase Auth.
- Copy describes owner/staff permission structure.
- Password helper text says it is temporary and will be changed before launch.

Client impact:
This exposes a likely real email address and makes the portal feel insecure/unfinished.

Recommendation:
Blank the email field, remove Supabase references, remove temporary password copy, and simplify to: “Authorized team members can sign in to manage appointments and schedules.” Add forgot-password/reset flow before production use.

### 4. Staff directory still feels unfinished

Severity: High
Category: Content / Trust

Observed:
Most profiles use Team Member ## names and repeated placeholder bios.

Client impact:
Clients booking tattoos, nails, hair, or spa services need real names, specialties, portfolios, and trust signals.

Recommendation:
Replace with real staff names/bios/socials or hide unfinished staff cards until content is ready. If temporary, use less internal language such as “Bio coming soon” but avoid “client-supplied bio soon.”

## Medium-priority findings

### 5. Mascot separation works, but the card badge says STAFF

Severity: Medium
Category: UX / Content

Observed:
The Shop Dog Mascot is separated from employees and the profile is non-bookable. However, the mascot card badge still says STAFF.

Recommendation:
Change the badge to MASCOT, SHOP DOG, or NON-BOOKABLE.

### 6. Booking page mixes customer form with internal operations notes

Severity: Medium
Category: UX / Content

Observed:
The booking page includes AI Call Agent Intake and Calendar Permissions panels with internal workflow language.

Client impact:
This makes the booking page feel like a demo/admin page instead of a customer booking page.

Recommendation:
Move AI/calendar permission notes to admin/docs, and leave the public page focused on booking expectations.

### 7. Legal page is not launch-ready copy

Severity: Medium
Category: Legal / Trust / Content

Observed:
The page says it is draft policy copy and instructs Caitlin to approve before publishing. Several sections use tentative language around deposits, age/minor rules, and AI call-agent behavior.

Recommendation:
Rewrite as final client-facing shop policy copy. Remove internal approval notes. Finalize deposit/cancellation/no-show terms and tattoo age/ID/consent policy.

### 8. Tour page lacks actual video and shop-specific story

Severity: Medium
Category: Content

Observed:
Tour page has a large video placeholder and generic story/charity/differentiator cards.

Recommendation:
Add a real video, thumbnail, or hide the page until assets are ready. Replace generic copy with actual shop story and charity details.

### 9. Products page is only a placeholder catalog

Severity: Medium
Category: Content / Commerce

Observed:
Product cards are categories only, with no real product names, images, prices, inventory, or purchase/inquiry flow.

Recommendation:
Decide whether this is showcase, message-to-buy, or ecommerce. Add real products, photos, prices, and CTA such as Message to Buy or Buy Gift Card.

### 10. Footer uses internal product/platform language

Severity: Medium
Category: Content / Brand

Observed:
Footer says: “Built for staff-owned calendars, owner admin visibility, and AI-assisted call intake.”

Recommendation:
Replace with customer-facing info: location, phone, hours, socials, booking policy, aftercare, legal/policies.

## Low-priority findings

### 11. Some lazy-loaded staff images appear black until scrolling further

Severity: Low
Category: Visual / Performance

Observed:
Lower staff cards initially appeared black/blank during review, then loaded after additional scrolling. Source files return 200.

Recommendation:
Consider smaller image sizes, blur placeholders, or eager-load above/near-fold cards to avoid the impression of broken images.

### 12. Staff/profile cards need clearer click affordance

Severity: Low
Category: UX

Observed:
Cards are clickable, but some users may not realize it.

Recommendation:
Add View Profile, View Portfolio, or Book with [Name] buttons to real staff cards.

## Suggested client-ready copy direction

Homepage hero:
“Book nails, hair, tattoos, aesthetics, and spa services with artists who match your style.”

Staff page intro:
“Meet our artists, stylists, and specialists. Each profile includes services, portfolio notes, social links, and booking options.”

Booking page intro:
“Choose a service, select your preferred team member, and send us your appointment request. We’ll follow up to confirm availability, pricing, and any deposit requirements.”

Login page:
“Authorized team members can sign in to manage appointments and schedules.”

Legal page intro:
“Please review our shop policies before booking. These guidelines help us provide safe, professional service and set clear expectations around appointments, consent, pricing, privacy, and aftercare.”

## Recommended next fixes in order

1. Fix production Supabase seeding/config so booking and call-agent endpoints work.
2. Remove public internal/prototype/draft copy across the site.
3. Clean up login page: no prefilled real email, no Supabase/temporary-password notes.
4. Replace placeholder staff names/bios or hide unfinished profiles.
5. Change mascot badge from STAFF to MASCOT/NON-BOOKABLE.
6. Move AI/calendar permission explainer off the public booking page.
7. Finalize legal/policy copy.
8. Add real tour video/story/charity content.
9. Add real product data or convert Products into a “coming soon”/message-to-buy page.
10. Add location, hours, phone, social links, and trust signals.
