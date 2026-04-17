import { create } from "zustand";
import { Image } from "expo-image";
import type { UserProfile } from "../types/user";
import type { LikeTarget } from "../types/match";
import { MOCK_PROFILES } from "../mock-data";
import {
  getDiscoveryProfiles,
  createSwipe,
  checkMutualLike,
  createMatch,
  reportUser,
  blockUser,
} from "../firebase/firestore";
import { useAuthStore } from "./auth-store";

/** Warm the image cache for the next few profiles so swiping feels instant. */
function prefetchUpcoming(profiles: UserProfile[], fromIndex: number) {
  const uris = profiles
    .slice(fromIndex, fromIndex + 3)
    .flatMap((p) => p.photos.map((ph) => ph.uri))
    .filter(Boolean);
  if (uris.length) Image.prefetch(uris, "memory-disk");
}

interface DiscoveryState {
  profiles: UserProfile[];
  currentIndex: number;
  swipedIds: Set<string>;
  isLoading: boolean;
  showMatchModal: boolean;
  matchedProfile: UserProfile | null;

  loadProfiles: () => Promise<void>;
  swipeRight: (target?: LikeTarget) => Promise<void>;
  swipeLeft: () => void;
  superLike: (target?: LikeTarget) => Promise<void>;
  reportAndBlock: (profileId: string, reason: string, description?: string) => Promise<void>;
  getCurrentProfile: () => UserProfile | null;
  resetDiscovery: () => void;
  dismissMatchModal: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  profiles: [],
  currentIndex: 0,
  swipedIds: new Set(),
  isLoading: false,
  showMatchModal: false,
  matchedProfile: null,

  loadProfiles: async () => {
    set({ isLoading: true });

    const { useFirebase, firebaseUser, user } = useAuthStore.getState();

    if (useFirebase && firebaseUser && user) {
      try {
        const profiles = await getDiscoveryProfiles(firebaseUser.uid, {
          city: user.city,
          gender: user.preferences.genderPreference,
          ageMin: user.preferences.ageMin,
          ageMax: user.preferences.ageMax,
        });
        set({ profiles, currentIndex: 0, isLoading: false });
        prefetchUpcoming(profiles, 0);
        return;
      } catch (error) {
        console.error("Failed to load profiles from Firebase:", error);
      }
    }

    // Fallback to mock data
    set({ profiles: MOCK_PROFILES, currentIndex: 0, isLoading: false });
    prefetchUpcoming(MOCK_PROFILES, 0);
  },

  swipeRight: async (target) => {
    const { currentIndex, profiles, swipedIds } = get();
    const profile = profiles[currentIndex];
    if (!profile) return;

    const newSwiped = new Set(swipedIds);
    newSwiped.add(profile.uid);
    set({ currentIndex: currentIndex + 1, swipedIds: newSwiped });
    prefetchUpcoming(profiles, currentIndex + 1);

    const { useFirebase, firebaseUser, user } = useAuthStore.getState();

    if (useFirebase && firebaseUser && user) {
      try {
        await createSwipe(firebaseUser.uid, profile.uid, "like", target);

        // Check for mutual like
        const isMutual = await checkMutualLike(firebaseUser.uid, profile.uid);
        if (isMutual) {
          await createMatch(
            firebaseUser.uid,
            profile.uid,
            {
              firstName: user.firstName,
              photoUrl: user.photos[0]?.uri ?? "",
              age: user.age,
            },
            {
              firstName: profile.firstName,
              photoUrl: profile.photos[0]?.uri ?? "",
              age: profile.age,
            },
            target ? { ...target, likerId: firebaseUser.uid } : undefined
          );
          set({ showMatchModal: true, matchedProfile: profile });
        }
      } catch (error) {
        console.error("Failed to record swipe:", error);
      }
    }
  },

  swipeLeft: () => {
    const { currentIndex, profiles, swipedIds } = get();
    const profile = profiles[currentIndex];
    if (!profile) return;

    const newSwiped = new Set(swipedIds);
    newSwiped.add(profile.uid);
    set({ currentIndex: currentIndex + 1, swipedIds: newSwiped });
    prefetchUpcoming(profiles, currentIndex + 1);

    const { useFirebase, firebaseUser } = useAuthStore.getState();
    if (useFirebase && firebaseUser) {
      createSwipe(firebaseUser.uid, profile.uid, "nope").catch(console.error);
    }
  },

  superLike: async (target) => {
    const { currentIndex, profiles, swipedIds } = get();
    const profile = profiles[currentIndex];
    if (!profile) return;

    const newSwiped = new Set(swipedIds);
    newSwiped.add(profile.uid);
    set({ currentIndex: currentIndex + 1, swipedIds: newSwiped });
    prefetchUpcoming(profiles, currentIndex + 1);

    const { useFirebase, firebaseUser, user } = useAuthStore.getState();

    if (useFirebase && firebaseUser && user) {
      try {
        await createSwipe(firebaseUser.uid, profile.uid, "superlike", target);

        const isMutual = await checkMutualLike(firebaseUser.uid, profile.uid);
        if (isMutual) {
          await createMatch(
            firebaseUser.uid,
            profile.uid,
            {
              firstName: user.firstName,
              photoUrl: user.photos[0]?.uri ?? "",
              age: user.age,
            },
            {
              firstName: profile.firstName,
              photoUrl: profile.photos[0]?.uri ?? "",
              age: profile.age,
            },
            target ? { ...target, likerId: firebaseUser.uid } : undefined
          );
          set({ showMatchModal: true, matchedProfile: profile });
        }
      } catch (error) {
        console.error("Failed to record super like:", error);
      }
    }
  },

  reportAndBlock: async (profileId, reason, description) => {
    const { profiles, currentIndex, swipedIds } = get();

    // Remove the profile from the visible deck immediately (optimistic)
    const remaining = profiles.filter((p) => p.uid !== profileId);
    // Keep currentIndex pointing at whatever card is "next" after removal
    const newIndex = Math.min(currentIndex, Math.max(0, remaining.length - 1));
    const newSwiped = new Set(swipedIds);
    newSwiped.add(profileId);
    set({ profiles: remaining, currentIndex: newIndex, swipedIds: newSwiped });
    prefetchUpcoming(remaining, newIndex);

    const { useFirebase, firebaseUser } = useAuthStore.getState();
    if (useFirebase && firebaseUser) {
      try {
        await Promise.all([
          reportUser(firebaseUser.uid, profileId, reason, description),
          blockUser(firebaseUser.uid, profileId),
        ]);
      } catch (error) {
        console.error("Failed to submit report:", error);
      }
    }
  },

  getCurrentProfile: () => {
    const { profiles, currentIndex } = get();
    return profiles[currentIndex] ?? null;
  },

  resetDiscovery: () => {
    set({ currentIndex: 0, swipedIds: new Set() });
  },

  dismissMatchModal: () => {
    set({ showMatchModal: false, matchedProfile: null });
  },
}));
