import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StepContainer } from "@/components/onboarding/StepContainer";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { Gender } from "@/lib/types/user";

const GENDERS: { value: Gender; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "woman", label: "Woman", icon: "female" },
  { value: "man", label: "Man", icon: "male" },
  { value: "nonbinary", label: "Non-binary", icon: "male-female" },
];

export default function GenderStep() {
  const { onboardingData, updateOnboarding } = useAuthStore();

  return (
    <StepContainer
      step={3}
      title="How do you identify?"
      canContinue={onboardingData.gender !== null}
      onContinue={() => router.push("/(onboarding)/photos")}
    >
      <View className="mt-6 gap-3">
        {GENDERS.map((g) => (
          <Pressable
            key={g.value}
            onPress={() => updateOnboarding({ gender: g.value })}
            className={`flex-row items-center p-4 rounded-card border-2 ${
              onboardingData.gender === g.value
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            }`}
          >
            <View
              className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                onboardingData.gender === g.value ? "bg-primary-500" : "bg-neutral-100 dark:bg-neutral-700"
              }`}
            >
              <Ionicons
                name={g.icon}
                size={24}
                color={onboardingData.gender === g.value ? "#FFFFFF" : "#737373"}
              />
            </View>
            <Text
              className={`text-lg font-semibold ${
                onboardingData.gender === g.value
                  ? "text-primary-500"
                  : "text-neutral-900 dark:text-white"
              }`}
            >
              {g.label}
            </Text>
            {onboardingData.gender === g.value && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#FF6B35"
                style={{ marginLeft: "auto" }}
              />
            )}
          </Pressable>
        ))}
      </View>
    </StepContainer>
  );
}
