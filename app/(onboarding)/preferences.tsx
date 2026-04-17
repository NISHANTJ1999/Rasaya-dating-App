import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StepContainer } from "@/components/onboarding/StepContainer";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { GenderPreference } from "@/lib/types/user";

const PREFS: { value: GenderPreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "men", label: "Men", icon: "male" },
  { value: "women", label: "Women", icon: "female" },
  { value: "everyone", label: "Everyone", icon: "people" },
];

export default function PreferencesStep() {
  const { onboardingData, updateOnboarding, completeOnboarding } = useAuthStore();

  const adjustAge = (field: "ageMin" | "ageMax", delta: number) => {
    const current = onboardingData[field];
    const newVal = current + delta;
    if (field === "ageMin" && newVal >= 18 && newVal < onboardingData.ageMax) {
      updateOnboarding({ ageMin: newVal });
    }
    if (field === "ageMax" && newVal > onboardingData.ageMin && newVal <= 60) {
      updateOnboarding({ ageMax: newVal });
    }
  };

  const adjustDistance = (delta: number) => {
    const newVal = onboardingData.maxDistance + delta;
    if (newVal >= 5 && newVal <= 100) {
      updateOnboarding({ maxDistance: newVal });
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    router.replace("/(app)/(discover)");
  };

  return (
    <StepContainer
      step={8}
      title="Your preferences"
      subtitle="Who would you like to meet?"
      canContinue={onboardingData.genderPreference !== null}
      onContinue={handleComplete}
      continueLabel="Start Exploring"
    >
      <View className="mt-6 gap-6">
        {/* Gender Preference */}
        <View>
          <Text className="text-base font-semibold text-neutral-900 dark:text-white mb-3">
            Show me
          </Text>
          <View className="flex-row gap-2">
            {PREFS.map((pref) => (
              <Pressable
                key={pref.value}
                onPress={() => updateOnboarding({ genderPreference: pref.value })}
                className={`flex-1 items-center py-3 rounded-card border-2 ${
                  onboardingData.genderPreference === pref.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <Ionicons
                  name={pref.icon}
                  size={24}
                  color={onboardingData.genderPreference === pref.value ? "#FF6B35" : "#737373"}
                />
                <Text
                  className={`text-sm font-medium mt-1 ${
                    onboardingData.genderPreference === pref.value
                      ? "text-primary-500"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {pref.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Age Range */}
        <View>
          <Text className="text-base font-semibold text-neutral-900 dark:text-white mb-3">
            Age range
          </Text>
          <View className="flex-row items-center justify-center gap-4">
            <View className="items-center">
              <Text className="text-xs text-neutral-500 mb-1">Min</Text>
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => adjustAge("ageMin", -1)}
                  className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
                >
                  <Ionicons name="remove" size={20} color="#737373" />
                </Pressable>
                <Text className="text-2xl font-bold text-neutral-900 dark:text-white w-12 text-center">
                  {onboardingData.ageMin}
                </Text>
                <Pressable
                  onPress={() => adjustAge("ageMin", 1)}
                  className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
                >
                  <Ionicons name="add" size={20} color="#737373" />
                </Pressable>
              </View>
            </View>

            <Text className="text-2xl text-neutral-300">-</Text>

            <View className="items-center">
              <Text className="text-xs text-neutral-500 mb-1">Max</Text>
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => adjustAge("ageMax", -1)}
                  className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
                >
                  <Ionicons name="remove" size={20} color="#737373" />
                </Pressable>
                <Text className="text-2xl font-bold text-neutral-900 dark:text-white w-12 text-center">
                  {onboardingData.ageMax}
                </Text>
                <Pressable
                  onPress={() => adjustAge("ageMax", 1)}
                  className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
                >
                  <Ionicons name="add" size={20} color="#737373" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Distance */}
        <View>
          <Text className="text-base font-semibold text-neutral-900 dark:text-white mb-3">
            Maximum distance
          </Text>
          <View className="flex-row items-center justify-center gap-3">
            <Pressable
              onPress={() => adjustDistance(-5)}
              className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="remove" size={20} color="#737373" />
            </Pressable>
            <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
              {onboardingData.maxDistance} km
            </Text>
            <Pressable
              onPress={() => adjustDistance(5)}
              className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="add" size={20} color="#737373" />
            </Pressable>
          </View>
        </View>
      </View>
    </StepContainer>
  );
}
