import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/lib/stores/auth-store";

const OTP_LENGTH = 6;

export default function OTPVerifyScreen() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { setAuthenticated } = useAuthStore();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every((d) => d !== "") && newOtp.join("").length === OTP_LENGTH) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (_code: string) => {
    setIsVerifying(true);
    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAuthenticated(true);
    setIsVerifying(false);
    router.replace("/(onboarding)/name");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="flex-1 px-6">
        {/* Header */}
        <Pressable onPress={() => router.back()} className="py-4">
          <Ionicons name="arrow-back" size={24} color="#171717" />
        </Pressable>

        {/* Content */}
        <View className="mt-6">
          <Text className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Enter the code
          </Text>
          <Text className="text-base text-neutral-500 mb-8">
            We sent a 6-digit code to your phone number.
          </Text>

          {/* OTP Input */}
          <View className="flex-row justify-between gap-2 mb-6">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputRefs.current[i] = ref;
                }}
                value={otp[i]}
                onChangeText={(text) => handleChange(text.slice(-1), i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={i === 0}
                className={`flex-1 h-14 text-center text-xl font-bold rounded-button bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white ${
                  otp[i] ? "border-2 border-primary-500" : "border-2 border-transparent"
                }`}
              />
            ))}
          </View>

          {/* Timer / Resend */}
          <View className="items-center">
            {timer > 0 ? (
              <Text className="text-sm text-neutral-500">
                Resend code in {timer}s
              </Text>
            ) : (
              <Pressable onPress={() => setTimer(30)}>
                <Text className="text-sm font-semibold text-primary-500">
                  Resend Code
                </Text>
              </Pressable>
            )}
          </View>

          {isVerifying && (
            <View className="items-center mt-8">
              <Text className="text-base text-neutral-500">Verifying...</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
