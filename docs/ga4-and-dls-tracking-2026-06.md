# GA4 and De La Salle Referral Tracking

Use GA4 for campaign attribution, Search Console linking, and key-event reporting. Keep Vercel Analytics enabled for lightweight traffic and deployment-level analytics.

## Live setup

- GA4 account: The Sticker Smith
- GA4 property: The Sticker Smith - tssprint.com
- Web stream: The Sticker Smith Website
- Stream URL: `https://tssprint.com`
- Stream ID: `15061753352`
- Measurement ID: `G-4B9FXT1HQ9`
- Search Console link: `https://tssprint.com/` URL-prefix property linked to the web stream on 2026-06-12.

`VITE_GA4_MEASUREMENT_ID` is configured in Vercel Production and Preview.

## GA4 events

The site sends these GA4 events when `VITE_GA4_MEASUREMENT_ID` is configured:

- `quote_submit`: successful quote/contact/cart-quote lead submission.
- `phone_click`: visitor clicks a `tel:` link.
- `sms_click`: visitor clicks an `sms:` link.
- `checkout_started`: visitor reaches checkout with cart items.
- `begin_checkout`: GA4 ecommerce checkout event.
- `paypal_capture`: PayPal capture succeeds.
- `purchase`: GA4 ecommerce purchase event.
- `referral_link_click`: visitor arrives with a `?ref=` referral code.

Mark these as GA4 key events:

- `quote_submit`
- `phone_click`
- `sms_click`
- `checkout_started`
- `paypal_capture`
- `purchase`

As of setup on 2026-06-12, GA4 Realtime confirmed live `page_view`, `begin_checkout`, and `checkout_started` events. GA Admin had not yet surfaced the new custom event names in the Events table, so their key-event stars need a follow-up pass after GA processing catches up. `purchase` is already present in GA's key-event area by default.

## De La Salle campaign links

Base campaign:

`utm_source=de-la-salle&utm_medium=referral&utm_campaign=dls-network-2026`

Starter links:

- Stickers: `https://tssprint.com/stickers?utm_source=de-la-salle&utm_medium=referral&utm_campaign=dls-network-2026&utm_content=stickers`
- Fast quote: `https://tssprint.com/quote?utm_source=de-la-salle&utm_medium=referral&utm_campaign=dls-network-2026&utm_content=quote`
- Business signage: `https://tssprint.com/services/business-signage?utm_source=de-la-salle&utm_medium=referral&utm_campaign=dls-network-2026&utm_content=signage`
- Event displays: `https://tssprint.com/services/event-displays?utm_source=de-la-salle&utm_medium=referral&utm_campaign=dls-network-2026&utm_content=event-displays`

For one person, use `utm_content` as a short handle, not a full name:

`https://tssprint.com/quote?utm_source=de-la-salle&utm_medium=referral&utm_campaign=dls-network-2026&utm_content=dls-john`

If they also have a TSS referral code, add it as `ref=`:

`https://tssprint.com/quote?utm_source=de-la-salle&utm_medium=referral&utm_campaign=dls-network-2026&utm_content=dls-john&ref=JOHN123`

## Reading the data

In GA4:

- Realtime: confirm events within the last 30 minutes.
- Reports > Acquisition: compare `de-la-salle / referral` against other traffic.
- Reports > Engagement > Events: see event counts after processing.
- Advertising or key-event reports: compare campaign traffic by quote submits, checkout starts, and purchases.

In Search Console:

- Performance > Search results: check queries, pages, clicks, impressions, CTR, and average position.
- After linking GA4 and Search Console, GA4 can report organic search landing pages alongside engagement/key events.
