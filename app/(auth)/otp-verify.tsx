import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { useAuthStore } from "@/lib/stores/auth-store";

const OTP_LENGTH = 6;

function AnimatedOTPBox({
  value,
  index,
  inputRef,
  onChange,
  onKeyPress,
}: {
  value: string;
  index: number;
  inputRef: (ref: TextInput | null) => void;
  onChange: (text: string, index: number) => void;
  onKeyPress: (key: string, index: number) => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSequence(
        withSpring(1.1, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [value, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(200 + index * 60).duration(400)}
      style={animStyle}
      className="flex-1"
    >
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.slice(-1), index)}
        onKeyPress={({ nativeEvent }) => onKeyPress(nativeEvent.key, index)}
        keyboardType="number-pad"
        maxLength={1}
        autoFocus={index === 0}
        className={`h-14 text-center text-xl font-bold rounded-button text-neutral-900 dark:text-white ${
          value
            ? "bg-primary-50 dark:bg-violet-900/30 border-2 border-primary-500"
            : "bg-neutral-100 dark:bg-neutral-800 border-2 border-transparent"
        }`}
        style={
          value
            ? {
                shadowColor: "#FF6B35",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }
            : undefined
        }
      />
    </Animated.View>
  );
}

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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          <Animated.Text
            entering={FadeInDown.delay(100).duration(500)}
            className="text-3xl font-bold text-neutral-900 dark:text-white mb-2"
          >
            Enter the code
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(200).duration(500)}
            className="text-base text-neutral-500 mb-8"
          >
            We sent a 6-digit code to your phone number.
          </Animated.Text>

          {/* OTP Input */}
          <View className="flex-row gap-2 mb-6">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <AnimatedOTPBox
                key={i}
                value={otp[i]}
                index={i}
                inputRef={(ref) => { inputRefs.current[i] = ref; }}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
              />
            ))}
          </View>

          {/* Timer / Resend */}
          <Animated.View
            entering={FadeIn.delay(600).duration(400)}
            className="items-center"
          >
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
          </Animated.View>

          {isVerifying && (
            <Animated.View
              entering={FadeIn.duration(300)}
              className="items-center mt-8"
            >
              <Text className="text-base font-medium text-primary-500">
                Verifying...
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
