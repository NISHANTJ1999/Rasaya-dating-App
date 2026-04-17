import { create } from "zustand";
import type { UserProfile } from "../types/user";
import type { LikeTarget } from "../types/match";
import { MOCK_PROFILES } from "../mock-data";
import {
  getDiscoveryProfiles,
  createSwipe,
  checkMutualLike,
  createMatch,
} from "../firebase/firestore";
import { useAuthStore } from "./auth-store";

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
        return;
      } catch (error) {
        console.error("Failed to load profiles from Firebase:", error);
      }
    }

    // Fallback to mock data
    set({ profiles: MOCK_PROFILES, currentIndex: 0, isLoading: false });
  },

  swipeRight: async (target) => {
    const { currentIndex, profiles, swipedIds } = get();
    const profile = profiles[currentIndex];
    if (!profile) return;

    const newSwiped = new Set(swipedIds);
    newSwiped.add(profile.uid);
    set({ currentIndex: currentIndex + 1, swipedIds: newSwiped });

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
