import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="name" />
      <Stack.Screen name="birthday" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="city" />
      <Stack.Screen name="prompts" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
