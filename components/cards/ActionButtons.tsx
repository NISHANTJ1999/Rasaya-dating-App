import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

interface ActionButtonsProps {
  onNope: () => void;
  onLike: () => void;
  onSuperLike: () => void;
}

function AnimatedActionButton({
  icon,
  color,
  borderColor,
  size,
  iconSize,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  borderColor: string;
  size: number;
  iconSize: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.8, { damping: 8 }),
      withSpring(1.15, { damping: 6 }),
      withSpring(1, { damping: 10 })
    );
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons name={icon} size={iconSize} color={color} />
      </Pressable>
    </Animated.View>
  );
}

export function ActionButtons({ onNope, onLike, onSuperLike }: ActionButtonsProps) {
  return (
    <View className="flex-row items-center justify-center gap-5 py-4">
      <AnimatedActionButton
        icon="close"
        color="#EF4444"
        borderColor="#EF4444"
        size={64}
        iconSize={30}
        onPress={onNope}
      />
      <AnimatedActionButton
        icon="star"
        color="#3B82F6"
        borderColor="#3B82F6"
        size={48}
        iconSize={22}
        onPress={onSuperLike}
      />
      <AnimatedActionButton
        icon="heart"
        color="#22C55E"
        borderColor="#22C55E"
        size={64}
        iconSize={30}
        onPress={onLike}
      />
    </View>
  );
}
