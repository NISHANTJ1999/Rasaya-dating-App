import { View, Text, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function PhoneLoginScreen() {
  const [phone, setPhone] = useState("");

  const isValid = phone.length === 10;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <View className="flex-1 px-6">
        {/* Decorative gradient blobs */}
        <View
          pointerEvents="none"
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full overflow-hidden opacity-30"
        >
          <LinearGradient
            colors={["#FF6B35", "#EC4899"]}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
        <View
          pointerEvents="none"
          className="absolute top-40 -left-24 w-60 h-60 rounded-full overflow-hidden opacity-20"
        >
          <LinearGradient
            colors={["#7C3AED", "#EC4899"]}
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        {/* Header with 3D back button */}
        <View className="py-4">
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 items-center justify-center rounded-2xl bg-white dark:bg-neutral-800"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>
        </View>

        {/* Content */}
        <View className="mt-4">
          {/* Icon badge */}
          <Animated.View
            entering={FadeIn.delay(50).duration(500)}
            className="mb-6"
          >
            <LinearGradient
              colors={["#FF8555", "#FF6B35", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                ...Platform.select({
                  ios: {
                    shadowColor: "#FF6B35",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 14,
                  },
                  android: { elevation: 8 },
                }),
              }}
            >
              <LinearGradient
                pointerEvents="none"
                colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }}
              />
              <Ionicons name="call" size={28} color="#fff" />
            </LinearGradient>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(100).duration(500)}
            className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-2"
            style={{ letterSpacing: -0.5 }}
          >
            What's your{"\n"}phone number?
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(200).duration(500)}
            className="text-base text-neutral-500 dark:text-neutral-400 mb-8"
          >
            We'll send you a verification code to confirm your identity.
          </Animated.Text>

          {/* Phone Input - 3D card */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            className="flex-row items-center gap-3"
          >
            <LinearGradient
              colors={["#FF6B35", "#EC4899", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 18,
                padding: 2,
                ...Platform.select({
                  ios: {
                    shadowColor: "#7C3AED",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                  },
                  android: { elevation: 4 },
                }),
              }}
            >
              <View
                className="px-4 py-4 bg-white dark:bg-neutral-800"
                style={{ borderRadius: 16 }}
              >
                <Text className="text-base font-bold text-neutral-900 dark:text-white">
                  +91
                </Text>
              </View>
            </LinearGradient>
            <View className="flex-1">
              <Input
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                maxLength={10}
                autoFocus
              />
            </View>
          </Animated.View>

          {/* Trust badges */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            className="flex-row items-center gap-2 mt-6"
          >
            <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10">
              <Ionicons name="shield-checkmark" size={14} color="#FF6B35" />
              <Text className="text-xs font-semibold text-primary-600">Secure</Text>
            </View>
            <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10">
              <Ionicons name="flash" size={14} color="#7C3AED" />
              <Text className="text-xs font-semibold text-violet-600">Fast OTP</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom */}
        <View className="mt-auto pb-8">
          <Button
            title="Send Verification Code"
            onPress={() => router.push("/(auth)/otp-verify")}
            disabled={!isValid}
            variant="gradient"
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
