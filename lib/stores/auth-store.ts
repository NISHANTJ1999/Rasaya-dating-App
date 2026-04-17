import { create } from "zustand";
import type { UserProfile, City, Gender, GenderPreference } from "../types/user";
import { onAuthStateChanged, signOut as firebaseSignOut } from "../firebase/auth";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
} from "../firebase/firestore";
import { uploadProfilePhoto } from "../firebase/storage";
import type { User as FirebaseUser } from "firebase/auth";

interface OnboardingData {
  firstName: string;
  dateOfBirth: string;
  gender: Gender | null;
  photos: { id: string; uri: string; order: number }[];
  city: City | null;
  prompts: { promptId: string; promptText: string; answer: string }[];
  interests: string[];
  genderPreference: GenderPreference | null;
  ageMin: number;
  ageMax: number;
  maxDistance: number;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  firebaseUser: FirebaseUser | null;
  user: UserProfile | null;
  onboardingData: OnboardingData;
  useFirebase: boolean;

  initAuth: () => () => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  updateOnboarding: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => Promise<void>;
  completeVerification: (selfieUris: string[]) => Promise<void>;
  logout: () => Promise<void>;
}

const initialOnboarding: OnboardingData = {
  firstName: "",
  dateOfBirth: "",
  gender: null,
  photos: [],
  city: null,
  prompts: [],
  interests: [],
  genderPreference: null,
  ageMin: 18,
  ageMax: 35,
  maxDistance: 25,
};

// Check if Firebase is configured
const isFirebaseConfigured = !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  firebaseUser: null,
  user: null,
  onboardingData: initialOnboarding,
  useFirebase: isFirebaseConfigured,

  initAuth: () => {
    if (!isFirebaseConfigured) {
      // Mock mode - no Firebase configured
      set({ isLoading: false });
      return () => {};
    }

    // Real Firebase auth listener
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        set({ firebaseUser, isAuthenticated: true });

        // Fetch user profile from Firestore
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          set({ user: profile, isLoading: false });
        } catch {
          set({ user: null, isLoading: false });
        }
      } else {
        set({
          firebaseUser: null,
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    });

    return unsubscribe;
  },

  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ isLoading: value }),
  setUser: (user) => set({ user }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),

  updateOnboarding: (data) =>
    set((state) => ({
      onboardingData: { ...state.onboardingData, ...data },
    })),

  completeOnboarding: async () => {
    const { onboardingData, firebaseUser, useFirebase } = get();
    const now = new Date().toISOString();
    const dob = new Date(onboardingData.dateOfBirth);
    const age = Math.floor(
      (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    const uid = firebaseUser?.uid ?? "currentUser";
    let photos = onboardingData.photos;

    // Upload photos to Firebase Storage if Firebase is configured
    if (useFirebase && firebaseUser) {
      const uploadedPhotos = [];
      for (const photo of onboardingData.photos) {
        try {
          const downloadUrl = await uploadProfilePhoto(
            firebaseUser.uid,
            photo.uri,
            photo.order
          );
          uploadedPhotos.push({
            ...photo,
            uri: downloadUrl,
          });
        } catch {
          // Keep local URI as fallback
          uploadedPhotos.push(photo);
        }
      }
      photos = uploadedPhotos;
    }

    const user: UserProfile = {
      uid,
      firstName: onboardingData.firstName,
      dateOfBirth: onboardingData.dateOfBirth,
      age,
      gender: onboardingData.gender!,
      city: onboardingData.city!,
      photos,
      prompts: onboardingData.prompts,
      interests: onboardingData.interests,
      preferences: {
        ageMin: onboardingData.ageMin,
        ageMax: onboardingData.ageMax,
        maxDistance: onboardingData.maxDistance,
        cities: [onboardingData.city!],
        genderPreference: onboardingData.genderPreference!,
      },
      isVerified: false,
      isActive: true,
      onboardingComplete: true,
      onboardingStep: 8,
      lastActive: now,
      createdAt: now,
    };

    // Write to Firestore if configured
    if (useFirebase && firebaseUser) {
      try {
        const { uid: _uid, ...profileData } = user;
        await createUserProfile(firebaseUser.uid, profileData);
      } catch (error) {
        console.error("Failed to save profile to Firestore:", error);
      }
    }

    set({ user, isAuthenticated: true });
  },

  completeVerification: async (selfieUris: string[]) => {
    const { user, useFirebase, firebaseUser } = get();
    if (!user) return;

    // Upload verification selfies and mark as verified in Firestore
    if (useFirebase && firebaseUser) {
      try {
        const { uploadVerificationSelfies, updateVerificationStatus } =
          await import("../firebase/firestore");
        await uploadVerificationSelfies(firebaseUser.uid, selfieUris);
        await updateVerificationStatus(firebaseUser.uid, true);
      } catch (error) {
        console.error("Failed to save verification to Firestore:", error);
      }
    }

    // Update local state
    set({ user: { ...user, isVerified: true } });
  },

  logout: async () => {
    const { useFirebase } = get();
    if (useFirebase) {
      try {
        await firebaseSignOut();
      } catch {
        // Continue with local logout even if Firebase fails
      }
    }
    set({
      isAuthenticated: false,
      firebaseUser: null,
      user: null,
      onboardingData: initialOnboarding,
    });
  },
}));
