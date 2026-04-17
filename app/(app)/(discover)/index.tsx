import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { CardStack } from "@/components/cards/CardStack";
import { ActionButtons } from "@/components/cards/ActionButtons";
import { MatchModal } from "@/components/modals/MatchModal";
import { useDiscoveryStore } from "@/lib/stores/discovery-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { UserProfile } from "@/lib/types/user";

export default function DiscoverScreen() {
  const {
    profiles,
    currentIndex,
    loadProfiles,
    swipeRight,
    swipeLeft,
    superLike,
    showMatchModal,
    matchedProfile,
    dismissMatchModal,
  } = useDiscoveryStore();

  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const hasProfiles = currentIndex < profiles.length;

  const handleSwipeRight = (profile: UserProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeRight({ type: "profile" });
  };

  const handleSwipeLeft = (_profile: UserProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swipeLeft();
  };

  const handleSuperLike = (profile: UserProfile) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    superLike({ type: "profile" });
  };

  const handleNope = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swipeLeft();
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeRight({ type: "profile" });
  };

  const handleSuperLikeBtn = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    superLike({ type: "profile" });
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="flame" size={28} color="#FF6B35" />
          <Text className="text-2xl font-bold text-primary-500">Rasaya</Text>
        </View>
        <View className="flex-row gap-2">
          <View className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 items-center justify-center shadow-sm">
            <Ionicons name="options" size={20} color="#737373" />
          </View>
        </View>
      </View>

      {/* Card Stack */}
      {hasProfiles ? (
        <View className="flex-1 px-4">
          <View className="flex-1">
            <CardStack
              profiles={profiles}
              currentIndex={currentIndex}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              onSuperLike={handleSuperLike}
            />
          </View>
          <ActionButtons
            onNope={handleNope}
            onLike={handleLike}
            onSuperLike={handleSuperLikeBtn}
          />
        </View>
      ) : (
        /* Empty State */
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-4">
            <Ionicons name="search" size={36} color="#FF6B35" />
          </View>
          <Text className="text-xl font-bold text-neutral-900 dark:text-white text-center mb-2">
            No more profiles
          </Text>
          <Text className="text-base text-neutral-500 text-center leading-6">
            You've seen everyone nearby! Check back later or expand your preferences to see more people.
          </Text>
        </View>
      )}

      {/* Match Modal */}
      <MatchModal
        visible={showMatchModal}
        currentUser={currentUser}
        matchedUser={matchedProfile}
        onSendMessage={() => {
          dismissMatchModal();
          // Navigate to chat with the matched user
          if (matchedProfile && currentUser) {
            const [smaller, larger] = [currentUser.uid, matchedProfile.uid].sort();
            router.push(`/(app)/(matches)/chat/${smaller}_${larger}`);
          }
        }}
        onKeepSwiping={dismissMatchModal}
      />
    </SafeAreaView>
  );
}
