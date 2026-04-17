import { Pressable, Text, ActivityIndicator, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated from "react-native-reanimated";
import { use3DPress } from "@/lib/animations";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const DEPTH = 6;
const RADIUS = 18;

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  loading = false,
  fullWidth = true,
}: ButtonProps) {
  const { faceStyle, onPressIn, onPressOut } = use3DPress(DEPTH);

  const widthClass = fullWidth ? "w-full" : "";

  const sizeClasses = {
    sm: "px-4 py-2.5",
    md: "px-6 py-4",
    lg: "px-8 py-5",
  };

  const variantClasses = {
    primary: "bg-primary-500",
    secondary: "bg-neutral-900 dark:bg-white",
    outline: "bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700",
    ghost: "",
    gradient: "",
  };

  // Colors for the 3D "base" block beneath each variant
  const baseColors: Record<string, string> = {
    primary: "#C2410C",
    secondary: "#000000",
    outline: "#D4D4D4",
    ghost: "transparent",
    gradient: "#5B21B6",
  };

  const textVariantClasses = {
    primary: "text-white",
    secondary: "text-white dark:text-neutral-900",
    outline: "text-neutral-900 dark:text-white",
    ghost: "text-neutral-900 dark:text-white",
    gradient: "text-white",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizes = { sm: 16, md: 20, lg: 24 };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const content = loading ? (
    <ActivityIndicator
      color={variant === "outline" || variant === "ghost" ? "#FF6B35" : "#FFFFFF"}
      size="small"
    />
  ) : (
    <View className="flex-row items-center gap-2">
      {icon && (
        <Ionicons
          name={icon}
          size={iconSizes[size]}
          color={
            variant === "outline" || variant === "ghost" ? "#171717" : "#FFFFFF"
          }
        />
      )}
      <Text
        className={`font-bold tracking-wide ${textVariantClasses[variant]} ${textSizeClasses[size]}`}
        style={{
          textShadowColor:
            variant === "primary" || variant === "gradient"
              ? "rgba(0,0,0,0.2)"
              : "transparent",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}
      >
        {title}
      </Text>
    </View>
  );

  // Gloss highlight gradient — softer than a hard half-block, looks clean on both platforms
  const gloss = (
    <LinearGradient
      pointerEvents="none"
      colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0.06)", "rgba(255,255,255,0)"]}
      locations={[0, 0.55, 1]}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: RADIUS,
      }}
    />
  );

  // Shadow lives on the colored face itself so Android elevation renders correctly
  const elevatedShadow = Platform.select({
    ios: {
      shadowColor: variant === "primary" || variant === "gradient" ? "#FF6B35" : "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: variant === "primary" || variant === "gradient" ? 0.35 : 0.15,
      shadowRadius: 14,
    },
    android: { elevation: 6 },
  });

  const faceInner =
    variant === "gradient" ? (
      <LinearGradient
        colors={["#FF8555", "#FF6B35", "#EC4899", "#7C3AED"]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[{ borderRadius: RADIUS }, elevatedShadow]}
        className={`flex-row items-center justify-center ${sizeClasses[size]} ${disabled ? "opacity-50" : ""}`}
      >
        {gloss}
        {content}
      </LinearGradient>
    ) : (
      <View
        className={`flex-row items-center justify-center ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? "opacity-50" : ""}`}
        style={[{ borderRadius: RADIUS }, elevatedShadow]}
      >
        {(variant === "primary" || variant === "secondary") && gloss}
        {content}
      </View>
    );

  if (variant === "ghost") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={`${widthClass} flex-row items-center justify-center ${sizeClasses[size]} ${disabled ? "opacity-50" : ""}`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className={widthClass} style={{ paddingBottom: DEPTH }}>
      {/* 3D base block */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: DEPTH / 2,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: RADIUS,
          backgroundColor: baseColors[variant],
          opacity: disabled ? 0.3 : 1,
        }}
      />

      {/* Face that translates down when pressed */}
      <Animated.View style={faceStyle}>
        <Pressable
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={disabled || loading}
        >
          {faceInner}
        </Pressable>
      </Animated.View>
    </View>
  );
}
