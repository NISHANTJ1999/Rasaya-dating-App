import { View, Text, FlatList, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MOCK_PROFILES } from "@/lib/mock-data";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

// Simulate "people who liked you" with some mock profiles
const LIKES = MOCK_PROFILES.slice(0, 4).map((p) => ({
  ...p,
  likedPrompt: p.prompts[0]?.promptText ?? "",
  comment: p.uid === "user1" ? "Love this answer!" : undefined,
}));

export default function LikesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      {/* Header */}
      <View className="px-5 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
            Likes You
          </Text>
          <View className="bg-primary-500 px-3 py-1 rounded-full">
            <Text className="text-sm font-bold text-white">{LIKES.length}</Text>
          </View>
        </View>
        <Text className="text-sm text-neutral-500 mt-1">
          People who are interested in you
        </Text>
      </View>

      <FlatList
        data={LIKES}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <Pressable
            style={{ width: CARD_WIDTH }}
            className="rounded-card overflow-hidden bg-neutral-100 dark:bg-neutral-800"
          >
            {/* Photo */}
            <View style={{ height: CARD_WIDTH * 1.3 }} className="relative">
              <Image
                source={{ uri: item.photos[0]?.uri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.6)"]}
                className="absolute bottom-0 left-0 right-0 p-3 pt-8"
              >
                <Text className="text-base font-bold text-white">
                  {item.firstName}, {item.age}
                </Text>
              </LinearGradient>

              {/* Like indicator */}
              <View className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary-500 items-center justify-center">
                <Ionicons name="heart" size={16} color="#FFFFFF" />
              </View>
            </View>

            {/* What they liked */}
            <View className="p-3">
              <Text className="text-xs text-neutral-500" numberOfLines={1}>
                Liked your prompt
              </Text>
              {item.comment && (
                <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5" numberOfLines={2}>
                  "{item.comment}"
                </Text>
              )}
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
