import { View, Text, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
} from "react-native-reanimated";
import { AnimatedGradient } from "@/components/ui/AnimatedGradient";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

const { height, width } = Dimensions.get("window");

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

/** Soft blurred blob orbs for depth */
function AmbientBlob({
  top,
  left,
  size,
  color,
  delay,
}: {
  top: number;
  left: number;
  size: number;
  color: string;
  delay: number;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, [scale, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.35,
        },
        style,
      ]}
    />
  );
}

export default function WelcomeScreen() {
  const tilt = useSharedValue(0);
  const lift = useSharedValue(0);

  useEffect(() => {
    tilt.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    lift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [tilt, lift]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${interpolate(tilt.value, [-1, 1], [-15, 15])}deg` },
      { rotateX: `${interpolate(tilt.value, [-1, 1], [6, -6])}deg` },
      { translateY: interpolate(lift.value, [0, 1], [0, -8]) },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(lift.value, [0, 1], [0.35, 0.2]),
    transform: [{ scaleX: interpolate(lift.value, [0, 1], [1, 0.85]) }],
  }));

  return (
    <AnimatedGradient colors={["#FF6B35", "#EC4899", "#7C3AED"]} speed={5000}>
      <SafeAreaView className="flex-1 px-6">
        {/* Ambient depth blobs */}
        <AmbientBlob top={80} left={-60} size={220} color="#FF8555" delay={0} />
        <AmbientBlob top={height * 0.35} left={width - 120} size={180} color="#A855F7" delay={1500} />
        <AmbientBlob top={height * 0.6} left={-40} size={160} color="#EC4899" delay={800} />

        {/* Floating Particles */}
        <FloatingParticle delay={0} x={15} size={6} />
        <FloatingParticle delay={800} x={35} size={8} />
        <FloatingParticle delay={1600} x={55} size={5} />
        <FloatingParticle delay={2400} x={75} size={7} />
        <FloatingParticle delay={3200} x={90} size={4} />
        <FloatingParticle delay={400} x={5} size={5} />

        {/* Top Section - Logo & Branding */}
        <View className="flex-1 items-center justify-center" style={{ minHeight: height * 0.4 }}>
          {/* 3D Logo with floating shadow */}
          <View className="items-center">
            <Animated.View entering={FadeIn.delay(200).duration(600)} style={logoStyle}>
              <LinearGradient
                colors={["#FFFFFF", "#FFE4D6", "#FFD1A8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.5)",
                  ...Platform.select({
                    ios: {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 14 },
                      shadowOpacity: 0.35,
                      shadowRadius: 22,
                    },
                    android: { elevation: 14 },
                  }),
                }}
              >
                <LinearGradient
                  pointerEvents="none"
                  colors={["rgba(255,255,255,0.6)", "rgba(255,255,255,0)"]}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 32,
                  }}
                />
                <Ionicons name="heart" size={56} color="#FF6B35" />
              </LinearGradient>
            </Animated.View>
            {/* Ground shadow */}
            <Animated.View
              style={[
                shadowStyle,
                {
                  marginTop: 14,
                  width: 80,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "rgba(0,0,0,0.5)",
                },
              ]}
            />
          </View>

          <Animated.Text
            entering={FadeInDown.delay(400).duration(600).springify()}
            className="text-6xl font-extrabold text-white mt-4 mb-3"
            style={{
              letterSpacing: -1,
              textShadowColor: "rgba(0,0,0,0.25)",
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 12,
            }}
          >
            Rasaya
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(600).duration(600)}
            className="text-lg text-white/95 text-center leading-7"
            style={{
              textShadowColor: "rgba(0,0,0,0.2)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            }}
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
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <GlassCard className="px-4 py-1.5">
                <Text className="text-sm font-semibold text-white">{city}</Text>
              </GlassCard>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Bottom Section - Auth Buttons */}
        <Animated.View
          entering={FadeInDown.delay(1200).duration(600)}
          className="pb-8 gap-4"
        >
          <Button
            title="Continue with Phone"
            onPress={() => router.push("/(auth)/phone-login")}
            variant="gradient"
            icon="call-outline"
            size="lg"
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                title="Google"
                onPress={() => router.push("/(auth)/phone-login")}
                variant="secondary"
                icon="logo-google"
              />
            </View>
            <View className="flex-1">
              <Button
                title="Apple"
                onPress={() => router.push("/(auth)/phone-login")}
                variant="secondary"
                icon="logo-apple"
              />
            </View>
          </View>
          <Text className="text-xs text-white/80 text-center mt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </SafeAreaView>
    </AnimatedGradient>
  );
}
