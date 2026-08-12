export function isWhatsAppBotEnabled(
  value: string | undefined = process.env.WHATSAPP_BOT_ENABLED,
): boolean {
  return value?.trim().toLowerCase() === "true";
}
