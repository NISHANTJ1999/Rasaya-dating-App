import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { StepContainer } from "@/components/onboarding/StepContainer";
import { useAuthStore } from "@/lib/stores/auth-store";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function BirthdayStep() {
  const { onboardingData, updateOnboarding } = useAuthStore();

  const [day, setDay] = useState("");
  const [month, setMonth] = useState(-1);
  const [year, setYear] = useState("");

  const isValid = () => {
    const d = parseInt(day);
    const y = parseInt(year);
    if (!d || month < 0 || !y) return false;
    if (d < 1 || d > 31 || y < 1950 || y > 2008) return false;

    const dob = new Date(y, month, d);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age >= 18;
  };

  const handleContinue = () => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(parseInt(day)).padStart(2, "0")}`;
    updateOnboarding({ dateOfBirth: dateStr });
    router.push("/(onboarding)/gender");
  };

  return (
    <StepContainer
      step={2}
      title="When's your birthday?"
      subtitle="You must be at least 18 years old."
      canContinue={isValid()}
      onContinue={handleContinue}
    >
      <View className="mt-6 gap-6">
        {/* Day & Year Row */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-neutral-600 mb-1.5">Day</Text>
            <View className="bg-neutral-100 dark:bg-neutral-800 rounded-button px-4 py-3.5">
              <Pressable>
                <Text
                  className="text-base text-neutral-900 dark:text-white"
                  onPress={() => {}}
                >
                  {day || "DD"}
                </Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-1.5 mt-2">
              {[...Array(31)].map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => setDay(String(i + 1))}
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    day === String(i + 1) ? "bg-primary-500" : "bg-neutral-100 dark:bg-neutral-800"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      day === String(i + 1) ? "text-white" : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {i + 1}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Month Selector */}
        <View>
          <Text className="text-sm font-medium text-neutral-600 mb-1.5">Month</Text>
          <View className="flex-row flex-wrap gap-2">
            {months.map((m, i) => (
              <Pressable
                key={m}
                onPress={() => setMonth(i)}
                className={`px-4 py-2 rounded-chip ${
                  month === i ? "bg-primary-500" : "bg-neutral-100 dark:bg-neutral-800"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    month === i ? "text-white" : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Year Input */}
        <View>
          <Text className="text-sm font-medium text-neutral-600 mb-1.5">Year</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {[2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997, 1996, 1995, 1994, 1993, 1992, 1991, 1990].map((y) => (
              <Pressable
                key={y}
                onPress={() => setYear(String(y))}
                className={`px-3.5 py-2 rounded-chip ${
                  year === String(y) ? "bg-primary-500" : "bg-neutral-100 dark:bg-neutral-800"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    year === String(y) ? "text-white" : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {y}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </StepContainer>
  );
}
