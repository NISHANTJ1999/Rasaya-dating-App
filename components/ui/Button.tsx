import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
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
  const baseClasses = "flex-row items-center justify-center rounded-button";
  const widthClass = fullWidth ? "w-full" : "";

  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-3.5",
    lg: "px-8 py-4",
  };

  const variantClasses = {
    primary: "bg-primary-500 active:bg-primary-600",
    secondary: "bg-neutral-900 dark:bg-white active:bg-neutral-800 dark:active:bg-neutral-200",
    outline: "border-2 border-neutral-300 dark:border-neutral-600 active:bg-neutral-100 dark:active:bg-neutral-800",
    ghost: "active:bg-neutral-100 dark:active:bg-neutral-800",
  };

  const textVariantClasses = {
    primary: "text-white",
    secondary: "text-white dark:text-neutral-900",
    outline: "text-neutral-900 dark:text-white",
    ghost: "text-neutral-900 dark:text-white",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizes = { sm: 16, md: 20, lg: 24 };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${widthClass} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : "#FF6B35"}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && (
            <Ionicons
              name={icon}
              size={iconSizes[size]}
              color={variant === "primary" ? "#FFFFFF" : variant === "outline" || variant === "ghost" ? "#171717" : "#FFFFFF"}
            />
          )}
          <Text
            className={`font-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]}`}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
