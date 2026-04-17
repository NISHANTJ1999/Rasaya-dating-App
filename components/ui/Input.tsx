import { TextInput, View, Text } from "react-native";
import { useState } from "react";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  keyboardType?: "default" | "phone-pad" | "email-address" | "number-pad";
  maxLength?: number;
  multiline?: boolean;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  keyboardType = "default",
  maxLength,
  multiline = false,
  autoFocus = false,
  secureTextEntry = false,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A3A3A3"
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        autoFocus={autoFocus}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full px-4 py-3.5 text-base rounded-button bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white ${
          isFocused
            ? "border-2 border-primary-500"
            : error
              ? "border-2 border-red-500"
              : "border-2 border-transparent"
        } ${multiline ? "min-h-[100px] text-top" : ""}`}
        style={multiline ? { textAlignVertical: "top" } : undefined}
      />
      {error && (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      )}
      {maxLength && (
        <Text className="text-xs text-neutral-400 mt-1 text-right">
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
}
