import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  bgColor?: string;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  size = 24,
  color = "#171717",
  bgColor,
  disabled = false,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`items-center justify-center rounded-full active:opacity-70 ${disabled ? "opacity-40" : ""}`}
      style={
        bgColor
          ? { backgroundColor: bgColor, width: size * 2, height: size * 2 }
          : { padding: 8 }
      }
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}
