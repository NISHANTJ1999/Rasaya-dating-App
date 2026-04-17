import { View, Text, FlatList, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { Badge } from "@/components/ui/Badge";
import { MOCK_PROFILES } from "@/lib/mock-data";
import { useScaleOnPress } from "@/lib/animations";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const LIKES = MOCK_PROFILES.slice(0, 4).map((p) => ({
  ...p,
  likedPrompt: p.prompts[0]?.promptText ?? "",
  comment: p.uid === "user1" ? "Love this answer!" : undefined,
}));

function LikeCard({
  item,
  index,
}: {
  item: (typeof LIKES)[number];
  index: number;
}) {
  const { animatedStyle, onPressIn, onPressOut } = useScaleOnPress(0.96);

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      style={[animatedStyle, { width: CARD_WIDTH }]}
    >
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-800"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View style={{ height: CARD_WIDTH * 1.3 }} className="relative">
          <Image
            source={{ uri: item.photos[0]?.uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            className="absolute bottom-0 left-0 right-0 p-3 pt-10"
          >
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-bold text-white">
                {item.firstName}, {item.age}
              </Text>
              {item.isVerified && <Badge type="verified" size="sm" />}
              {item.iqVerified && <Badge type="iq" size="sm" />}
            </View>
          </LinearGradient>

          {/* Like indicator - gradient */}
          <View className="absolute top-2 right-2 w-8 h-8 rounded-full overflow-hidden">
            <LinearGradient
              colors={["#FF6B35", "#EC4899"]}
              style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="heart" size={16} color="#FFFFFF" />
            </LinearGradient>
          </View>
        </View>

        <View className="p-3">
          <Text className="text-xs text-neutral-500" numberOfLines={1}>
            Liked your prompt
          </Text>
          {item.comment && (
            <Text
              className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5"
              numberOfLines={2}
            >
              "{item.comment}"
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function LikesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} className="px-5 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
            Likes You
          </Text>
          <View className="rounded-full overflow-hidden">
            <LinearGradient
              colors={["#FF6B35", "#7C3AED"]}
              className="px-3 py-1"
            >
              <Text className="text-sm font-bold text-white">{LIKES.length}</Text>
            </LinearGradient>
          </View>
        </View>
        <Text className="text-sm text-neutral-500 mt-1">
          People who are interested in you
        </Text>
      </Animated.View>

      <FlatList
        data={LIKES}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        keyExtractor={(item) => item.uid}
        renderItem={({ item, index }) => <LikeCard item={item} index={index} />}
      />
    </SafeAreaView>
  );
}
