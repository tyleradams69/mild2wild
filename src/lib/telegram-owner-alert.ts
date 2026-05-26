export type TelegramOwnerAlertResult =
  | { configured: false; queued: false; reason: "missing_config" }
  | { configured: true; queued: true; messageId?: number }
  | { configured: true; queued: false; reason: "send_failed"; error?: string };

type TelegramSendMessageResponse = {
  ok?: boolean;
  description?: string;
  result?: {
    message_id?: number;
  };
};

export function getTelegramOwnerAlertConfig(env: NodeJS.ProcessEnv = process.env) {
  const botToken = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_OWNER_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return null;
  }

  return { botToken, chatId };
}

export function buildTelegramOwnerAlertMessage(summary: string) {
  return `🚨 Mild 2 Wild lead alert\n\n${summary}\n\nOpen dashboard:\nhttps://mild2wild.vercel.app/dashboard`;
}

export async function sendTelegramOwnerAlert(
  summary: string,
  env: NodeJS.ProcessEnv = process.env,
  fetcher: typeof fetch = fetch,
): Promise<TelegramOwnerAlertResult> {
  const config = getTelegramOwnerAlertConfig(env);
  if (!config) {
    return { configured: false, queued: false, reason: "missing_config" };
  }

  try {
    const response = await fetcher(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: buildTelegramOwnerAlertMessage(summary),
        disable_web_page_preview: true,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as TelegramSendMessageResponse;

    if (!response.ok || payload.ok === false) {
      return {
        configured: true,
        queued: false,
        reason: "send_failed",
        error: payload.description ?? `Telegram API returned HTTP ${response.status}`,
      };
    }

    return { configured: true, queued: true, messageId: payload.result?.message_id };
  } catch (error) {
    return {
      configured: true,
      queued: false,
      reason: "send_failed",
      error: error instanceof Error ? error.message : "Unknown Telegram delivery error",
    };
  }
}
