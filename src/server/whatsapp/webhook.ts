import { Router, type Request, type Response } from "express";
import { isWhatsAppBotEnabled } from "./config";
import { verifyWebhookSignature, verifyWebhookToken } from "./signature";
import {
  extractIncomingMessages,
  isValidWebhookEnvelope,
  type IncomingWhatsAppMessage,
} from "./validation";

export interface WhatsAppWebhookDependencies {
  verifyToken?: string;
  appSecret?: string;
  recordMessage: (message: IncomingWhatsAppMessage) => Promise<boolean>;
}

export function createWhatsAppWebhookRouter(dependencies: WhatsAppWebhookDependencies): Router {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode !== "subscribe" || typeof challenge !== "string" || challenge.length === 0) {
      return res.status(400).send("Invalid verification request");
    }
    if (!verifyWebhookToken(token, dependencies.verifyToken)) {
      return res.status(403).send("Verification failed");
    }
    return res.status(200).type("text/plain").send(challenge);
  });

  router.post("/", async (req: Request, res: Response) => {
    if (!dependencies.appSecret) {
      return res.status(503).json({ error: "Webhook is not configured" });
    }
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({ error: "Invalid webhook body" });
    }
    if (!verifyWebhookSignature(req.body, req.header("x-hub-signature-256"), dependencies.appSecret)) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "Malformed webhook payload" });
    }
    if (!isValidWebhookEnvelope(payload)) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const messages = extractIncomingMessages(payload);
    try {
      for (const message of messages) {
        await dependencies.recordMessage(message);
      }
    } catch {
      // A retry is safer than acknowledging a message whose durable provider ID
      // could not be recorded. No payload, message text, or secret is logged.
      return res.status(503).json({ error: "Webhook storage unavailable" });
    }

    // Phase 2A intentionally has no outgoing client or response controller.
    // Reading the centralized flag here documents the gate without enabling any
    // behavior in either state.
    void isWhatsAppBotEnabled();
    return res.status(200).json({ received: true });
  });

  return router;
}
