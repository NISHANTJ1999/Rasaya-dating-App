import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { CardStack } from "@/components/cards/CardStack";
import { ActionButtons } from "@/components/cards/ActionButtons";
import { MatchModal } from "@/components/modals/MatchModal";
import { ReportSheet } from "@/components/modals/ReportSheet";
import { useDiscoveryStore } from "@/lib/stores/discovery-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { UserProfile } from "@/lib/types/user";
import { useState } from "react";

function AnimatedEmptyState() {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withSpring(-10, { damping: 10, stiffness: 40 }),
        withSpring(10, { damping: 10, stiffness: 40 })
      ),
      -1,
      true
    );
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Animated.View
        style={floatStyle}
        className="w-24 h-24 rounded-full items-center justify-center mb-6 overflow-hidden"
      >
        <LinearGradient
          colors={["#FF6B35", "#7C3AED"]}
          style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="heart" size={44} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
      <Text className="text-xl font-bold text-neutral-900 dark:text-white text-center mb-2">
        No more profiles
      </Text>
      <Text className="text-base text-neutral-500 text-center leading-6">
        You've seen everyone nearby! Check back later or expand your preferences to see more people.
      </Text>
    </View>
  );
}

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
    reportAndBlock,
  } = useDiscoveryStore();

  const currentUser = useAuthStore((s) => s.user);
  const [reportTarget, setReportTarget] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const hasProfiles = currentIndex < profiles.length;

  const handleSwipeRight = (_profile: UserProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeRight({ type: "profile" });
  };

  const handleSwipeLeft = (_profile: UserProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swipeLeft();
  };

  const handleSuperLike = (_profile: UserProfile) => {
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
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-row items-center justify-between px-5 py-3"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="flame" size={28} color="#FF6B35" />
          <Text
            className="text-2xl font-bold"
            style={{ color: "#FF6B35" }}
          >
            Rasaya
          </Text>
        </View>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: "rgba(255,107,53,0.1)",
          }}
        >
          <Ionicons name="options" size={20} color="#FF6B35" />
        </View>
      </Animated.View>

      {/* Gradient separator */}
      <LinearGradient
        colors={["#FF6B35", "#7C3AED", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="h-[1px] mx-5 mb-2"
      />

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
              onReport={(profile) => setReportTarget(profile)}
            />
          </View>
          <ActionButtons
            onNope={handleNope}
            onLike={handleLike}
            onSuperLike={handleSuperLikeBtn}
          />
        </View>
      ) : (
        <AnimatedEmptyState />
      )}

      {/* Match Modal */}
      <MatchModal
        visible={showMatchModal}
        currentUser={currentUser}
        matchedUser={matchedProfile}
        onSendMessage={() => {
          dismissMatchModal();
          if (matchedProfile && currentUser) {
            const [smaller, larger] = [currentUser.uid, matchedProfile.uid].sort();
            router.push(`/(app)/(matches)/chat/${smaller}_${larger}`);
          }
        }}
        onKeepSwiping={dismissMatchModal}
      />

      {/* Report Sheet */}
      <ReportSheet
        visible={reportTarget !== null}
        userFirstName={reportTarget?.firstName}
        onClose={() => setReportTarget(null)}
        onSubmit={async (reason, description) => {
          if (!reportTarget) return;
          await reportAndBlock(reportTarget.uid, reason, description);
          setReportTarget(null);
        }}
      />
    </SafeAreaView>
  );
}
