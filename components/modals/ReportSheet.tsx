import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Modal, ScrollView } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";

export type ReportReason =
  | "scam_or_fraud"
  | "fake_profile"
  | "inappropriate_photos"
  | "harassment"
  | "spam"
  | "underage"
  | "other";

interface ReportOption {
  id: ReportReason;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    id: "scam_or_fraud",
    label: "Scam or fraud",
    icon: "warning",
    description: "Asking for money, crypto, or moving off-app to invest",
  },
  {
    id: "fake_profile",
    label: "Fake profile",
    icon: "person-remove",
    description: "Photos don't look real or are stolen from someone else",
  },
  {
    id: "inappropriate_photos",
    label: "Inappropriate photos",
    icon: "eye-off",
    description: "Nudity, violence, or offensive imagery",
  },
  {
    id: "harassment",
    label: "Harassment or hate",
    icon: "hand-left",
    description: "Threats, insults, or hateful behaviour",
  },
  {
    id: "spam",
    label: "Spam",
    icon: "mail-unread",
    description: "Promoting other accounts, services, or links",
  },
  {
    id: "underage",
    label: "Underage user",
    icon: "alert-circle",
    description: "Seems to be under 18",
  },
  {
    id: "other",
    label: "Something else",
    icon: "ellipsis-horizontal",
    description: "Tell us what's wrong",
  },
];

interface ReportSheetProps {
  visible: boolean;
  userFirstName?: string;
  onSubmit: (reason: ReportReason, description: string) => Promise<void> | void;
  onClose: () => void;
}

export function ReportSheet({ visible, userFirstName, onSubmit, onClose }: ReportSheetProps) {
  const [selected, setSelected] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setSelected(null);
    setDescription("");
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    try {
      setSubmitting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await onSubmit(selected, description.trim());
      reset();
    } catch {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/50"
        >
          <Pressable className="flex-1" onPress={handleClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          className="mt-auto bg-white dark:bg-neutral-800 rounded-t-3xl px-6 pt-4 pb-8"
          style={{ maxHeight: "85%" }}
        >
          <View className="w-10 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full self-center mb-4" />

          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-bold text-neutral-900 dark:text-white">
              {selected ? "Add details" : `Report ${userFirstName ?? "this profile"}`}
            </Text>
            <Pressable onPress={handleClose} className="p-1">
              <Ionicons name="close" size={24} color="#A3A3A3" />
            </Pressable>
          </View>
          <Text className="text-sm text-neutral-500 mb-4">
            {selected
              ? "Anything you share helps our team review faster. They won't be notified."
              : "Your report is anonymous. We review every submission."}
          </Text>

          {!selected ? (
            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[520px]">
              {REPORT_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelected(opt.id);
                  }}
                  className="flex-row items-center p-4 mb-2 bg-neutral-50 dark:bg-neutral-700 rounded-card active:bg-neutral-100"
                >
                  <View className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 items-center justify-center">
                    <Ionicons name={opt.icon} size={20} color="#EF4444" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                      {opt.label}
                    </Text>
                    <Text className="text-xs text-neutral-500 mt-0.5">{opt.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#A3A3A3" />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <>
              <View className="bg-red-50 dark:bg-red-900/20 rounded-card p-3 mb-3 flex-row items-center gap-2">
                <Ionicons
                  name={REPORT_OPTIONS.find((o) => o.id === selected)!.icon}
                  size={18}
                  color="#EF4444"
                />
                <Text className="text-sm font-semibold text-red-700 dark:text-red-300 flex-1">
                  {REPORT_OPTIONS.find((o) => o.id === selected)!.label}
                </Text>
                <Pressable onPress={() => setSelected(null)}>
                  <Text className="text-xs font-semibold text-primary-500">Change</Text>
                </Pressable>
              </View>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What happened? (optional)"
                placeholderTextColor="#A3A3A3"
                multiline
                maxLength={500}
                className="px-4 py-3 bg-neutral-100 dark:bg-neutral-700 rounded-card text-base text-neutral-900 dark:text-white min-h-[100px] mb-1"
                style={{ textAlignVertical: "top" }}
              />
              <Text className="text-xs text-neutral-400 text-right mb-4">
                {description.length}/500
              </Text>

              <View className="bg-neutral-50 dark:bg-neutral-700 rounded-card p-3 mb-4 flex-row items-start gap-2">
                <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
                <Text className="text-xs text-neutral-600 dark:text-neutral-300 flex-1">
                  Submitting will also block this user so you won't see them again.
                </Text>
              </View>

              <Button
                title={submitting ? "Submitting…" : "Submit report"}
                onPress={handleSubmit}
                disabled={submitting}
                icon="flag"
              />
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
