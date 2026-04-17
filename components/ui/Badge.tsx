import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withDelay,
} from "react-native-reanimated";

interface BadgeProps {
  type: "verified" | "iq";
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { container: 18, icon: 10 },
  md: { container: 22, icon: 13 },
  lg: { container: 28, icon: 16 },
} as const;

export function Badge({ type, size = "md" }: BadgeProps) {
  const scale = useSharedValue(0);
  const { container, icon } = SIZES[size];

  useEffect(() => {
    scale.value = withDelay(
      200,
      withSequence(
        withSpring(1.15, { damping: 6, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 180 })
      )
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isVerified = type === "verified";

  return (
    <Animated.View
      style={[
        {
          width: container,
          height: container,
          borderRadius: container / 2,
          backgroundColor: isVerified ? "#3B82F6" : "#7C3AED",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: isVerified ? "#3B82F6" : "#7C3AED",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 4,
        },
        animatedStyle,
      ]}
    >
      <Ionicons
        name={isVerified ? "checkmark" : "bulb"}
        size={icon}
        color="#FFFFFF"
      />
    </Animated.View>
  );
}
