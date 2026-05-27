# Tomorrow client info pass

Use this after Tyler gets more details from the owner/client.

## Fastest update order

1. Update business basics
   - business display name, address, hours, phone, public email
   - Instagram/TikTok/Facebook links
   - logo or brand asset if provided

2. Update staff roster
   - real names and titles
   - bios
   - photos/portfolio links
   - exact service categories and exact services each person offers
   - social links
   - confirm mascot/shop dog wording and whether it should stay public

3. Update service menu
   - exact service names
   - durations
   - price labels/ranges
   - consultation requirements
   - deposit requirements
   - service-to-staff mappings

4. Update booking rules
   - whether guests can choose staff or only request preference
   - walk-in policy
   - cancellation/no-show timing
   - deposit collection flow
   - tattoo forms/waivers/ID/minor policy

5. Update products
   - product names
   - photos
   - pricing
   - in-studio only vs inquiry vs checkout

6. Update tour/about/community
   - tour video URL or file
   - owner story
   - charity/community details
   - differentiators the owner wants emphasized

7. Update dashboard/auth
   - Caitlin owner login email
   - staff login emails
   - staff slug mapping for each user
   - verify owner can see all calendars and staff can only see their own

8. Website-only scope confirmed
   - external automation and alerting removed from scope
   - keep booking and dashboard follow-up inside the website workflow

## Current no-client-info polish already done

- mobile header quick links
- stronger footer quick links
- homepage booking process cards
- homepage featured real staff only, excluding mascot
- customer-safe booking success message
- booking page request tips
- service pages use customer-friendly staff matching copy
- products page avoids internal/future-build language
- tour coming-soon area feels more intentional
- legal copy says owner alerts instead of text-only follow-up

## Final QA checklist after content update

- Run `npm test && npm run lint && npm run build`
- Browser-check `/`, `/book`, `/staff`, one staff profile, one service page, `/products`, `/tour`, `/legal`
- Submit one QA booking request and clean it up
- Search public pages for internal words: prototype, draft, temporary, final system, client-supplied, Supabase, staff-service mapping
