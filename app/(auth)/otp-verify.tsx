import { View, Text, TextInput, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  const lift = useSharedValue(0);

  useEffect(() => {
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSequence(
        withSpring(1.12, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10 })
      );
      lift.value = withSpring(1, { damping: 12, stiffness: 200 });
    } else {
      lift.value = withSpring(0, { damping: 12, stiffness: 200 });
    }
  }, [value, scale, lift]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: -lift.value * 4 },
    ],
  }));

  const filled = !!value;

  return (
    <Animated.View
      entering={FadeIn.delay(200 + index * 60).duration(400)}
      style={[animStyle, { flex: 1, paddingBottom: 4 }]}
    >
      {/* 3D base */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 4,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 16,
          backgroundColor: filled ? "#C2410C" : "#D4D4D4",
          opacity: filled ? 0.85 : 0.5,
        }}
      />

      {/* Face — bg + elevation on this view, gradient layered absolutely so Android shadow isn't clipped */}
      <View
        style={{
          height: 60,
          borderRadius: 16,
          backgroundColor: "#FFFFFF",
          ...Platform.select({
            ios: {
              shadowColor: filled ? "#FF6B35" : "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: filled ? 0.35 : 0.1,
              shadowRadius: 10,
            },
            android: { elevation: filled ? 5 : 2 },
          }),
        }}
      >
        {filled && (
          <>
            <LinearGradient
              pointerEvents="none"
              colors={["#FF8555", "#FF6B35", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 16,
              }}
            />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 16,
              }}
            />
          </>
        )}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(text) => onChange(text.slice(-1), index)}
          onKeyPress={({ nativeEvent }) => onKeyPress(nativeEvent.key, index)}
          keyboardType="number-pad"
          autoFocus={index === 0}
          maxLength={1}
          selectionColor="#FF6B35"
          className={`h-[60px] text-center text-2xl font-extrabold ${filled ? "text-white" : "text-neutral-900 dark:text-white"}`}
          style={{ borderRadius: 16 }}
        />
      </View>
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
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <View className="flex-1 px-6">
        {/* Decorative blob */}
        <View
          pointerEvents="none"
          className="absolute -top-10 -right-10 w-72 h-72 rounded-full overflow-hidden opacity-25"
        >
          <LinearGradient
            colors={["#EC4899", "#7C3AED"]}
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        {/* Header */}
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
          {/* Shield badge */}
          <Animated.View entering={FadeIn.delay(50).duration(500)} className="mb-6">
            <LinearGradient
              colors={["#A78BFA", "#7C3AED", "#EC4899"]}
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
                    shadowColor: "#7C3AED",
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
              <Ionicons name="shield-checkmark" size={28} color="#fff" />
            </LinearGradient>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(100).duration(500)}
            className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-2"
            style={{ letterSpacing: -0.5 }}
          >
            Enter the code
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(200).duration(500)}
            className="text-base text-neutral-500 dark:text-neutral-400 mb-10"
          >
            We sent a 6-digit code to your phone number.
          </Animated.Text>

          {/* OTP Input */}
          <View className="flex-row gap-2 mb-8">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <AnimatedOTPBox
                key={i}
                value={otp[i]}
                index={i}
                inputRef={(ref) => {
                  inputRefs.current[i] = ref;
                }}
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
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                Resend code in <Text className="font-bold text-primary-500">{timer}s</Text>
              </Text>
            ) : (
              <Pressable onPress={() => setTimer(30)}>
                <Text className="text-sm font-bold text-primary-500">
                  Resend Code
                </Text>
              </Pressable>
            )}
          </Animated.View>

          {isVerifying && (
            <Animated.View
              entering={FadeIn.duration(300)}
              className="items-center mt-10"
            >
              <View className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-500/10">
                <Ionicons name="checkmark-circle" size={18} color="#FF6B35" />
                <Text className="text-base font-bold text-primary-500">
                  Verifying...
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
