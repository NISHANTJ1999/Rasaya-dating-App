import { View, Text, FlatList, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
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
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      {/* Header */}
      <View className="px-5 py-4">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
          Matches
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* New Matches - Horizontal */}
        {newMatches.length > 0 && (
          <View className="mb-4">
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
                    <View className="relative mb-1">
                      <Image
                        source={{ uri: other.photoUrl }}
                        style={{ width: 72, height: 72, borderRadius: 36 }}
                        contentFit="cover"
                      />
                      <View className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary-500 border-2 border-white items-center justify-center">
                        <Ionicons name="heart" size={10} color="#FFFFFF" />
                      </View>
                    </View>
                    <Text className="text-sm font-medium text-neutral-900 dark:text-white">
                      {other.firstName}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Conversations */}
        <View>
          <Text className="text-sm font-semibold text-neutral-500 uppercase tracking-wide px-5 mb-2">
            Conversations
          </Text>
          {conversations.length === 0 ? (
            <View className="items-center py-12 px-8">
              <Ionicons name="chatbubble-outline" size={48} color="#D4D4D4" />
              <Text className="text-base text-neutral-400 text-center mt-3">
                No conversations yet. Match with someone and start chatting!
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              scrollEnabled={false}
              keyExtractor={(item) => item.matchId}
              renderItem={({ item: match }) => {
                const other = getOtherUser(match);
                if (!other) return null;
                return (
                  <Pressable
                    onPress={() =>
                      router.push(`/(app)/(matches)/chat/${match.matchId}`)
                    }
                    className="flex-row items-center px-5 py-3 active:bg-neutral-50 dark:active:bg-neutral-800"
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
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
