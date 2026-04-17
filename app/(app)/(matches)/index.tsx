import { View, Text, FlatList, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useMatchesStore } from "@/lib/stores/matches-store";
import type { Match } from "@/lib/types/match";

function getOtherUser(match: Match) {
  const otherId = Object.keys(match.users).find((id) => id !== "currentUser");
  return otherId ? match.users[otherId] : null;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function MatchesScreen() {
  const { matches, loadMatches } = useMatchesStore();

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const newMatches = matches.filter((m) => !m.lastMessage);
  const conversations = matches.filter((m) => m.lastMessage);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} className="px-5 py-4">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
          Matches
        </Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* New Matches - Horizontal */}
        {newMatches.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mb-4">
            <Text className="text-sm font-semibold text-neutral-500 uppercase tracking-wide px-5 mb-3">
              New Matches
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
            >
              {newMatches.map((match) => {
                const other = getOtherUser(match);
                if (!other) return null;
                return (
                  <Pressable
                    key={match.matchId}
                    onPress={() =>
                      router.push(`/(app)/(matches)/chat/${match.matchId}`)
                    }
                    className="items-center"
                  >
                    <View className="relative mb-1 p-[2px] rounded-full overflow-hidden">
                      <LinearGradient
                        colors={["#FF6B35", "#7C3AED"]}
                        className="p-[2px] rounded-full"
                      >
                        <Image
                          source={{ uri: other.photoUrl }}
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: 34,
                            borderWidth: 2,
                            borderColor: "#FFFFFF",
                          }}
                          contentFit="cover"
                        />
                      </LinearGradient>
                    </View>
                    <Text className="text-sm font-medium text-neutral-900 dark:text-white">
                      {other.firstName}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {/* Conversations */}
        <View>
          <Text className="text-sm font-semibold text-neutral-500 uppercase tracking-wide px-5 mb-2">
            Conversations
          </Text>
          {conversations.length === 0 ? (
            <View className="items-center py-12 px-8">
              <View className="w-16 h-16 rounded-full overflow-hidden mb-3">
                <LinearGradient
                  colors={["#FF6B35", "#7C3AED"]}
                  style={{ width: 64, height: 64, alignItems: "center", justifyContent: "center", opacity: 0.2 }}
                >
                  <Ionicons name="chatbubble-outline" size={28} color="#FF6B35" />
                </LinearGradient>
              </View>
              <Text className="text-base text-neutral-400 text-center">
                No conversations yet. Match with someone and start chatting!
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              scrollEnabled={false}
              keyExtractor={(item) => item.matchId}
              renderItem={({ item: match, index }) => {
                const other = getOtherUser(match);
                if (!other) return null;
                return (
                  <Animated.View entering={FadeInDown.delay(300 + index * 80).duration(400)}>
                    <Pressable
                      onPress={() =>
                        router.push(`/(app)/(matches)/chat/${match.matchId}`)
                      }
                      className="flex-row items-center px-5 py-3 active:bg-neutral-100 dark:active:bg-neutral-800"
                    >
                      <Image
                        source={{ uri: other.photoUrl }}
                        style={{ width: 56, height: 56, borderRadius: 28 }}
                        contentFit="cover"
                      />
                      <View className="flex-1 ml-3">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                            {other.firstName}
                          </Text>
                          {match.lastMessage && (
                            <Text className="text-xs text-neutral-400">
                              {formatTime(match.lastMessage.sentAt)}
                            </Text>
                          )}
                        </View>
                        {match.lastMessage && (
                          <Text
                            className="text-sm text-neutral-500 mt-0.5"
                            numberOfLines={1}
                          >
                            {match.lastMessage.senderId === "currentUser" ? "You: " : ""}
                            {match.lastMessage.text}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
