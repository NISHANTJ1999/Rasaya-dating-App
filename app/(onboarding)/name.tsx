import { View } from "react-native";
import { router } from "expo-router";
import { StepContainer } from "@/components/onboarding/StepContainer";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function NameStep() {
  const { onboardingData, updateOnboarding } = useAuthStore();

  return (
    <StepContainer
      step={1}
      title="What's your first name?"
      subtitle="This is how you'll appear on Rasaya."
      canContinue={onboardingData.firstName.trim().length >= 2}
      onContinue={() => router.push("/(onboarding)/birthday")}
    >
      <View className="mt-6">
        <Input
          value={onboardingData.firstName}
          onChangeText={(text) => updateOnboarding({ firstName: text })}
          placeholder="Your first name"
          maxLength={20}
          autoFocus
        />
      </View>
    </StepContainer>
  );
}
