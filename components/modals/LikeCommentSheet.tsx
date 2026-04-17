import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";

interface LikeCommentSheetProps {
  visible: boolean;
  promptText: string;
  promptAnswer: string;
  onSend: (comment: string) => void;
  onClose: () => void;
}

export function LikeCommentSheet({
  visible,
  promptText,
  promptAnswer,
  onSend,
  onClose,
}: LikeCommentSheetProps) {
  const [comment, setComment] = useState("");

  const handleSend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSend(comment.trim());
    setComment("");
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/50"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          className="mt-auto bg-white dark:bg-neutral-800 rounded-t-3xl px-6 pt-4 pb-8"
        >
          {/* Handle */}
          <View className="w-10 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full self-center mb-4" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-neutral-900 dark:text-white">
              Like with a comment
            </Text>
            <Pressable onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#A3A3A3" />
            </Pressable>
          </View>

          {/* Prompt Preview */}
          <View className="bg-neutral-50 dark:bg-neutral-700 rounded-card p-4 mb-4">
            <Text className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-1">
              {promptText}
            </Text>
            <Text className="text-base text-neutral-900 dark:text-white">
              {promptAnswer}
            </Text>
          </View>

          {/* Comment Input */}
          <View className="mb-4">
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment (optional)..."
              placeholderTextColor="#A3A3A3"
              multiline
              maxLength={200}
              autoFocus
              className="px-4 py-3 bg-neutral-100 dark:bg-neutral-700 rounded-card text-base text-neutral-900 dark:text-white min-h-[80px]"
              style={{ textAlignVertical: "top" }}
            />
            <Text className="text-xs text-neutral-400 text-right mt-1">
              {comment.length}/200
            </Text>
          </View>

          {/* Send Button */}
          <Button
            title={comment.trim() ? "Send Like with Comment" : "Send Like"}
            onPress={handleSend}
            icon="heart"
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
