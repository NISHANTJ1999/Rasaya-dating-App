import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ActionButtonsProps {
  onNope: () => void;
  onLike: () => void;
  onSuperLike: () => void;
}

function AnimatedActionButton({
  icon,
  colors,
  size,
  iconSize,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  colors: readonly [string, string];
  size: number;
  iconSize: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(0.8, { damping: 8 }),
      withSpring(1.15, { damping: 6 }),
      withSpring(1, { damping: 10 })
    );
    glowOpacity.value = withSequence(
      withTiming(0.6, { duration: 150 }),
      withTiming(0, { duration: 300 })
    );
    onPress();
  };

  return (
    <View className="items-center justify-center">
      {/* Glow ring behind button */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size + 16,
            height: size + 16,
            borderRadius: (size + 16) / 2,
            backgroundColor: colors[0],
          },
          glowStyle,
        ]}
      />
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          className="items-center justify-center overflow-hidden"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            shadowColor: colors[0],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={[...colors]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function ActionButtons({ onNope, onLike, onSuperLike }: ActionButtonsProps) {
  return (
    <View className="flex-row items-center justify-center gap-6 py-4">
      <AnimatedActionButton
        icon="close"
        colors={["#EF4444", "#DC2626"]}
        size={64}
        iconSize={30}
        onPress={onNope}
      />
      <AnimatedActionButton
        icon="star"
        colors={["#3B82F6", "#7C3AED"]}
        size={48}
        iconSize={22}
        onPress={onSuperLike}
      />
      <AnimatedActionButton
        icon="heart"
        colors={["#22C55E", "#16A34A"]}
        size={64}
        iconSize={30}
        onPress={onLike}
      />
    </View>
  );
}
