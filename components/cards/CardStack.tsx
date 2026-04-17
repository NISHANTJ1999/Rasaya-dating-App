import { View, Dimensions } from "react-native";
import { useCallback } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { ProfileCard } from "./ProfileCard";
import type { UserProfile } from "@/lib/types/user";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface CardStackProps {
  profiles: UserProfile[];
  currentIndex: number;
  onSwipeRight: (profile: UserProfile) => void;
  onSwipeLeft: (profile: UserProfile) => void;
  onSuperLike: (profile: UserProfile) => void;
}

export function CardStack({
  profiles,
  currentIndex,
  onSwipeRight,
  onSwipeLeft,
  onSuperLike,
}: CardStackProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotation = useSharedValue(0);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  const handleSwipeComplete = useCallback(
    (direction: "left" | "right" | "up") => {
      if (!currentProfile) return;
      if (direction === "right") onSwipeRight(currentProfile);
      else if (direction === "left") onSwipeLeft(currentProfile);
      else onSuperLike(currentProfile);
    },
    [currentProfile, onSwipeRight, onSwipeLeft, onSuperLike]
  );

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
    cardRotation.value = withSpring(0, { damping: 15, stiffness: 200 });
  }, [translateX, translateY, cardRotation]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      cardRotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right - LIKE
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        cardRotation.value = withTiming(30, { duration: 300 });
        runOnJS(handleSwipeComplete)("right");
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left - NOPE
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        cardRotation.value = withTiming(-30, { duration: 300 });
        runOnJS(handleSwipeComplete)("left");
      } else if (event.translationY < -150) {
        // Swipe up - SUPER LIKE
        translateY.value = withTiming(-SCREEN_WIDTH * 2, { duration: 300 });
        runOnJS(handleSwipeComplete)("up");
      } else {
        runOnJS(resetPosition)();
      }
    });

  const frontCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${cardRotation.value}deg` },
    ],
  }));

  const backCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.3],
      [0.92, 1],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.3],
      [0.6, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.2],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -SCREEN_WIDTH * 0.2],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  if (!currentProfile) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center">
      {/* Back Card */}
      {nextProfile && (
        <Animated.View
          style={[
            {
              position: "absolute",
              width: SCREEN_WIDTH - 32,
              height: "100%",
            },
            backCardStyle,
          ]}
        >
          <ProfileCard profile={nextProfile} />
        </Animated.View>
      )}

      {/* Front Card with gesture */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              width: SCREEN_WIDTH - 32,
              height: "100%",
            },
            frontCardStyle,
          ]}
        >
          <ProfileCard profile={currentProfile} />

          {/* LIKE Overlay */}
          <Animated.View
            style={[likeOpacity]}
            className="absolute top-6 left-6 px-4 py-2 border-4 border-like rounded-xl -rotate-12"
          >
            <Animated.Text className="text-3xl font-bold text-like">
              LIKE
            </Animated.Text>
          </Animated.View>

          {/* NOPE Overlay */}
          <Animated.View
            style={[nopeOpacity]}
            className="absolute top-6 right-6 px-4 py-2 border-4 border-nope rounded-xl rotate-12"
          >
            <Animated.Text className="text-3xl font-bold text-nope">
              NOPE
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
