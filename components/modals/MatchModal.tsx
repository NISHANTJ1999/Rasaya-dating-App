import { View, Text, Modal, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import type { UserProfile } from "@/lib/types/user";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MatchModalProps {
  visible: boolean;
  currentUser: UserProfile | null;
  matchedUser: UserProfile | null;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export function MatchModal({
  visible,
  currentUser,
  matchedUser,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  const heartScale = useSharedValue(0);
  const leftPhotoX = useSharedValue(-SCREEN_WIDTH);
  const rightPhotoX = useSharedValue(SCREEN_WIDTH);
  const titleScale = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate photos sliding in
      leftPhotoX.value = withSpring(0, { damping: 12, stiffness: 100 });
      rightPhotoX.value = withSpring(0, { damping: 12, stiffness: 100 });

      // Heart pops
      heartScale.value = withDelay(
        300,
        withSequence(
          withSpring(1.3, { damping: 4, stiffness: 200 }),
          withSpring(1, { damping: 8, stiffness: 150 })
        )
      );

      // Title appears
      titleScale.value = withDelay(
        500,
        withSpring(1, { damping: 8, stiffness: 120 })
      );

      // Buttons fade in
      buttonsOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    } else {
      heartScale.value = 0;
      leftPhotoX.value = -SCREEN_WIDTH;
      rightPhotoX.value = SCREEN_WIDTH;
      titleScale.value = 0;
      buttonsOpacity.value = 0;
    }
  }, [visible, heartScale, leftPhotoX, rightPhotoX, titleScale, buttonsOpacity]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftPhotoX.value }],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightPhotoX.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleScale.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  if (!currentUser || !matchedUser) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <LinearGradient
        colors={["#FF6B35", "#EC4899", "#FF6B35"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View className="flex-1 items-center justify-center px-8">
          {/* Title */}
          <Animated.View style={titleStyle} className="items-center mb-10">
            <Text className="text-4xl font-bold text-white mb-1">
              It's a Match!
            </Text>
            <Text className="text-base text-white/80 text-center">
              You and {matchedUser.firstName} liked each other
            </Text>
          </Animated.View>

          {/* Photos */}
          <View className="flex-row items-center justify-center mb-10">
            <Animated.View
              style={[leftStyle]}
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
            >
              <Image
                source={{ uri: currentUser.photos[0]?.uri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </Animated.View>

            {/* Heart in the middle */}
            <Animated.View
              style={[heartStyle]}
              className="absolute z-10 w-14 h-14 rounded-full bg-white items-center justify-center shadow-lg"
            >
              <Ionicons name="heart" size={28} color="#FF6B35" />
            </Animated.View>

            <Animated.View
              style={[rightStyle]}
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg -ml-4"
            >
              <Image
                source={{ uri: matchedUser.photos[0]?.uri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </Animated.View>
          </View>

          {/* Buttons */}
          <Animated.View style={buttonsStyle} className="w-full gap-3">
            <Button
              title="Send a Message"
              onPress={onSendMessage}
              variant="secondary"
              icon="chatbubble"
            />
            <Pressable
              onPress={onKeepSwiping}
              className="py-3 items-center"
            >
              <Text className="text-base font-semibold text-white/80">
                Keep Swiping
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    </Modal>
  );
}
