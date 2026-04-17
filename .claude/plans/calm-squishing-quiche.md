# Mandatory Verification - Implementation Plan

## Context
Currently verification is optional (a button in Profile settings). Users can use the entire app without verifying. The goal is to make selfie verification **mandatory** - no one can access the main app (discover, likes, matches, chat) without completing verification first. This blocks bots and fake profiles.

## Changes (7 files)

### 1. Make verification step 9 of onboarding
- **`app/(onboarding)/_layout.tsx`** - Add `verify` screen to the Stack
- **`app/(onboarding)/preferences.tsx`** - After preferences, redirect to `/(onboarding)/verify` instead of `/(app)/(discover)`
- **`app/(onboarding)/verify.tsx`** (new) - Move verification into onboarding flow with `StepContainer` (step 9/9), progress bar, no back/skip option. On completion, saves `isVerified: true` and uploads selfies to Firebase Storage

### 2. Block unverified users at the navigation guard
- **`app/index.tsx`** - Add a third check: if user exists, onboarding complete, but NOT verified -> redirect to `/(onboarding)/verify`

### 3. Persist verification status
- **`lib/stores/auth-store.ts`** - Add `completeVerification()` method that sets `isVerified: true` on user profile and saves to Firestore
- **`lib/firebase/firestore.ts`** - Add `updateVerificationStatus()` and `uploadVerificationSelfies()` helpers

### 4. Only show verified profiles in discovery
- **`lib/firebase/firestore.ts`** - Add `where("isVerified", "==", true)` to discovery query
- **`lib/stores/discovery-store.ts`** - Already uses `getDiscoveryProfiles`, will pick up the filter automatically

### 5. Remove optional verify from profile (now redundant)
- **`app/(app)/(profile)/index.tsx`** - Change "Verify Profile" action to show "Verified" badge if already verified
- **`app/(app)/(profile)/settings.tsx`** - Same, show verified status instead of action
- **`app/(app)/(profile)/verify.tsx`** - Delete (moved to onboarding)

## Files to modify
1. `app/(onboarding)/_layout.tsx` - Add verify screen
2. `app/(onboarding)/verify.tsx` - New file (mandatory verification step)
3. `app/(onboarding)/preferences.tsx` - Change redirect target
4. `app/index.tsx` - Add verification check
5. `lib/stores/auth-store.ts` - Add completeVerification()
6. `lib/firebase/firestore.ts` - Add verification Firestore helpers + filter discovery
7. `app/(app)/(profile)/index.tsx` - Show verified badge
8. `app/(app)/(profile)/settings.tsx` - Show verified status
9. `app/(app)/(profile)/verify.tsx` - Remove (moved to onboarding)
10. `app/(app)/(profile)/_layout.tsx` - Remove verify route

## Verification
- Run `npx expo export --platform ios` to confirm build passes
- Flow: auth -> onboarding steps 1-8 -> mandatory verification (step 9) -> app access
- Unverified users are always redirected to verification screen
- Discovery only returns verified profiles
