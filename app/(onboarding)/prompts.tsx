import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StepContainer } from "@/components/onboarding/StepContainer";
import { useAuthStore } from "@/lib/stores/auth-store";
import { PROMPTS } from "@/lib/constants";

const MAX_PROMPTS = 3;

export default function PromptsStep() {
  const { onboardingData, updateOnboarding } = useAuthStore();
  const [showPicker, setShowPicker] = useState(false);
  const selectedPrompts = onboardingData.prompts;

  const addPrompt = (promptId: string, promptText: string) => {
    if (selectedPrompts.length >= MAX_PROMPTS) return;
    if (selectedPrompts.find((p) => p.promptId === promptId)) return;

    updateOnboarding({
      prompts: [...selectedPrompts, { promptId, promptText, answer: "" }],
    });
    setShowPicker(false);
  };

  const removePrompt = (promptId: string) => {
    updateOnboarding({
      prompts: selectedPrompts.filter((p) => p.promptId !== promptId),
    });
  };

  const updateAnswer = (promptId: string, answer: string) => {
    updateOnboarding({
      prompts: selectedPrompts.map((p) =>
        p.promptId === promptId ? { ...p, answer } : p
      ),
    });
  };

  const allAnswered = selectedPrompts.length === MAX_PROMPTS &&
    selectedPrompts.every((p) => p.answer.trim().length >= 5);

  return (
    <StepContainer
      step={6}
      title="Answer 3 prompts"
      subtitle="Show your personality! Pick prompts and write your answers."
      canContinue={allAnswered}
      onContinue={() => router.push("/(onboarding)/interests")}
    >
      <View className="mt-4 gap-4">
        {/* Selected Prompts */}
        {selectedPrompts.map((prompt) => (
          <View
            key={prompt.promptId}
            className="bg-neutral-50 dark:bg-neutral-800 rounded-card p-4 border border-neutral-200 dark:border-neutral-700"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-primary-500 flex-1">
                {prompt.promptText}
              </Text>
              <Pressable onPress={() => removePrompt(prompt.promptId)} className="p-1">
                <Ionicons name="close-circle" size={20} color="#A3A3A3" />
              </Pressable>
            </View>
            <TextInput
              value={prompt.answer}
              onChangeText={(text) => updateAnswer(prompt.promptId, text)}
              placeholder="Write your answer..."
              placeholderTextColor="#A3A3A3"
              multiline
              maxLength={150}
              className="text-base text-neutral-900 dark:text-white min-h-[60px]"
              style={{ textAlignVertical: "top" }}
            />
            <Text className="text-xs text-neutral-400 text-right mt-1">
              {prompt.answer.length}/150
            </Text>
          </View>
        ))}

        {/* Add Prompt Button */}
        {selectedPrompts.length < MAX_PROMPTS && !showPicker && (
          <Pressable
            onPress={() => setShowPicker(true)}
            className="flex-row items-center justify-center p-4 rounded-card border-2 border-dashed border-primary-300 bg-primary-50"
          >
            <Ionicons name="add-circle" size={24} color="#FF6B35" />
            <Text className="ml-2 text-base font-semibold text-primary-500">
              Add a prompt ({selectedPrompts.length}/{MAX_PROMPTS})
            </Text>
          </Pressable>
        )}

        {/* Prompt Picker */}
        {showPicker && (
          <View className="gap-2">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Choose a prompt
              </Text>
              <Pressable onPress={() => setShowPicker(false)}>
                <Text className="text-sm text-primary-500 font-medium">Cancel</Text>
              </Pressable>
            </View>
            {PROMPTS.filter(
              (p) => !selectedPrompts.find((sp) => sp.promptId === p.id)
            ).map((prompt) => (
              <Pressable
                key={prompt.id}
                onPress={() => addPrompt(prompt.id, prompt.text)}
                className="p-3 bg-white dark:bg-neutral-800 rounded-button border border-neutral-200 dark:border-neutral-700 active:bg-neutral-100"
              >
                <Text className="text-base text-neutral-900 dark:text-white">
                  {prompt.text}
                </Text>
                <Text className="text-xs text-neutral-400 mt-0.5 capitalize">
                  {prompt.category}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </StepContainer>
  );
}
