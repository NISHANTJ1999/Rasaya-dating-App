import { Pressable, Text } from "react-native";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: "sm" | "md";
}

export function Chip({ label, selected = false, onPress, size = "md" }: ChipProps) {
  const sizeClasses = {
    sm: "px-3 py-1",
    md: "px-4 py-2",
  };

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
  };

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-chip ${sizeClasses[size]} ${
        selected
          ? "bg-primary-500"
          : "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
      }`}
    >
      <Text
        className={`${textSize[size]} font-medium ${
          selected ? "text-white" : "text-neutral-700 dark:text-neutral-300"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
