import { View, Text, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";

const { height } = Dimensions.get("window");

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={["#FF6B35", "#FF8A5C", "#FFB088"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 px-6">
        {/* Top Section - Logo & Branding */}
        <View className="flex-1 items-center justify-center" style={{ minHeight: height * 0.45 }}>
          <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-6">
            <Ionicons name="heart" size={48} color="#FFFFFF" />
          </View>
          <Text className="text-5xl font-bold text-white mb-3">Rasaya</Text>
          <Text className="text-lg text-white/90 text-center leading-7">
            Find your essence.{"\n"}Connect with people in your city.
          </Text>
        </View>

        {/* City Tags */}
        <View className="flex-row flex-wrap justify-center gap-2 mb-8">
          {["Pune", "Mumbai", "Bangalore", "Delhi", "Hyderabad"].map((city) => (
            <View
              key={city}
              className="px-4 py-1.5 bg-white/20 rounded-full"
            >
              <Text className="text-sm font-medium text-white">{city}</Text>
            </View>
          ))}
        </View>

        {/* Bottom Section - Auth Buttons */}
        <View className="pb-8 gap-3">
          <Button
            title="Continue with Phone"
            onPress={() => router.push("/(auth)/phone-login")}
            variant="secondary"
            icon="call-outline"
          />
          <Button
            title="Continue with Google"
            onPress={() => router.push("/(auth)/phone-login")}
            variant="outline"
            icon="logo-google"
          />
          <Button
            title="Continue with Apple"
            onPress={() => router.push("/(auth)/phone-login")}
            variant="outline"
            icon="logo-apple"
          />
          <Text className="text-xs text-white/70 text-center mt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
