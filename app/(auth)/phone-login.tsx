import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function PhoneLoginScreen() {
  const [phone, setPhone] = useState("");

  const isValid = phone.length === 10;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="flex-1 px-6">
        {/* Header */}
        <Pressable onPress={() => router.back()} className="py-4">
          <Ionicons name="arrow-back" size={24} color="#171717" />
        </Pressable>

        {/* Decorative gradient circle */}
        <View
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full overflow-hidden opacity-20"
          pointerEvents="none"
        >
          <LinearGradient
            colors={["#FF6B35", "#7C3AED"]}
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        {/* Content */}
        <View className="mt-6">
          <Animated.Text
            entering={FadeInDown.delay(100).duration(500)}
            className="text-3xl font-bold text-neutral-900 dark:text-white mb-2"
          >
            What's your{"\n"}phone number?
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(200).duration(500)}
            className="text-base text-neutral-500 mb-8"
          >
            We'll send you a verification code to confirm your identity.
          </Animated.Text>

          {/* Phone Input */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            className="flex-row items-center gap-3"
          >
            <LinearGradient
              colors={["#FF6B35", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-button p-[1.5px]"
            >
              <View className="px-4 py-3 bg-white dark:bg-neutral-800 rounded-button">
                <Text className="text-base font-medium text-neutral-900 dark:text-white">
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
        </View>

        {/* Bottom */}
        <View className="mt-auto pb-8">
          <Button
            title="Send Verification Code"
            onPress={() => router.push("/(auth)/otp-verify")}
            disabled={!isValid}
            variant="gradient"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
