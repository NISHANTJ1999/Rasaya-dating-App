# Rasaya Dating App - Major Overhaul Plan

## Context
The current UI is functional but visually flat and generic — no animations, no depth, no unique identity. The user wants: (1) a stunning, differentiated UI/UX, (2) working face verification, and (3) a new IQ assessment badge feature.

## Strategy
Transform the app's visual identity with **glassmorphism**, **animated gradients**, **micro-interactions**, and a richer **orange-to-violet** color palette. Fix verification by wiring up the existing ML Kit face detection. Add IQ challenge as a new screen + badge system.

---

## Phase 0: Design Foundation (new shared primitives)

### Update design tokens
- **`tailwind.config.js`** — Add violet color scale (#7C3AED range), glow shadows, larger border radii
- **`lib/constants.ts`** — Add violet colors, gradient tuples (`primaryToViolet`, `warmSunset`), spring animation presets

### New shared components
- **`lib/animations.ts`** (NEW) — `useScaleOnPress()`, `useFadeInUp()`, spring config exports
- **`components/ui/GlassCard.tsx`** (NEW) — Glassmorphism container using `expo-blur` BlurView + semi-transparent overlay
- **`components/ui/AnimatedGradient.tsx`** (NEW) — Slowly shifting gradient background using reanimated
- **`components/ui/Badge.tsx`** (NEW) — Unified badge for verification (blue checkmark) + IQ (violet brain icon), with pulse animation on mount

## Phase 1: Welcome & Auth Screens (first impression)

### Welcome screen overhaul — `app/(auth)/welcome.tsx`
- Replace static gradient with `AnimatedGradient` (orange -> violet -> pink)
- Add floating particle effects (6-8 animated circles drifting upward)
- Logo in `GlassCard` with pulsing glow
- Staggered fade-in animations for title, subtitle, city tags, buttons
- City tags as glassmorphism chips
- Primary button with gradient background (orange-to-violet)

### Phone login — `app/(auth)/phone-login.tsx`
- Staggered text entrance animations
- Gradient border glow on input focus
- Gradient "Send Code" button

### OTP screen — `app/(auth)/otp-verify.tsx`
- Staggered box entrance animations
- Scale bounce + haptic on each digit entry
- Success glow animation when all 6 entered

## Phase 2: Discovery / Swipe Screen (core experience)

### Discover header — `app/(app)/(discover)/index.tsx`
- "Rasaya" text with gradient fill (orange-to-violet)
- Pulsing flame icon animation
- Animated empty state (floating heart + orbiting dots)

### ProfileCard redesign — `components/cards/ProfileCard.tsx`
- Elevated shadow for floating feel
- Instagram-style segmented photo progress bar (replaces dots)
- New `Badge` component for verified + IQ badges next to name
- Prompt cards with gradient left accent border + glass background
- Enhanced heart button animation on prompts

### CardStack — `components/cards/CardStack.tsx`
- LIKE/NOPE overlays as gradient glass badges (not plain text)
- SUPER LIKE overlay for upward swipe
- Back card blur that clears as front card moves

### Action buttons — `components/cards/ActionButtons.tsx`
- Gradient fills matching action colors
- Neumorphism-lite shadows
- Ripple/glow effect on press

## Phase 3: Profile & Secondary Screens

### Profile — `app/(app)/(profile)/index.tsx`
- Gradient header background (orange-to-violet) with curved bottom
- Enlarged photo with gradient border ring
- Verification + IQ badges inline with name
- Glassmorphism Quick Action cards
- New "IQ Assessment" action row (violet brain icon)
- Staggered section entrance animations

### Likes — `app/(app)/(likes)/index.tsx`
- Glass overlay on photo cards, show shared interests count
- Verification/IQ badges on cards, staggered grid animation

### Matches — `app/(app)/(matches)/index.tsx`
- Gradient ring around match photos, animated unread badge

### Chat — `app/(app)/(matches)/chat/[matchId].tsx`
- Gradient sent message bubbles, message entrance animations

## Phase 4: Onboarding Polish

### StepContainer — `components/onboarding/StepContainer.tsx`
- Gradient progress bar (orange-to-violet), gradient Continue button

### Preferences — `app/(onboarding)/preferences.tsx`
- Replace +/- spinners with custom dual-thumb range slider (gesture-handler + reanimated)

### Chip component — `components/ui/Chip.tsx`
- `LinearGradient` background when selected, scale bounce on selection

## Phase 5: Fix Face Verification

### Profile verify screen — `app/(app)/(profile)/verify.tsx`
- Import `validateSelfie` from `lib/photo-validation`
- Call it on each capture — reject with error if face not detected
- Replace fake `setTimeout(3000)` with real `completeVerification(photos)` from auth-store
- Add colored face guide oval (green = detected, neutral = no face)
- Error banner when selfie fails

### Onboarding verify — `app/(onboarding)/verify.tsx`
- Add same face guide color feedback (already uses validateSelfie)

## Phase 6: IQ Assessment Feature (new)

### Types — `lib/types/user.ts`
- Add `iqVerified: boolean`, `iqCompletedAt?: string`, `iqAttemptedAt?: string`

### Question pool — `lib/iq-questions.ts` (NEW)
- 6-9 challenging pattern/logic/lateral questions, `getRandomQuestions(3)` picks randomly
- 60 seconds per question

### IQ store — `lib/stores/iq-store.ts` (NEW)
- State: questions, currentIndex, answers, timeRemaining, passed
- Actions: startAssessment, answerQuestion, timeOut, submitResults, canAttempt

### Firebase + Auth store
- `lib/firebase/firestore.ts` — Add `updateIQStatus(uid, passed)`
- `lib/stores/auth-store.ts` — Add `completeIQAssessment(passed)`

### IQ screen — `app/(app)/(profile)/iq-assessment.tsx` (NEW)
- Intro: Glass card, brain icon, rules, "Start Challenge" gradient button
- Questions: Animated countdown timer (green->orange->red), 4 options with animations, slide transitions
- Pass: Confetti particles, badge reveal celebration
- Fail: Explanations for missed questions, retry after 24h

### Layout — `app/(app)/(profile)/_layout.tsx` — Register `iq-assessment` screen
### Mock data — `lib/mock-data.ts` — Add `iqVerified` to mock profiles

## Phase 7: Tab Bar & Modals

### Tab bar — `app/(app)/_layout.tsx`
- Floating rounded tab bar with blur background, gradient active indicator

### Match modal — `components/modals/MatchModal.tsx`
- AnimatedGradient background, confetti particles, glow ring

### Button component — `components/ui/Button.tsx`
- Scale-on-press, new `gradient` variant, shadow, haptics

---

## New Files (7)
| File | Purpose |
|------|---------|
| `lib/animations.ts` | Shared animation hooks & spring configs |
| `components/ui/GlassCard.tsx` | Glassmorphism container |
| `components/ui/AnimatedGradient.tsx` | Animated gradient background |
| `components/ui/Badge.tsx` | Verification + IQ badge |
| `lib/iq-questions.ts` | IQ question pool |
| `lib/stores/iq-store.ts` | IQ assessment state |
| `app/(app)/(profile)/iq-assessment.tsx` | IQ assessment screen |

## Verification
1. Run `npx expo start --web` and visually check Welcome, Discover, Profile screens
2. Test IQ assessment flow end-to-end (start -> answer 3 -> result)
3. Test face verification on profile verify screen
4. Check badges appear on ProfileCard + Profile screen
5. Verify dark mode across modified screens
6. Test on mobile via Expo Go tunnel for camera/haptics
