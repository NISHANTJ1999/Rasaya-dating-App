/**
 * AI-powered auto-ban. Triggered on every new user report.
 *
 * Policy:
 *  - Count the user's total unique reporters.
 *  - If >=3 unique reporters OR scamScore >= 8 OR photos failed verification,
 *    ask Gemini to review the evidence and recommend an action.
 *  - Gemini's verdict is logged, then auto-applied for high-confidence bans.
 *    Anything below high-confidence is shadow-banned (still flagged for human
 *    review in the `moderation/{uid}` doc).
 */
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import { GEMINI_API_KEY, askJSON } from "./gemini";

interface BanVerdict {
  action: "ignore" | "warn" | "shadow_ban" | "permanent_ban";
  confidence: number;
  reasoning: string;
  primary_issue:
    | "scam"
    | "fake_profile"
    | "harassment"
    | "inappropriate"
    | "underage"
    | "none";
}

export const reviewReportsOnCreate = onDocumentCreated(
  {
    document: "reports/{reportId}",
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (event) => {
    const report = event.data?.data();
    if (!report) return;
    const reportedUserId: string = report.reportedUserId;
    if (!reportedUserId) return;

    const db = admin.firestore();

    // Gather signals
    const [allReportsSnap, modDoc, flaggedMsgsSnap, userDoc] =
      await Promise.all([
        db
          .collection("reports")
          .where("reportedUserId", "==", reportedUserId)
          .get(),
        db.doc(`moderation/${reportedUserId}`).get(),
        db
          .collection("flaggedMessages")
          .where("senderId", "==", reportedUserId)
          .limit(10)
          .get(),
        db.doc(`users/${reportedUserId}`).get(),
      ]);

    const uniqueReporters = new Set(
      allReportsSnap.docs.map((d) => d.data().reporterId as string)
    );
    const reportCount = uniqueReporters.size;
    const modData = modDoc.data() ?? {};
    const scamScore: number = modData.scamScore ?? 0;
    const photoPassed: boolean = modData.photoPassed ?? true;

    // Threshold — save Gemini calls unless there's meaningful signal
    const needsReview = reportCount >= 3 || scamScore >= 8 || !photoPassed;
    if (!needsReview) {
      await db.doc(`moderation/${reportedUserId}`).set(
        { reportCount, lastReportAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      return;
    }

    // Build evidence bundle for the LLM
    const reportReasons = allReportsSnap.docs.map((d) => {
      const r = d.data();
      return {
        reason: r.reason as string,
        description: (r.description ?? "") as string,
      };
    });
    const sampleMessages = flaggedMsgsSnap.docs.map((d) => {
      const m = d.data();
      return {
        text: (m.text as string).slice(0, 200),
        classification: m.verdict?.classification,
      };
    });

    let verdict: BanVerdict;
    try {
      verdict = await askJSON<BanVerdict>({
        systemInstruction:
          "You are a strict dating-app trust & safety reviewer. You output JSON only.",
        parts: [
          {
            text: `Review the following evidence about a user and recommend an action.

User ID: ${reportedUserId}
Unique reporters: ${reportCount}
Scam score (from AI-flagged messages): ${scamScore}
Photo verification passed: ${photoPassed}
Photo verdict: ${JSON.stringify(modData.photoVerdict ?? null)}

Reports (reason + description):
${JSON.stringify(reportReasons, null, 2)}

Sample of AI-flagged messages this user sent:
${JSON.stringify(sampleMessages, null, 2)}

Return JSON with:
- action: "ignore" | "warn" | "shadow_ban" | "permanent_ban"
- confidence: 0-1
- reasoning: max 250 chars
- primary_issue: "scam" | "fake_profile" | "harassment" | "inappropriate" | "underage" | "none"

Guidelines:
- permanent_ban only for clear scams, underage, or coordinated harassment with confidence >= 0.85
- shadow_ban for suspicious but ambiguous cases (user stays visible to themselves, hidden from others)
- warn for borderline — first-time minor issues
- ignore for false-positive report patterns`,
          },
        ],
      });
    } catch (error) {
      logger.error("reviewReports: Gemini failed", { reportedUserId, error });
      return;
    }

    // Apply the verdict
    const update: Record<string, unknown> = {
      reportCount,
      aiVerdict: verdict,
      aiReviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    let userUpdate: Record<string, unknown> | null = null;
    if (verdict.action === "permanent_ban" && verdict.confidence >= 0.85) {
      userUpdate = {
        isActive: false,
        bannedAt: admin.firestore.FieldValue.serverTimestamp(),
        banReason: verdict.reasoning,
      };
      update.bannedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (
      verdict.action === "shadow_ban" ||
      (verdict.action === "permanent_ban" && verdict.confidence < 0.85)
    ) {
      userUpdate = { isActive: false }; // Hidden from discovery; no ban screen
      update.shadowBannedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await db.doc(`moderation/${reportedUserId}`).set(update, { merge: true });
    if (userUpdate && userDoc.exists) {
      await db.doc(`users/${reportedUserId}`).update(userUpdate);
    }

    logger.info("reviewReports decision", {
      reportedUserId,
      action: verdict.action,
      confidence: verdict.confidence,
      reportCount,
      scamScore,
    });
  }
);
