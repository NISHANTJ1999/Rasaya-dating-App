import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { storage } from "./config";

export async function uploadProfilePhoto(
  userId: string,
  uri: string,
  photoIndex: number,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Compress image before upload
  const compressed = await manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.8, format: SaveFormat.JPEG }
  );

  // Fetch as blob
  const response = await fetch(compressed.uri);
  const blob = await response.blob();

  // Upload to Firebase Storage
  const storageRef = ref(storage, `users/${userId}/photos/photo_${photoIndex}.jpg`);
  const uploadTask = uploadBytesResumable(storageRef, blob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

export async function deleteProfilePhoto(
  userId: string,
  photoIndex: number
): Promise<void> {
  const storageRef = ref(storage, `users/${userId}/photos/photo_${photoIndex}.jpg`);
  await deleteObject(storageRef);
}

export async function uploadChatImage(
  matchId: string,
  senderId: string,
  uri: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const compressed = await manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.7, format: SaveFormat.JPEG }
  );

  const response = await fetch(compressed.uri);
  const blob = await response.blob();

  const filename = `${Date.now()}_${senderId}.jpg`;
  const storageRef = ref(storage, `chats/${matchId}/${filename}`);
  const uploadTask = uploadBytesResumable(storageRef, blob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
