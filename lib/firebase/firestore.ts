import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type { UserProfile } from "../types/user";
import type { Match, Message, Swipe, LikeTarget } from "../types/match";

// ---- Collection References ----
const usersCol = collection(db, "users");
const swipesCol = collection(db, "swipes");
const matchesCol = collection(db, "matches");
const reportsCol = collection(db, "reports");
const blocksCol = collection(db, "blocks");

// ---- User Profile ----
export async function createUserProfile(uid: string, data: Omit<UserProfile, "uid">) {
  const docRef = doc(usersCol, uid);
  await setDoc(docRef, {
    uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActive: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(usersCol, uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const docRef = doc(usersCol, uid);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    lastActive: serverTimestamp(),
  });
}

// ---- Verification ----
export async function updateVerificationStatus(uid: string, isVerified: boolean) {
  const docRef = doc(usersCol, uid);
  await updateDoc(docRef, {
    isVerified,
    updatedAt: serverTimestamp(),
  });
}

export async function uploadVerificationSelfies(uid: string, selfieUris: string[]) {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("./config");

  const uploadedUrls: string[] = [];

  for (let i = 0; i < selfieUris.length; i++) {
    const response = await fetch(selfieUris[i]);
    const blob = await response.blob();
    const storageRef = ref(storage, `verification/${uid}/selfie_${i}.jpg`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    const url = await new Promise<string>((resolve, reject) => {
      uploadTask.on("state_changed", null, reject, async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      });
    });
    uploadedUrls.push(url);
  }

  // Store verification selfie URLs on user document
  const docRef = doc(usersCol, uid);
  await updateDoc(docRef, {
    verificationSelfies: uploadedUrls,
    verificationSubmittedAt: serverTimestamp(),
  });
}

// ---- Discovery ----
export async function getDiscoveryProfiles(
  currentUid: string,
  filters: {
    city?: string;
    gender?: string;
    ageMin?: number;
    ageMax?: number;
  },
  pageSize = 20
): Promise<UserProfile[]> {
  const constraints: QueryConstraint[] = [
    where("isActive", "==", true),
    where("onboardingComplete", "==", true),
    where("isVerified", "==", true),
    orderBy("lastActive", "desc"),
    limit(pageSize),
  ];

  if (filters.city) {
    constraints.splice(0, 0, where("city", "==", filters.city));
  }
  if (filters.gender && filters.gender !== "everyone") {
    const genderValue = filters.gender === "men" ? "man" : "woman";
    constraints.splice(0, 0, where("gender", "==", genderValue));
  }
  if (filters.ageMin) {
    constraints.splice(0, 0, where("age", ">=", filters.ageMin));
  }
  if (filters.ageMax) {
    constraints.splice(0, 0, where("age", "<=", filters.ageMax));
  }

  const q = query(usersCol, ...constraints);
  const snap = await getDocs(q);

  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((p) => p.uid !== currentUid);
}

// ---- Swipes ----
export async function createSwipe(
  swiperId: string,
  targetId: string,
  action: "like" | "nope" | "superlike",
  likeTarget?: LikeTarget
) {
  const swipeId = `${swiperId}_${targetId}`;
  const docRef = doc(swipesCol, swipeId);
  await setDoc(docRef, {
    swiperId,
    targetId,
    action,
    likeTarget: likeTarget ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function checkMutualLike(
  userId1: string,
  userId2: string
): Promise<boolean> {
  const reverseId = `${userId2}_${userId1}`;
  const snap = await getDoc(doc(swipesCol, reverseId));
  if (!snap.exists()) return false;
  const data = snap.data();
  return data.action === "like" || data.action === "superlike";
}

export async function getLikesReceived(targetId: string): Promise<Swipe[]> {
  const q = query(
    swipesCol,
    where("targetId", "==", targetId),
    where("action", "in", ["like", "superlike"]),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Swipe);
}

// ---- Matches ----
export async function createMatch(
  userId1: string,
  userId2: string,
  user1Data: { firstName: string; photoUrl: string; age: number },
  user2Data: { firstName: string; photoUrl: string; age: number },
  initialLike?: LikeTarget & { likerId: string }
) {
  const [smaller, larger] = [userId1, userId2].sort();
  const matchId = `${smaller}_${larger}`;
  const docRef = doc(matchesCol, matchId);

  await setDoc(docRef, {
    matchId,
    userIds: [userId1, userId2],
    users: {
      [userId1]: user1Data,
      [userId2]: user2Data,
    },
    initialLike: initialLike ?? null,
    lastMessage: null,
    matchedAt: serverTimestamp(),
    isActive: true,
  });

  return matchId;
}

export function subscribeToMatches(
  userId: string,
  callback: (matches: Match[]) => void
) {
  const q = query(
    matchesCol,
    where("userIds", "array-contains", userId),
    where("isActive", "==", true),
    orderBy("matchedAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const matches = snap.docs.map((d) => d.data() as Match);
    callback(matches);
  });
}

// ---- Messages ----
export async function sendMessage(
  matchId: string,
  senderId: string,
  text: string
) {
  const messagesCol = collection(db, "matches", matchId, "messages");
  const messageRef = doc(messagesCol);

  const message = {
    messageId: messageRef.id,
    senderId,
    text,
    type: "text",
    createdAt: serverTimestamp(),
  };

  await setDoc(messageRef, message);

  // Update lastMessage on match document
  await updateDoc(doc(matchesCol, matchId), {
    lastMessage: {
      text,
      senderId,
      sentAt: serverTimestamp(),
    },
  });
}

export function subscribeToMessages(
  matchId: string,
  callback: (messages: Message[]) => void
) {
  const messagesCol = collection(db, "matches", matchId, "messages");
  const q = query(messagesCol, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
      } as Message;
    });
    callback(messages);
  });
}

// ---- Reports & Blocks ----
export async function reportUser(
  reporterId: string,
  reportedUserId: string,
  reason: string,
  description?: string
) {
  const docRef = doc(reportsCol);
  await setDoc(docRef, {
    reporterId,
    reportedUserId,
    reason,
    description: description ?? null,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function blockUser(blockerId: string, blockedId: string) {
  const blockId = `${blockerId}_${blockedId}`;
  await setDoc(doc(blocksCol, blockId), {
    blockerId,
    blockedId,
    createdAt: serverTimestamp(),
  });
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const blockId = `${blockerId}_${blockedId}`;
  await deleteDoc(doc(blocksCol, blockId));
}

export async function getBlockedUserIds(blockerId: string): Promise<string[]> {
  const q = query(blocksCol, where("blockerId", "==", blockerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().blockedId);
}
