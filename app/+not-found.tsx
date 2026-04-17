import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900 p-5">
        <Text className="text-xl font-bold text-neutral-900 dark:text-white">
          This screen doesn't exist.
        </Text>
        <Link href="/" className="mt-4 py-2">
          <Text className="text-base text-primary-500 font-medium">Go to home</Text>
        </Link>
      </View>
    </>
  );
}
