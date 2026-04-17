import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface AnimatedGradientProps {
  colors: string[];
  speed?: number;
  style?: object;
  children?: React.ReactNode;
}

export function AnimatedGradient({
  colors,
  speed = 4000,
  style,
  children,
}: AnimatedGradientProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: speed, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress, speed]);

  const animatedProps = useAnimatedProps(() => {
    const p = progress.value;
    return {
      start: { x: p * 0.3, y: 0 },
      end: { x: 1 - p * 0.3, y: 1 },
    };
  });

  return (
    <AnimatedLinearGradient
      colors={colors}
      animatedProps={animatedProps}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </AnimatedLinearGradient>
  );
}
