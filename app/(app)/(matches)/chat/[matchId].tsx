import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useMatchesStore } from "@/lib/stores/matches-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { reportUser, blockUser } from "@/lib/firebase/firestore";
import { ReportSheet } from "@/components/modals/ReportSheet";
import type { Message } from "@/lib/types/match";

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { matches, getMessages, sendMessage, subscribeChat } = useMatchesStore();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const [text, setText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!matchId) return;
    const unsubscribe = subscribeChat(matchId);
    return unsubscribe;
  }, [matchId, subscribeChat]);

  const match = matches.find((m) => m.matchId === matchId);
  const messages = matchId ? getMessages(matchId) : [];

  const otherUserId = match
    ? Object.keys(match.users).find((id) => id !== "currentUser")
    : null;
  const otherUser = otherUserId && match ? match.users[otherUserId] : null;

  const handleSend = () => {
    if (!text.trim() || !matchId) return;
    sendMessage(matchId, text.trim());
    setText("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#171717" />
          </Pressable>
          {otherUser && (
            <View className="flex-row items-center flex-1">
              <Image
                source={{ uri: otherUser.photoUrl }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                contentFit="cover"
              />
              <View className="ml-3">
                <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                  {otherUser.firstName}
                </Text>
                <Text className="text-xs text-neutral-400">Active recently</Text>
              </View>
            </View>
          )}
          <Pressable
            onPress={() => {
              Alert.alert(otherUser?.firstName ?? "Options", undefined, [
                {
                  text: "Report & block",
                  style: "destructive",
                  onPress: () => setReportOpen(true),
                },
                { text: "Cancel", style: "cancel" },
              ]);
            }}
            className="p-2"
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#737373" />
          </Pressable>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.messageId}
          contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: "flex-end" }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-12">
              {otherUser && (
                <>
                  <Image
                    source={{ uri: otherUser.photoUrl }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                    contentFit="cover"
                  />
                  <Text className="text-lg font-semibold text-neutral-900 dark:text-white mt-3">
                    You matched with {otherUser.firstName}!
                  </Text>
                  <Text className="text-sm text-neutral-500 mt-1 text-center">
                    Say something interesting to start the conversation.
                  </Text>
                </>
              )}
            </View>
          )}
          renderItem={({ item: message }) => {
            const isMe = message.senderId === "currentUser";
            return (
              <View
                className={`mb-2 max-w-[80%] ${isMe ? "self-end" : "self-start"}`}
              >
                <View
                  className={`px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? "bg-primary-500 rounded-br-sm"
                      : "bg-neutral-100 dark:bg-neutral-800 rounded-bl-sm"
                  }`}
                >
                  <Text
                    className={`text-base ${isMe ? "text-white" : "text-neutral-900 dark:text-white"}`}
                  >
                    {message.text}
                  </Text>
                </View>
                <Text
                  className={`text-xs text-neutral-400 mt-0.5 ${isMe ? "text-right" : "text-left"}`}
                >
                  {formatMessageTime(message.createdAt)}
                </Text>
              </View>
            );
          }}
        />

        {/* Message Input */}
        <View className="flex-row items-center px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 gap-2">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor="#A3A3A3"
            multiline
            maxLength={500}
            className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-base text-neutral-900 dark:text-white max-h-[100px]"
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim()}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              text.trim() ? "bg-primary-500" : "bg-neutral-200 dark:bg-neutral-700"
            }`}
          >
            <Ionicons
              name="send"
              size={18}
              color={text.trim() ? "#FFFFFF" : "#A3A3A3"}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <ReportSheet
        visible={reportOpen}
        userFirstName={otherUser?.firstName}
        onClose={() => setReportOpen(false)}
        onSubmit={async (reason, description) => {
          if (firebaseUser && otherUserId) {
            try {
              await Promise.all([
                reportUser(firebaseUser.uid, otherUserId, reason, description),
                blockUser(firebaseUser.uid, otherUserId),
              ]);
            } catch (error) {
              console.error("Failed to report:", error);
            }
          }
          setReportOpen(false);
          Alert.alert(
            "Report submitted",
            "Thanks for keeping Rasaya safe. We'll review this account and you won't see them again.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        }}
      />
    </SafeAreaView>
  );
}
