/**
 * AI scam detection on every new message.
 *
 * Two-pass design for cost control:
 *  1. Cheap keyword prefilter (free, instant). 95% of clean messages stop here.
 *  2. Only flagged messages go to Gemini for proper classification.
 *
 * Each flagged message bumps the sender's `moderation.scamScore`. When it
 * crosses a threshold, the auto-ban trigger kicks in (see reviewReports.ts).
 */
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import { GEMINI_API_KEY, askJSON } from "./gemini";

// Classic romance-scam / spam / harassment signals. Prefilter only.
const SUSPICIOUS_PATTERNS = [
  /\b(whats ?app|telegram|signal|wechat|viber)\b/i,
  /\b(bitcoin|btc|crypto|usdt|ethereum|investment|trading|forex)\b/i,
  /\b(western union|moneygram|gift ?card|google ?play ?card)\b/i,
  /\b(send me|transfer|loan|borrow|urgent|emergency)\s+(money|cash|\$|₹|rs\.?|inr)\b/i,
  /\b(military|deployment|widow|inheritance|oil ?rig)\b/i,
  /https?:\/\/(?!rasaya\.app)/i, // external links
];

interface ScamVerdict {
  classification: "safe" | "suspicious" | "scam" | "harassment";
  confidence: number;
  reason: string;
}

export const scanMessageOnCreate = onDocumentCreated(
  {
    document: "matches/{matchId}/messages/{messageId}",
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const msg = snap.data();
    const text: string = msg.text ?? "";
    const senderId: string = msg.senderId;
    if (!text || !senderId || text.length < 3) return;

    const triggered = SUSPICIOUS_PATTERNS.some((rx) => rx.test(text));
    if (!triggered) return; // Free path — clean message

    let verdict: ScamVerdict;
    try {
      verdict = await askJSON<ScamVerdict>({
        systemInstruction:
          "You classify dating-app messages for trust & safety. Output JSON only.",
        parts: [
          {
            text: `Classify this message from one user to another on a dating app.
Return JSON with:
- classification: "safe" | "suspicious" | "scam" | "harassment"
- confidence: 0-1
- reason: max 120 chars, explain the signal

Romance scams ask for money, push to WhatsApp/Telegram quickly, mention crypto/investment, or claim emergencies. Be strict but not paranoid — asking to meet in person is fine.

Message: """${text.slice(0, 800)}"""`,
          },
        ],
      });
    } catch (error) {
      logger.error("scanMessage: Gemini failed", { error });
      return;
    }

    if (verdict.classification === "safe") return;

    const db = admin.firestore();
    const weight =
      verdict.classification === "scam"
        ? 3
        : verdict.classification === "harassment"
          ? 2
          : 1;

    // Record the flagged message
    await db.collection("flaggedMessages").add({
      matchId: event.params.matchId,
      messageId: event.params.messageId,
      senderId,
      text,
      verdict,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Increment the sender's scam score
    await db.doc(`moderation/${senderId}`).set(
      {
        scamScore: admin.firestore.FieldValue.increment(weight),
        lastFlaggedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    logger.info("scanMessage flagged", {
      senderId,
      classification: verdict.classification,
      weight,
    });
  }
);
