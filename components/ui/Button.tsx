import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated from "react-native-reanimated";
import { useScaleOnPress } from "@/lib/animations";

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
  const { animatedStyle, onPressIn, onPressOut } = useScaleOnPress(0.97);

  const widthClass = fullWidth ? "w-full" : "";

  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-3.5",
    lg: "px-8 py-4",
  };

  const variantClasses = {
    primary: "bg-primary-500",
    secondary: "bg-neutral-900 dark:bg-white",
    outline: "border-2 border-neutral-300 dark:border-neutral-600",
    ghost: "",
    gradient: "",
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        className={`font-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]}`}
      >
        {title}
      </Text>
    </View>
  );

  if (variant === "gradient") {
    return (
      <Animated.View style={animatedStyle} className={widthClass}>
        <Pressable
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={disabled || loading}
        >
          <LinearGradient
            colors={["#FF6B35", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className={`flex-row items-center justify-center rounded-button ${sizeClasses[size]} ${disabled ? "opacity-50" : ""}`}
            style={{
              shadowColor: "#FF6B35",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {content}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle} className={widthClass}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        className={`flex-row items-center justify-center rounded-button ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? "opacity-50" : ""}`}
        style={
          variant === "primary"
            ? {
                shadowColor: "#FF6B35",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              }
            : undefined
        }
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}
