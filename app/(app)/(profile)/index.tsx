import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/lib/stores/auth-store";
import { CITIES } from "@/lib/constants";
import { Chip } from "@/components/ui/Chip";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);

  const cityName = user ? CITIES.find((c) => c.id === user.city)?.name ?? user.city : "";

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
            Profile
          </Text>
          <Pressable
            onPress={() => router.push("/(app)/(profile)/settings")}
            className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
          >
            <Ionicons name="settings-outline" size={22} color="#737373" />
          </Pressable>
        </View>

        {user ? (
          <View className="px-5">
            {/* Profile Photo + Name */}
            <View className="items-center mb-6">
              <View className="relative">
                <Image
                  source={{ uri: user.photos[0]?.uri ?? "https://via.placeholder.com/150" }}
                  style={{ width: 120, height: 120, borderRadius: 60 }}
                  contentFit="cover"
                />
                {user.isVerified && (
                  <View className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-blue-500 items-center justify-center border-3 border-white">
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text className="text-2xl font-bold text-neutral-900 dark:text-white mt-3">
                {user.firstName}, {user.age}
              </Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Ionicons name="location" size={14} color="#A3A3A3" />
                <Text className="text-sm text-neutral-500">{cityName}</Text>
              </View>
            </View>

            {/* Profile Completion */}
            <View className="bg-primary-50 rounded-card p-4 mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-primary-700">
                  Profile Strength
                </Text>
                <Text className="text-sm font-bold text-primary-500">
                  {Math.min(
                    100,
                    (user.photos.length * 15) +
                      (user.prompts.length * 10) +
                      (user.interests.length * 3) +
                      (user.bio ? 10 : 0)
                  )}%
                </Text>
              </View>
              <View className="h-2 bg-primary-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (user.photos.length * 15) +
                        (user.prompts.length * 10) +
                        (user.interests.length * 3) +
                        (user.bio ? 10 : 0)
                    )}%`,
                  }}
                />
              </View>
            </View>

            {/* Photos Grid */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                  Photos
                </Text>
                <Pressable>
                  <Text className="text-sm font-medium text-primary-500">Edit</Text>
                </Pressable>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {user.photos.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.uri }}
                    style={{ width: "31%", aspectRatio: 3 / 4, borderRadius: 12 }}
                    contentFit="cover"
                  />
                ))}
              </View>
            </View>

            {/* Prompts */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                  Prompts
                </Text>
                <Pressable>
                  <Text className="text-sm font-medium text-primary-500">Edit</Text>
                </Pressable>
              </View>
              <View className="gap-3">
                {user.prompts.map((prompt) => (
                  <View
                    key={prompt.promptId}
                    className="bg-neutral-50 dark:bg-neutral-800 rounded-card p-4"
                  >
                    <Text className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-1">
                      {prompt.promptText}
                    </Text>
                    <Text className="text-base text-neutral-900 dark:text-white">
                      {prompt.answer}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Interests */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-neutral-900 dark:text-white mb-3">
                Interests
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <Chip key={interest} label={interest} size="sm" />
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View className="gap-2 mb-8">
              {[
                { icon: "create-outline" as const, label: "Edit Profile", route: "" },
                { icon: "options-outline" as const, label: "Discovery Preferences", route: "" },
                { icon: "shield-checkmark-outline" as const, label: "Verify Profile", route: "/(app)/(profile)/verify" },
              ].map((action) => (
                <Pressable
                  key={action.label}
                  onPress={() => action.route && router.push(action.route as any)}
                  className="flex-row items-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-card"
                >
                  <Ionicons name={action.icon} size={22} color="#FF6B35" />
                  <Text className="text-base text-neutral-900 dark:text-white ml-3 flex-1">
                    {action.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#A3A3A3" />
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-base text-neutral-500">No profile data</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
