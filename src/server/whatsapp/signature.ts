import { createHmac, timingSafeEqual } from "node:crypto";

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyWebhookToken(
  receivedToken: unknown,
  configuredToken: string | undefined,
): boolean {
  return typeof receivedToken === "string"
    && Boolean(configuredToken)
    && safeEqual(receivedToken, configuredToken!);
}

export function verifyWebhookSignature(
  rawBody: Buffer,
  signatureHeader: unknown,
  appSecret: string | undefined,
): boolean {
  if (!appSecret || typeof signatureHeader !== "string") return false;
  if (!/^sha256=[a-fA-F0-9]{64}$/.test(signatureHeader)) return false;

  const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  return safeEqual(signatureHeader.toLowerCase(), expected);
}
