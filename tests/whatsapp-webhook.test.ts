import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createServer, type Server } from "node:http";
import test, { afterEach } from "node:test";
import express from "express";
import { isWhatsAppBotEnabled } from "../src/server/whatsapp/config";
import { createWhatsAppWebhookRouter } from "../src/server/whatsapp/webhook";
import type { IncomingWhatsAppMessage } from "../src/server/whatsapp/validation";

const VERIFY_TOKEN = "test-verification-token";
const APP_SECRET = "test-app-secret";
const servers: Server[] = [];

async function createTestServer(recordMessage?: (message: IncomingWhatsAppMessage) => Promise<boolean>) {
  const app = express();
  app.use(
    "/api/whatsapp/webhook",
    express.raw({ type: "application/json", limit: "256kb" }),
    createWhatsAppWebhookRouter({
      verifyToken: VERIFY_TOKEN,
      appSecret: APP_SECRET,
      recordMessage: recordMessage || (async () => true),
    }),
  );
  app.use(express.json());
  app.post("/api/existing-json-route", (req, res) => {
    res.status(200).json({ body: req.body });
  });

  const server = createServer(app);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address === "object");
  return `http://127.0.0.1:${address.port}/api/whatsapp/webhook`;
}

function signedHeaders(body: string, secret = APP_SECRET) {
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  return {
    "content-type": "application/json",
    "x-hub-signature-256": `sha256=${digest}`,
  };
}

function messagePayload(type = "text", id = "wamid.test-1") {
  const message: Record<string, unknown> = {
    id,
    from: "919999999999",
    timestamp: "1720000000",
    type,
  };
  if (type === "text") message.text = { body: "Hello" };
  return {
    object: "whatsapp_business_account",
    entry: [{ changes: [{ value: { messages: [message] } }] }],
  };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

test("valid GET verification returns the challenge", async () => {
  const url = await createTestServer();
  const response = await fetch(`${url}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=12345`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "12345");
});

test("invalid GET verification token is rejected", async () => {
  const url = await createTestServer();
  const response = await fetch(`${url}?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345`);
  assert.equal(response.status, 403);
});

test("missing GET verification parameters are rejected", async () => {
  const url = await createTestServer();
  const response = await fetch(url);
  assert.equal(response.status, 400);
});

test("valid POST signature is accepted", async () => {
  const url = await createTestServer();
  const body = JSON.stringify(messagePayload());
  const response = await fetch(url, { method: "POST", headers: signedHeaders(body), body });
  assert.equal(response.status, 200);
});

test("invalid POST signature is rejected", async () => {
  const url = await createTestServer();
  const body = JSON.stringify(messagePayload());
  const response = await fetch(url, { method: "POST", headers: signedHeaders(body, "wrong"), body });
  assert.equal(response.status, 401);
});

test("missing POST signature is rejected", async () => {
  const url = await createTestServer();
  const body = JSON.stringify(messagePayload());
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body });
  assert.equal(response.status, 401);
});

test("malformed POST signature is rejected", async () => {
  const url = await createTestServer();
  const body = JSON.stringify(messagePayload());
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hub-signature-256": "sha256=not-a-valid-digest",
    },
    body,
  });
  assert.equal(response.status, 401);
});

test("signed malformed payload is rejected after signature verification", async () => {
  const url = await createTestServer();
  const body = "{";
  const response = await fetch(url, { method: "POST", headers: signedHeaders(body), body });
  assert.equal(response.status, 400);
});

test("unknown valid webhook event is acknowledged and ignored", async () => {
  let writes = 0;
  const url = await createTestServer(async () => { writes += 1; return true; });
  const body = JSON.stringify({ object: "whatsapp_business_account", entry: [{ changes: [{ value: { statuses: [] } }] }] });
  const response = await fetch(url, { method: "POST", headers: signedHeaders(body), body });
  assert.equal(response.status, 200);
  assert.equal(writes, 0);
});

test("duplicate provider message IDs are delegated to durable deduplication", async () => {
  const seen = new Set<string>();
  let duplicates = 0;
  const url = await createTestServer(async (message) => {
    if (seen.has(message.messageId)) { duplicates += 1; return false; }
    seen.add(message.messageId);
    return true;
  });
  const body = JSON.stringify(messagePayload());
  await fetch(url, { method: "POST", headers: signedHeaders(body), body });
  await fetch(url, { method: "POST", headers: signedHeaders(body), body });
  assert.equal(seen.size, 1);
  assert.equal(duplicates, 1);
});

test("non-text messages are accepted without text content", async () => {
  let recorded: IncomingWhatsAppMessage | undefined;
  const url = await createTestServer(async (message) => { recorded = message; return true; });
  const body = JSON.stringify(messagePayload("image", "wamid.image-1"));
  const response = await fetch(url, { method: "POST", headers: signedHeaders(body), body });
  assert.equal(response.status, 200);
  assert.equal(recorded?.messageType, "image");
  assert.equal(recorded?.text, null);
});

test("BOT_ENABLED is false when missing or false and only true explicitly", () => {
  assert.equal(isWhatsAppBotEnabled(undefined), false);
  assert.equal(isWhatsAppBotEnabled("false"), false);
  assert.equal(isWhatsAppBotEnabled("1"), false);
  assert.equal(isWhatsAppBotEnabled("TRUE"), true);
});

test("disabled bot performs bookkeeping but sends no replies", async () => {
  assert.equal(isWhatsAppBotEnabled("false"), false);
  let writes = 0;
  const url = await createTestServer(async () => { writes += 1; return true; });
  const body = JSON.stringify(messagePayload());
  const response = await fetch(url, { method: "POST", headers: signedHeaders(body), body });
  assert.equal(response.status, 200);
  assert.equal(writes, 1);
  // Phase 2A contains no outgoing WhatsApp client or send operation.
});

test("webhook raw-body handling does not break the existing JSON parser", async () => {
  const webhookUrl = await createTestServer();
  const baseUrl = webhookUrl.replace("/api/whatsapp/webhook", "");
  const response = await fetch(`${baseUrl}/api/existing-json-route`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ preserved: true }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { body: { preserved: true } });
});
