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

/**
 * 3D press: face translates down onto its colored base.
 * Returns styles for the face and the base layer.
 */
export function use3DPress(depth = 6) {
  const translate = useSharedValue(0);

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translate.value }],
  }));

  const baseStyle = useAnimatedStyle(() => ({
    opacity: 1 - translate.value / (depth * 2),
  }));

  const onPressIn = () => {
    translate.value = withSpring(depth, { damping: 14, stiffness: 400 });
  };

  const onPressOut = () => {
    translate.value = withSpring(0, { damping: 12, stiffness: 300 });
  };

  return { faceStyle, baseStyle, onPressIn, onPressOut, depth };
}
