import { View, type ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  intensity?: number;
  className?: string;
  style?: ViewStyle;
}

export function GlassCard({
  children,
  intensity = 40,
  className = "",
  style,
}: GlassCardProps) {
  // expo-blur works reliably on iOS; on Android/web fall back to a semi-transparent bg
  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={intensity}
        tint="light"
        className={`overflow-hidden rounded-2xl border border-white/20 ${className}`}
        style={style}
      >
        <View className="bg-white/10">{children}</View>
      </BlurView>
    );
  }

  return (
    <View
      className={`overflow-hidden rounded-2xl border border-white/20 bg-white/15 ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
