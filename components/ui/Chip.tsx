import { Pressable, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated from "react-native-reanimated";
import { useScaleOnPress } from "@/lib/animations";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: "sm" | "md";
}

export function Chip({ label, selected = false, onPress, size = "md" }: ChipProps) {
  const { animatedStyle, onPressIn, onPressOut } = useScaleOnPress(0.93);

  const sizeClasses = {
    sm: "px-3 py-1",
    md: "px-4 py-2",
  };

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  if (selected) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          className="rounded-chip overflow-hidden"
          style={{
            shadowColor: "#FF6B35",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <LinearGradient
            colors={["#FF6B35", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className={sizeClasses[size]}
          >
            <Text className={`${textSize[size]} font-medium text-white`}>{label}</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        className={`rounded-chip ${sizeClasses[size]} bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700`}
      >
        <Text className={`${textSize[size]} font-medium text-neutral-700 dark:text-neutral-300`}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
