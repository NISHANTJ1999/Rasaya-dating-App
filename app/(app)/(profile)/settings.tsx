import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/lib/stores/auth-store";

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
}

function SettingsItem({ icon, label, onPress, color = "#171717", showChevron = true }: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-5 py-4 active:bg-neutral-50 dark:active:bg-neutral-800"
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text
        className="text-base ml-3 flex-1"
        style={{ color }}
      >
        {label}
      </Text>
      {showChevron && (
        <Ionicons name="chevron-forward" size={18} color="#A3A3A3" />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your profile and all data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="#171717" />
        </Pressable>
        <Text className="text-xl font-bold text-neutral-900 dark:text-white">
          Settings
        </Text>
      </View>

      <ScrollView>
        {/* Account */}
        <View className="mt-4">
          <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wide px-5 mb-1">
            Account
          </Text>
          <SettingsItem icon="person-outline" label="Edit Profile" onPress={() => {}} />
          <SettingsItem icon="options-outline" label="Discovery Preferences" onPress={() => {}} />
          <SettingsItem icon="notifications-outline" label="Notifications" onPress={() => {}} />
        </View>

        {/* Privacy & Safety */}
        <View className="mt-6">
          <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wide px-5 mb-1">
            Privacy & Safety
          </Text>
          <SettingsItem icon="shield-checkmark-outline" label="Blocked Users" onPress={() => {}} />
          <SettingsItem icon="eye-off-outline" label="Hide Profile" onPress={() => {}} />
          <SettingsItem icon="finger-print-outline" label="Verify Profile" onPress={() => router.push("/(app)/(profile)/verify")} />
        </View>

        {/* Support */}
        <View className="mt-6">
          <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wide px-5 mb-1">
            Support
          </Text>
          <SettingsItem icon="help-circle-outline" label="Help Center" onPress={() => {}} />
          <SettingsItem icon="document-text-outline" label="Terms of Service" onPress={() => {}} />
          <SettingsItem icon="lock-closed-outline" label="Privacy Policy" onPress={() => {}} />
        </View>

        {/* Danger Zone */}
        <View className="mt-6 mb-8">
          <SettingsItem
            icon="log-out-outline"
            label="Log Out"
            onPress={handleLogout}
            color="#EF4444"
            showChevron={false}
          />
          <SettingsItem
            icon="trash-outline"
            label="Delete Account"
            onPress={handleDeleteAccount}
            color="#EF4444"
            showChevron={false}
          />
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-xs text-neutral-400">Rasaya v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
