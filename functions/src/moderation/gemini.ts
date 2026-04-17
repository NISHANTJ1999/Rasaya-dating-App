/**
 * Thin wrapper around Google Gemini 2.0 Flash for moderation tasks.
 *
 * Why Gemini Flash:
 *  - Free tier: 15 RPM, 1M tokens/day (more than enough for early-stage)
 *  - After free tier: ~$0.075 / 1M input tokens — cheapest capable vision model
 *  - Native multimodal (handles photo URLs + text in one call)
 *
 * API key is loaded from the `GEMINI_API_KEY` secret configured via:
 *   firebase functions:secrets:set GEMINI_API_KEY
 */
import { GoogleGenAI } from "@google/genai";
import { defineSecret } from "firebase-functions/params";

export const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!cached) {
    cached = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
  }
  return cached;
}

/**
 * Ask Gemini to return strict JSON. Strips ```json fences if present.
 */
export async function askJSON<T>(opts: {
  model?: string;
  systemInstruction?: string;
  parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;
}): Promise<T> {
  const model = opts.model ?? "gemini-2.0-flash";
  const response = await client().models.generateContent({
    model,
    contents: [{ role: "user", parts: opts.parts }],
    config: {
      systemInstruction: opts.systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const raw = response.text ?? "";
  const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(cleaned) as T;
}

/**
 * Fetch a remote image (Firebase Storage download URL) and return base64 +
 * mime. Gemini accepts images up to ~20MB this way.
 */
export async function fetchImageAsBase64(
  url: string
): Promise<{ mimeType: string; data: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mimeType = res.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > 18 * 1024 * 1024) return null; // safety cap
    return { mimeType, data: buf.toString("base64") };
  } catch {
    return null;
  }
}
