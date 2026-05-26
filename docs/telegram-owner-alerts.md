# Telegram owner alerts

Telegram can be used as the first notification channel for Mild 2 Wild call-agent handoffs. This avoids Twilio/A2P approval delays while still letting Caitlin receive lead alerts on her phone.

The dashboard remains the source of truth. Telegram is optional: if the bot token or chat ID are missing, the API still saves the lead and returns `telegramAlertQueued: false`.

## Environment variables

Add these in Vercel when the bot/chat are ready:

```text
TELEGRAM_BOT_TOKEN=
TELEGRAM_OWNER_CHAT_ID=
```

Do not prefix these with `NEXT_PUBLIC_`. The bot token must stay server-only.

## Setup steps later

1. In Telegram, message `@BotFather`.
2. Run `/newbot` and follow the prompts.
3. Copy the bot token into `TELEGRAM_BOT_TOKEN`.
4. Create either:
   - a private 1:1 chat between Caitlin and the bot, or
   - a private owner/admin group with Caitlin and the bot.
5. Send any message in that chat so Telegram creates the conversation.
6. Get the chat ID. Common quick methods:
   - Visit `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates` after sending the message, then copy `message.chat.id`.
   - Or use a temporary helper bot such as `@userinfobot` / `@RawDataBot`, then remove it from the group after copying the ID.
7. Add the ID to `TELEGRAM_OWNER_CHAT_ID`.
8. Redeploy or trigger a Vercel deployment so env vars are active.
9. Submit a test call-agent lead and confirm Caitlin receives the Telegram alert.

## Runtime behavior

`POST /api/call-agent-leads` always tries to save the lead first.

If Telegram is not configured, the response includes:

```json
{
  "ok": true,
  "telegramAlertQueued": false,
  "telegramAlertReason": "Telegram is not configured yet."
}
```

If Telegram is configured and the alert sends successfully, the response includes:

```json
{
  "ok": true,
  "telegramAlertQueued": true,
  "telegramMessageId": 123
}
```

If Telegram fails, the lead is still saved and the response includes:

```json
{
  "ok": true,
  "telegramAlertQueued": false,
  "telegramAlertReason": "Telegram delivery failed; the lead is still saved in the dashboard."
}
```

## Alert content

Telegram messages include:

- Mild 2 Wild lead alert heading
- client name
- client phone, if provided
- requested service
- preferred staff
- preferred time
- agent notes/summary
- dashboard link

The existing `text_summary_*` database columns are still used as the persisted owner-alert summary fields for now. That keeps the schema stable while allowing Telegram now and SMS later if desired.
