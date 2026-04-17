import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useAuthStore } from "@/lib/stores/auth-store";
import { CITIES } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { useScaleOnPress } from "@/lib/animations";

function QuickAction({
  icon,
  iconColor,
  label,
  onPress,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  const { animatedStyle, onPressIn, onPressOut } = useScaleOnPress(0.98);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        className="flex-row items-center p-4 bg-white dark:bg-neutral-800 rounded-2xl"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <Text className="text-base text-neutral-900 dark:text-white ml-3 flex-1">
          {label}
        </Text>
        {trailing ?? <Ionicons name="chevron-forward" size={18} color="#A3A3A3" />}
      </Pressable>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const cityName = user ? CITIES.find((c) => c.id === user.city)?.name ?? user.city : "";

  const profileStrength = user
    ? Math.min(
        100,
        user.photos.length * 15 +
          user.prompts.length * 10 +
          user.interests.length * 3 +
          (user.bio ? 10 : 0)
      )
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gradient Header */}
        <View className="relative">
          <LinearGradient
            colors={["#FF6B35", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 180, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
          />

          {/* Settings button */}
          <Pressable
            onPress={() => router.push("/(app)/(profile)/settings")}
            className="absolute top-4 right-5 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
          </Pressable>

          <Text className="absolute top-5 left-5 text-2xl font-bold text-white">
            Profile
          </Text>

          {/* Profile Photo - overlapping the gradient */}
          {user && (
            <Animated.View
              entering={FadeIn.delay(200).duration(500)}
              className="items-center"
              style={{ marginTop: -60 }}
            >
              <View className="p-[3px] rounded-full overflow-hidden">
                <LinearGradient
                  colors={["#FF6B35", "#7C3AED"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-[3px] rounded-full"
                >
                  <Image
                    source={{ uri: user.photos[0]?.uri ?? "https://via.placeholder.com/150" }}
                    style={{ width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: "#FFFFFF" }}
                    contentFit="cover"
                  />
                </LinearGradient>
              </View>
            </Animated.View>
          )}
        </View>

        {user ? (
          <View className="px-5 -mt-2">
            {/* Name + Badges */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              className="items-center mb-6"
            >
              <View className="flex-row items-center gap-2 mt-3">
                <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {user.firstName}, {user.age}
                </Text>
                {user.isVerified && <Badge type="verified" size="md" />}
                {user.iqVerified && <Badge type="iq" size="md" />}
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Ionicons name="location" size={14} color="#A3A3A3" />
                <Text className="text-sm text-neutral-500">{cityName}</Text>
              </View>
            </Animated.View>

            {/* Profile Strength */}
            <Animated.View
              entering={FadeInDown.delay(400).duration(400)}
              className="mb-6"
            >
              <View className="bg-white dark:bg-neutral-800 rounded-2xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Profile Strength
                  </Text>
                  <Text className="text-sm font-bold text-primary-500">{profileStrength}%</Text>
                </View>
                <View className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <LinearGradient
                    colors={["#FF6B35", "#7C3AED"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: "100%", width: `${profileStrength}%`, borderRadius: 999 }}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Photos Grid */}
            <Animated.View entering={FadeInDown.delay(500).duration(400)} className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-neutral-900 dark:text-white">Photos</Text>
                <Pressable>
                  <Text className="text-sm font-medium text-primary-500">Edit</Text>
                </Pressable>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {user.photos.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.uri }}
                    style={{ width: "31%", aspectRatio: 3 / 4, borderRadius: 16 }}
                    contentFit="cover"
                  />
                ))}
              </View>
            </Animated.View>

            {/* Prompts */}
            <Animated.View entering={FadeInDown.delay(600).duration(400)} className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-neutral-900 dark:text-white">Prompts</Text>
                <Pressable>
                  <Text className="text-sm font-medium text-primary-500">Edit</Text>
                </Pressable>
              </View>
              <View className="gap-3">
                {user.prompts.map((prompt) => (
                  <View
                    key={prompt.promptId}
                    className="bg-white dark:bg-neutral-800 rounded-2xl p-4 overflow-hidden relative"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <LinearGradient
                      colors={["#FF6B35", "#7C3AED"]}
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                    />
                    <Text className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-1 ml-2">
                      {prompt.promptText}
                    </Text>
                    <Text className="text-base text-neutral-900 dark:text-white ml-2">
                      {prompt.answer}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Interests */}
            <Animated.View entering={FadeInDown.delay(700).duration(400)} className="mb-6">
              <Text className="text-base font-semibold text-neutral-900 dark:text-white mb-3">Interests</Text>
              <View className="flex-row flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <View
                    key={interest}
                    className="px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                  >
                    <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{interest}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View entering={FadeInDown.delay(800).duration(400)} className="gap-2 mb-8">
              <QuickAction
                icon="create-outline"
                iconColor="#FF6B35"
                label="Edit Profile"
                onPress={() => {}}
              />
              <QuickAction
                icon="options-outline"
                iconColor="#7C3AED"
                label="Discovery Preferences"
                onPress={() => {}}
              />
              <QuickAction
                icon="shield-checkmark-outline"
                iconColor="#3B82F6"
                label={user.isVerified ? "Verified" : "Verify Profile"}
                onPress={() => router.push("/(app)/(profile)/verify")}
                trailing={
                  user.isVerified ? (
                    <Badge type="verified" size="sm" />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#A3A3A3" />
                  )
                }
              />
              <QuickAction
                icon="bulb-outline"
                iconColor="#7C3AED"
                label={user.iqVerified ? "IQ Badge Earned" : "IQ Assessment"}
                onPress={() => router.push("/(app)/(profile)/iq-assessment")}
                trailing={
                  user.iqVerified ? (
                    <Badge type="iq" size="sm" />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#A3A3A3" />
                  )
                }
              />
            </Animated.View>
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
