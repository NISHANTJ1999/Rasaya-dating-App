import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StepContainer } from "@/components/onboarding/StepContainer";
import { useAuthStore } from "@/lib/stores/auth-store";
import { CITIES } from "@/lib/constants";
import type { City } from "@/lib/types/user";

const CITY_ICONS: Record<City, keyof typeof Ionicons.glyphMap> = {
  pune: "leaf",
  mumbai: "business",
  bangalore: "code-slash",
  delhi: "flag",
  hyderabad: "restaurant",
};

export default function CityStep() {
  const { onboardingData, updateOnboarding } = useAuthStore();

  return (
    <StepContainer
      step={5}
      title="Where do you live?"
      subtitle="Rasaya connects you with people in your city."
      canContinue={onboardingData.city !== null}
      onContinue={() => router.push("/(onboarding)/prompts")}
    >
      <View className="mt-6 gap-3">
        {CITIES.map((city) => (
          <Pressable
            key={city.id}
            onPress={() => updateOnboarding({ city: city.id })}
            className={`flex-row items-center p-4 rounded-card border-2 ${
              onboardingData.city === city.id
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            }`}
          >
            <View
              className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                onboardingData.city === city.id ? "bg-primary-500" : "bg-neutral-100 dark:bg-neutral-700"
              }`}
            >
              <Ionicons
                name={CITY_ICONS[city.id]}
                size={22}
                color={onboardingData.city === city.id ? "#FFFFFF" : "#737373"}
              />
            </View>
            <View>
              <Text
                className={`text-lg font-semibold ${
                  onboardingData.city === city.id
                    ? "text-primary-500"
                    : "text-neutral-900 dark:text-white"
                }`}
              >
                {city.name}
              </Text>
              <Text className="text-sm text-neutral-500">{city.state}</Text>
            </View>
            {onboardingData.city === city.id && (
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
