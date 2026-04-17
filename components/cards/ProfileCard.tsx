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
  FadeInUp,
} from "react-native-reanimated";
import { Badge } from "@/components/ui/Badge";
import { LikeCommentSheet } from "@/components/modals/LikeCommentSheet";
import type { UserProfile } from "@/lib/types/user";
import { CITIES } from "@/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function AnimatedHeartButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withSpring(1.5, { damping: 4 }),
      withSpring(1, { damping: 8 })
    );
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        className="w-10 h-10 rounded-full items-center justify-center overflow-hidden"
      >
        <LinearGradient
          colors={["#FF6B35", "#EC4899"]}
          className="absolute inset-0"
          style={{ width: 40, height: 40 }}
        />
        <Ionicons name="heart" size={18} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

interface ProfileCardProps {
  profile: UserProfile;
  onLikePrompt?: (promptId: string, comment?: string) => void;
  onReport?: (profile: UserProfile) => void;
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
    <View
      className="flex-1 bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled
      >
        {/* Photo Section */}
        <View style={{ height: SCREEN_WIDTH * 1.1 }} className="relative">
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

          {/* Photo Progress Bar (Instagram-style segments) */}
          {profile.photos.length > 1 && (
            <View className="absolute top-3 left-3 right-3 flex-row gap-1">
              {profile.photos.map((_, i) => (
                <View
                  key={i}
                  className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/30"
                >
                  {i <= currentPhotoIndex && (
                    <View
                      className="h-full rounded-full bg-white"
                      style={{ width: i === currentPhotoIndex ? "100%" : "100%" }}
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Report button */}
          {onReport && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                onReport(profile);
              }}
              hitSlop={12}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 items-center justify-center"
            >
              <Ionicons name="flag-outline" size={18} color="#FFFFFF" />
            </Pressable>
          )}

          {/* Bottom Gradient with Name + Badges */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-20"
          >
            <View className="flex-row items-end">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl font-bold text-white">
                    {profile.firstName}, {profile.age}
                  </Text>
                  {profile.isVerified && <Badge type="verified" size="sm" />}
                  {profile.iqVerified && <Badge type="iq" size="sm" />}
                </View>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Ionicons name="location-sharp" size={14} color="#FFFFFF" />
                  <Text className="text-sm text-white/80">{cityName}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Prompts Section */}
        <View className="px-4 py-3 gap-3">
          {profile.prompts.map((prompt, i) => (
            <Animated.View
              key={prompt.promptId}
              entering={FadeInUp.delay(i * 80).duration(400)}
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                backgroundColor: "rgba(255, 107, 53, 0.05)",
              }}
            >
              {/* Left accent border */}
              <LinearGradient
                colors={["#FF6B35", "#7C3AED"]}
                className="absolute left-0 top-0 bottom-0 w-[3px]"
              />
              <Text className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-1.5 pr-10 ml-2">
                {prompt.promptText}
              </Text>
              <Text className="text-base text-neutral-900 dark:text-white leading-6 ml-2">
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
            </Animated.View>
          ))}

          {/* Interests */}
          {profile.interests.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5 mt-1 mb-4">
              {profile.interests.map((interest) => (
                <View
                  key={interest}
                  className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700"
                >
                  <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {interest}
                  </Text>
                </View>
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
