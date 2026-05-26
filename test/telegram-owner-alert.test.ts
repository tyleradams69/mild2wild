import { describe, expect, it, vi } from "vitest";
import { buildTelegramOwnerAlertMessage, getTelegramOwnerAlertConfig, sendTelegramOwnerAlert } from "../src/lib/telegram-owner-alert";

describe("telegram owner alerts", () => {
  it("stays optional when the bot token or chat id are missing", async () => {
    expect(getTelegramOwnerAlertConfig({})).toBeNull();

    const result = await sendTelegramOwnerAlert("Lead summary", {}, vi.fn() as unknown as typeof fetch);

    expect(result).toEqual({ configured: false, queued: false, reason: "missing_config" });
  });

  it("formats the owner alert with dashboard link", () => {
    expect(buildTelegramOwnerAlertMessage("Client: Riley")).toContain("Mild 2 Wild lead alert");
    expect(buildTelegramOwnerAlertMessage("Client: Riley")).toContain("Client: Riley");
    expect(buildTelegramOwnerAlertMessage("Client: Riley")).toContain("https://mild2wild.vercel.app/dashboard");
  });

  it("sends through Telegram Bot API when configured", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, result: { message_id: 42 } }),
    }) as unknown as typeof fetch;

    const result = await sendTelegramOwnerAlert(
      "Client: Riley",
      { TELEGRAM_BOT_TOKEN: "bot-token", TELEGRAM_OWNER_CHAT_ID: "12345" },
      fetcher,
    );

    expect(result).toEqual({ configured: true, queued: true, messageId: 42 });
    expect(fetcher).toHaveBeenCalledWith("https://api.telegram.org/botbot-token/sendMessage", expect.objectContaining({ method: "POST" }));
  });
});
