import { View, Text, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { AnimatedGradient } from "@/components/ui/AnimatedGradient";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

const { height } = Dimensions.get("window");

function FloatingParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-height * 0.6, { duration: 6000 + Math.random() * 3000, easing: Easing.linear }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000 }),
          withTiming(0, { duration: 4000 })
        ),
        -1,
        false
      )
    );
  }, [delay, translateY, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: 0,
          left: `${x}%` as unknown as number,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "rgba(255,255,255,0.3)",
        },
        style,
      ]}
    />
  );
}

export default function WelcomeScreen() {
  const logoGlow = useSharedValue(0.3);

  useEffect(() => {
    logoGlow.value = withRepeat(
      withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [logoGlow]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: logoGlow.value,
  }));

  return (
    <AnimatedGradient colors={["#FF6B35", "#EC4899", "#7C3AED"]} speed={5000}>
      <SafeAreaView className="flex-1 px-6">
        {/* Floating Particles */}
        <FloatingParticle delay={0} x={15} size={6} />
        <FloatingParticle delay={800} x={35} size={8} />
        <FloatingParticle delay={1600} x={55} size={5} />
        <FloatingParticle delay={2400} x={75} size={7} />
        <FloatingParticle delay={3200} x={90} size={4} />
        <FloatingParticle delay={400} x={5} size={5} />

        {/* Top Section - Logo & Branding */}
        <View className="flex-1 items-center justify-center" style={{ minHeight: height * 0.4 }}>
          <Animated.View
            entering={FadeIn.delay(200).duration(600)}
            style={[
              {
                shadowColor: "#FFFFFF",
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 20,
                elevation: 8,
              },
              glowStyle,
            ]}
          >
            <GlassCard intensity={50} className="w-24 h-24 items-center justify-center">
              <View className="items-center justify-center w-full h-full">
                <Ionicons name="heart" size={48} color="#FFFFFF" />
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(400).duration(600).springify()}
            className="text-5xl font-bold text-white mt-6 mb-3"
            style={{
              textShadowColor: "rgba(0,0,0,0.2)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
            }}
          >
            Rasaya
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(600).duration(600)}
            className="text-lg text-white/90 text-center leading-7"
          >
            Find your essence.{"\n"}Connect with people in your city.
          </Animated.Text>
        </View>

        {/* City Tags - Glassmorphism chips */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          className="flex-row flex-wrap justify-center gap-2 mb-8"
        >
          {["Pune", "Mumbai", "Bangalore", "Delhi", "Hyderabad"].map((city, i) => (
            <Animated.View
              key={city}
              entering={FadeIn.delay(900 + i * 100).duration(400)}
            >
              <GlassCard className="px-4 py-1.5">
                <Text className="text-sm font-medium text-white">{city}</Text>
              </GlassCard>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Bottom Section - Auth Buttons */}
        <Animated.View
          entering={FadeInDown.delay(1200).duration(600)}
          className="pb-8 gap-3"
        >
          <Button
            title="Continue with Phone"
            onPress={() => router.push("/(auth)/phone-login")}
            variant="gradient"
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
        </Animated.View>
      </SafeAreaView>
    </AnimatedGradient>
  );
}
