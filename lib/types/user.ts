export type City = "pune" | "mumbai" | "bangalore" | "delhi" | "hyderabad";
export type Gender = "man" | "woman" | "nonbinary";
export type GenderPreference = "men" | "women" | "everyone";
export type AuthProvider = "phone" | "google" | "apple";

export interface PhotoItem {
  id: string;
  uri: string;
  order: number;
}

export interface PromptAnswer {
  promptId: string;
  promptText: string;
  answer: string;
}

export interface UserPreferences {
  ageMin: number;
  ageMax: number;
  maxDistance: number;
  cities: City[];
  genderPreference: GenderPreference;
}

export interface UserProfile {
  uid: string;
  firstName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  city: City;
  photos: PhotoItem[];
  prompts: PromptAnswer[];
  interests: string[];
  bio?: string;
  preferences: UserPreferences;
  isVerified: boolean;
  iqVerified?: boolean;
  iqCompletedAt?: string;
  iqAttemptedAt?: string;
  isActive: boolean;
  onboardingComplete: boolean;
  onboardingStep: number;
  lastActive: string;
  createdAt: string;
}
