import { View, Text } from "react-native";
import { router } from "expo-router";
import { StepContainer } from "@/components/onboarding/StepContainer";
import { Chip } from "@/components/ui/Chip";
import { useAuthStore } from "@/lib/stores/auth-store";
import { INTERESTS } from "@/lib/constants";

const MIN_INTERESTS = 3;
const MAX_INTERESTS = 10;

export default function InterestsStep() {
  const { onboardingData, updateOnboarding } = useAuthStore();
  const selected = onboardingData.interests;

  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      updateOnboarding({ interests: selected.filter((i) => i !== interest) });
    } else if (selected.length < MAX_INTERESTS) {
      updateOnboarding({ interests: [...selected, interest] });
    }
  };

  return (
    <StepContainer
      step={7}
      title="What are you into?"
      subtitle={`Pick ${MIN_INTERESTS}-${MAX_INTERESTS} interests. (${selected.length} selected)`}
      canContinue={selected.length >= MIN_INTERESTS}
      onContinue={() => router.push("/(onboarding)/preferences")}
    >
      <View className="mt-4 flex-row flex-wrap gap-2">
        {INTERESTS.map((interest) => (
          <Chip
            key={interest}
            label={interest}
            selected={selected.includes(interest)}
            onPress={() => toggleInterest(interest)}
          />
        ))}
      </View>
    </StepContainer>
  );
}
