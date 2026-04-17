import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!user?.onboardingComplete) {
    return <Redirect href="/(onboarding)/name" />;
  }

  // Mandatory verification - no access to app without it
  if (!user.isVerified) {
    return <Redirect href="/(onboarding)/verify" />;
  }

  return <Redirect href="/(app)/(discover)" />;
}
