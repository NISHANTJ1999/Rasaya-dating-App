import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "@/components/ui/Button";

interface StepContainerProps {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onContinue: () => void;
  canContinue?: boolean;
  continueLabel?: string;
  showBack?: boolean;
}

export function StepContainer({
  step,
  totalSteps = 8,
  title,
  subtitle,
  children,
  onContinue,
  canContinue = true,
  continueLabel = "Continue",
  showBack = true,
}: StepContainerProps) {
  const progress = step / totalSteps;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header with Progress */}
        <View className="px-6 pt-2 pb-4">
          <View className="flex-row items-center mb-4">
            {showBack && (
              <Pressable onPress={() => router.back()} className="mr-3 p-1">
                <Ionicons name="arrow-back" size={24} color="#171717" />
              </Pressable>
            )}
            <View className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <LinearGradient
                colors={["#FF6B35", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: "100%", width: `${progress * 100}%`, borderRadius: 999 }}
              />
            </View>
            <Text className="ml-3 text-sm text-neutral-400 font-medium">
              {step}/{totalSteps}
            </Text>
          </View>

          <Animated.Text
            entering={FadeInDown.duration(400)}
            className="text-2xl font-bold text-neutral-900 dark:text-white"
          >
            {title}
          </Animated.Text>
          {subtitle && (
            <Animated.Text
              entering={FadeInDown.delay(100).duration(400)}
              className="text-base text-neutral-500 mt-1"
            >
              {subtitle}
            </Animated.Text>
          )}
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {/* Continue Button */}
        <View className="px-6 pb-6 pt-3">
          <Button
            title={continueLabel}
            onPress={onContinue}
            disabled={!canContinue}
            variant="gradient"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
