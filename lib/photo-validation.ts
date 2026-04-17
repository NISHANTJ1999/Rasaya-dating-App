import FaceDetection, { type Face } from "@react-native-ml-kit/face-detection";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export interface PhotoValidationResult {
  valid: boolean;
  reason?: string;
  faceCount: number;
  /** 0-1, how much of the frame the primary face occupies */
  faceCoverage: number;
}

/**
 * Validates that an image is a usable profile photo of the user.
 * Runs fully on-device (Google ML Kit on Android, Apple-backed ML Kit on iOS),
 * so it is fast (<200ms) and works offline.
 *
 * Rules:
 *  - Must contain at least one face (rejects objects, memes, landscapes, pets)
 *  - Primary face must cover >= 8% of the frame (rejects far-away / group shots)
 *  - No more than 3 faces (rejects crowd photos)
 */
export async function validateProfilePhoto(
  uri: string
): Promise<PhotoValidationResult> {
  // Normalize to a small JPEG so detection is fast & dimensions are known.
  const SAMPLE_W = 640;
  const sample = await manipulateAsync(uri, [{ resize: { width: SAMPLE_W } }], {
    compress: 0.7,
    format: SaveFormat.JPEG,
  });
  const sampleH = sample.height ?? SAMPLE_W;
  const frameArea = SAMPLE_W * sampleH;

  let faces: Face[];
  try {
    faces = await FaceDetection.detect(sample.uri, {
      performanceMode: "fast",
      landmarkMode: "none",
      minFaceSize: 0.05,
    });
  } catch {
    // Native module unavailable (e.g. Expo Go). Don't block the user.
    return { valid: true, faceCount: 0, faceCoverage: 0 };
  }

  if (faces.length === 0) {
    return {
      valid: false,
      faceCount: 0,
      faceCoverage: 0,
      reason:
        "We couldn't find a face in this photo. Please use a clear photo of yourself.",
    };
  }

  if (faces.length > 3) {
    return {
      valid: false,
      faceCount: faces.length,
      faceCoverage: 0,
      reason:
        "Too many people in this photo. Use a photo where you're clearly the focus.",
    };
  }

  // Largest face = primary subject
  const primary = faces.reduce((a, b) =>
    a.frame.width * a.frame.height > b.frame.width * b.frame.height ? a : b
  );
  const coverage = (primary.frame.width * primary.frame.height) / frameArea;

  if (coverage < 0.08) {
    return {
      valid: false,
      faceCount: faces.length,
      faceCoverage: coverage,
      reason:
        "Your face is too small in this photo. Move closer or crop tighter.",
    };
  }

  return { valid: true, faceCount: faces.length, faceCoverage: coverage };
}

/**
 * Validates a live selfie captured during verification.
 * Stricter than profile photos: exactly one face, well-framed.
 */
export async function validateSelfie(
  uri: string
): Promise<PhotoValidationResult> {
  const result = await validateProfilePhoto(uri);
  if (!result.valid) return result;

  if (result.faceCount !== 1) {
    return {
      ...result,
      valid: false,
      reason: "Make sure only your face is in the frame.",
    };
  }
  if (result.faceCoverage < 0.15) {
    return {
      ...result,
      valid: false,
      reason: "Move a little closer so your face fills the oval.",
    };
  }
  return result;
}
