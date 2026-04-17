import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = current / total;

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%` as unknown as number, { duration: 300 }),
  }));

  return (
    <View className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
      <Animated.View
        className="h-full bg-primary-500 rounded-full"
        style={[{ width: `${progress * 100}%` }]}
      />
    </View>
  );
}
