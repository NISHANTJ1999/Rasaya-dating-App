/**
 * AI photo verification. Triggered automatically when a user sets
 * `verificationSubmittedAt` on their user doc (i.e. finishes the mandatory
 * selfie step in onboarding).
 *
 * Flow:
 *  1. Load profile photos + verification selfies.
 *  2. Ask Gemini to check same-person, real-human, not-AI-generated,
 *     not-stock, not-celebrity.
 *  3. Write verdict to `moderation/{uid}` and flip `isVerified` / `isActive`.
 *
 * Cost: ~6 images × ~300 input tokens + 200 output = ~2000 tokens per check.
 * At Gemini 2.0 Flash paid rates that's ~$0.00015 per signup.
 */
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import { GEMINI_API_KEY, askJSON, fetchImageAsBase64 } from "./gemini";

interface PhotoVerdict {
  sameperson: boolean;
  real_human: boolean;
  ai_generated: boolean;
  stock_or_celebrity: boolean;
  confidence: number; // 0-1
  reason: string;
}

export const verifyPhotosOnSubmit = onDocumentUpdated(
  {
    document: "users/{uid}",
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: 120,
    memory: "512MiB",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // Only run when verification was just submitted (transition)
    const justSubmitted =
      !before.verificationSubmittedAt && !!after.verificationSubmittedAt;
    if (!justSubmitted) return;

    const uid = event.params.uid;
    const profileUrls: string[] = (after.photos ?? [])
      .map((p: { uri: string }) => p.uri)
      .filter(Boolean);
    const selfieUrls: string[] = after.verificationSelfies ?? [];

    if (profileUrls.length === 0 || selfieUrls.length === 0) {
      logger.warn("verifyPhotos: missing photos or selfies", { uid });
      return;
    }

    // Load images (cap at 4 profile + 3 selfies to keep cost bounded)
    const imageInputs = await Promise.all(
      [...profileUrls.slice(0, 4), ...selfieUrls.slice(0, 3)].map(
        fetchImageAsBase64
      )
    );
    const images = imageInputs.filter(
      (x): x is NonNullable<typeof x> => x !== null
    );

    if (images.length < 2) {
      logger.warn("verifyPhotos: could not fetch enough images", { uid });
      return;
    }

    let verdict: PhotoVerdict;
    try {
      verdict = await askJSON<PhotoVerdict>({
        systemInstruction:
          "You are a strict but fair trust-and-safety reviewer for a dating app. You only output JSON.",
        parts: [
          {
            text: `A user submitted profile photos followed by live verification selfies.
Review all images and return JSON with these fields:
- sameperson (boolean): Do profile photos and selfies show the same real person?
- real_human (boolean): Are these photos of a real living human (not a drawing/cartoon/pet/object)?
- ai_generated (boolean): Do any images look AI-generated (check for tell-tale artifacts)?
- stock_or_celebrity (boolean): Do any images look like stock photos or famous celebrities?
- confidence (0-1): Your confidence in the overall verdict.
- reason (string, max 200 chars): Brief explanation.

The first ${Math.min(profileUrls.length, 4)} images are profile photos. The rest are live selfies.`,
          },
          ...images.map((img) => ({ inlineData: img })),
        ],
      });
    } catch (error) {
      logger.error("verifyPhotos: Gemini call failed", { uid, error });
      return;
    }

    const db = admin.firestore();
    const passed =
      verdict.sameperson &&
      verdict.real_human &&
      !verdict.ai_generated &&
      !verdict.stock_or_celebrity &&
      verdict.confidence >= 0.6;

    await db.doc(`moderation/${uid}`).set(
      {
        photoVerdict: verdict,
        photoCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
        photoPassed: passed,
      },
      { merge: true }
    );

    await db.doc(`users/${uid}`).update({
      isVerified: passed,
      // Do not deactivate on first failure — just leave unverified so they
      // can't enter discovery. Human review can re-verify.
      ...(passed ? {} : { verificationFailureReason: verdict.reason }),
    });

    logger.info("verifyPhotos done", { uid, passed, confidence: verdict.confidence });
  }
);
