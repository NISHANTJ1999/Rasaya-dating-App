import { View, Text, Pressable, Dimensions, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { Chip } from "@/components/ui/Chip";
import { LikeCommentSheet } from "@/components/modals/LikeCommentSheet";
import type { UserProfile } from "@/lib/types/user";
import { CITIES } from "@/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ProfileCardProps {
  profile: UserProfile;
  onLikePrompt?: (promptId: string, comment?: string) => void;
  onReport?: (profile: UserProfile) => void;
}

function AnimatedHeartButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withSpring(1.4, { damping: 4 }),
      withSpring(1, { damping: 8 })
    );
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        className="w-9 h-9 rounded-full bg-white dark:bg-neutral-600 items-center justify-center shadow-sm"
      >
        <Ionicons name="heart-outline" size={18} color="#FF6B35" />
      </Pressable>
    </Animated.View>
  );
}

export function ProfileCard({ profile, onLikePrompt, onReport }: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [likeSheetVisible, setLikeSheetVisible] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<{
    promptId: string;
    promptText: string;
    answer: string;
  } | null>(null);

  const cityName =
    CITIES.find((c) => c.id === profile.city)?.name ?? profile.city;

  const nextPhoto = () => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handlePromptLike = (prompt: typeof selectedPrompt) => {
    if (!prompt) return;
    setSelectedPrompt(prompt);
    setLikeSheetVisible(true);
  };

  const handleSendLike = (comment: string) => {
    if (selectedPrompt) {
      onLikePrompt?.(selectedPrompt.promptId, comment || undefined);
    }
    setLikeSheetVisible(false);
    setSelectedPrompt(null);
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-800 rounded-card overflow-hidden shadow-lg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled
      >
        {/* Photo Section */}
        <View
          style={{ height: SCREEN_WIDTH * 1.1 }}
          className="relative"
        >
          <Image
            source={{ uri: profile.photos[currentPhotoIndex]?.uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
            recyclingKey={profile.photos[currentPhotoIndex]?.id}
            priority="high"
          />

          {/* Photo Navigation Tap Zones */}
          <View className="absolute inset-0 flex-row">
            <Pressable onPress={prevPhoto} className="flex-1" />
            <Pressable onPress={nextPhoto} className="flex-1" />
          </View>

          {/* Photo Dots */}
          {profile.photos.length > 1 && (
            <View className="absolute top-3 left-0 right-0 flex-row justify-center gap-1.5">
              {profile.photos.map((_, i) => (
                <View
                  key={i}
                  className={`h-1 rounded-full ${
                    i === currentPhotoIndex
                      ? "bg-white w-6"
                      : "bg-white/50 w-4"
                  }`}
                />
              ))}
            </View>
          )}

          {/* Report button (top-right) */}
          {onReport && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                onReport(profile);
              }}
              hitSlop={12}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/45 items-center justify-center"
            >
              <Ionicons name="flag-outline" size={18} color="#FFFFFF" />
            </Pressable>
          )}

          {/* Bottom Gradient with Name */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-16"
          >
            <View className="flex-row items-end">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl font-bold text-white">
                    {profile.firstName}, {profile.age}
                  </Text>
                  {profile.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#3B82F6"
                    />
                  )}
                </View>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Ionicons
                    name="location-sharp"
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text className="text-sm text-white/80">{cityName}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Prompts Section */}
        <View className="px-4 py-3 gap-3">
          {profile.prompts.map((prompt) => (
            <View
              key={prompt.promptId}
              className="bg-neutral-50 dark:bg-neutral-700 rounded-card p-4 relative"
            >
              <Text className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-1.5 pr-10">
                {prompt.promptText}
              </Text>
              <Text className="text-base text-neutral-900 dark:text-white leading-6">
                {prompt.answer}
              </Text>
              <View className="absolute top-3 right-3">
                <AnimatedHeartButton
                  onPress={() =>
                    handlePromptLike({
                      promptId: prompt.promptId,
                      promptText: prompt.promptText,
                      answer: prompt.answer,
                    })
                  }
                />
              </View>
            </View>
          ))}

          {/* Interests */}
          {profile.interests.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5 mt-1 mb-4">
              {profile.interests.map((interest) => (
                <Chip key={interest} label={interest} size="sm" />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Like Comment Sheet */}
      <LikeCommentSheet
        visible={likeSheetVisible}
        promptText={selectedPrompt?.promptText ?? ""}
        promptAnswer={selectedPrompt?.answer ?? ""}
        onSend={handleSendLike}
        onClose={() => {
          setLikeSheetVisible(false);
          setSelectedPrompt(null);
        }}
      />
    </View>
  );
}
