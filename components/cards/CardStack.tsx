import { View, Text, Dimensions } from "react-native";
import { useCallback } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
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
  onReport?: (profile: UserProfile) => void;
}

export function CardStack({
  profiles,
  currentIndex,
  onSwipeRight,
  onSwipeLeft,
  onSuperLike,
  onReport,
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
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        cardRotation.value = withTiming(30, { duration: 300 });
        runOnJS(handleSwipeComplete)("right");
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        cardRotation.value = withTiming(-30, { duration: 300 });
        runOnJS(handleSwipeComplete)("left");
      } else if (event.translationY < -150) {
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
      [0.5, 1],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }], opacity };
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

  const superLikeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, -120],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  if (!currentProfile) return null;

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
          <ProfileCard profile={nextProfile} onReport={onReport} />
        </Animated.View>
      )}

      {/* Front Card with gesture */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            { width: SCREEN_WIDTH - 32, height: "100%" },
            frontCardStyle,
          ]}
        >
          <ProfileCard profile={currentProfile} onReport={onReport} />

          {/* LIKE Overlay — gradient glass badge */}
          <Animated.View
            style={[likeOpacity]}
            className="absolute top-8 left-6 -rotate-12 rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={["rgba(34,197,94,0.9)", "rgba(34,197,94,0.7)"]}
              className="flex-row items-center px-5 py-2.5 gap-2"
            >
              <Ionicons name="heart" size={22} color="#FFFFFF" />
              <Text className="text-2xl font-bold text-white">LIKE</Text>
            </LinearGradient>
          </Animated.View>

          {/* NOPE Overlay — gradient glass badge */}
          <Animated.View
            style={[nopeOpacity]}
            className="absolute top-8 right-6 rotate-12 rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={["rgba(239,68,68,0.9)", "rgba(239,68,68,0.7)"]}
              className="flex-row items-center px-5 py-2.5 gap-2"
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
              <Text className="text-2xl font-bold text-white">NOPE</Text>
            </LinearGradient>
          </Animated.View>

          {/* SUPER LIKE Overlay */}
          <Animated.View
            style={[superLikeOpacity]}
            className="absolute bottom-20 self-center rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={["rgba(59,130,246,0.9)", "rgba(124,58,237,0.9)"]}
              className="flex-row items-center px-5 py-2.5 gap-2"
            >
              <Ionicons name="star" size={20} color="#FFFFFF" />
              <Text className="text-xl font-bold text-white">SUPER LIKE</Text>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
