import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  type WithSpringConfig,
} from "react-native-reanimated";

export const SPRING = {
  bouncy: { damping: 8, stiffness: 150 } satisfies WithSpringConfig,
  smooth: { damping: 15, stiffness: 200 } satisfies WithSpringConfig,
  snappy: { damping: 12, stiffness: 250 } satisfies WithSpringConfig,
} as const;

export function useScaleOnPress(scaleTo = 0.95) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(scaleTo, SPRING.snappy);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, SPRING.snappy);
  };

  return { animatedStyle, onPressIn, onPressOut };
}
