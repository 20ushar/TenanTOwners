export interface IncomingWhatsAppMessage {
  messageId: string;
  senderId: string;
  timestamp: string | null;
  messageType: string;
  text: string | null;
}

const MAX_IDENTIFIER_LENGTH = 200;
const MAX_MESSAGE_TYPE_LENGTH = 50;
const MAX_TEXT_LENGTH = 4096;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    return null;
  }
  return value;
}

export function isValidWebhookEnvelope(payload: unknown): payload is Record<string, unknown> {
  if (!isRecord(payload)) return false;
  if (payload.object !== "whatsapp_business_account") return false;
  return Array.isArray(payload.entry);
}

export function extractIncomingMessages(payload: Record<string, unknown>): IncomingWhatsAppMessage[] {
  const extracted: IncomingWhatsAppMessage[] = [];
  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  for (const entry of entries) {
    if (!isRecord(entry) || !Array.isArray(entry.changes)) continue;
    for (const change of entry.changes) {
      if (!isRecord(change) || !isRecord(change.value)) continue;
      const messages = Array.isArray(change.value.messages) ? change.value.messages : [];
      for (const candidate of messages) {
        if (!isRecord(candidate)) continue;
        const messageId = safeString(candidate.id, MAX_IDENTIFIER_LENGTH);
        const senderId = safeString(candidate.from, MAX_IDENTIFIER_LENGTH);
        const messageType = safeString(candidate.type, MAX_MESSAGE_TYPE_LENGTH);
        if (!messageId || !senderId || !messageType) continue;

        let text: string | null = null;
        if (messageType === "text" && isRecord(candidate.text)) {
          text = safeString(candidate.text.body, MAX_TEXT_LENGTH);
        }

        extracted.push({
          messageId,
          senderId,
          timestamp: safeString(candidate.timestamp, MAX_IDENTIFIER_LENGTH),
          messageType,
          text,
        });
      }
    }
  }

  return extracted;
}
