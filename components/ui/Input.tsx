import { TextInput, View, Text, Platform } from "react-native";
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
      <View
        style={
          isFocused
            ? Platform.select({
                ios: {
                  shadowColor: "#FF6B35",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.2,
                  shadowRadius: 14,
                },
                android: { elevation: 4, borderRadius: 18 },
              })
            : undefined
        }
      >
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
          selectionColor="#FF6B35"
          cursorColor="#FF6B35"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-5 py-4 text-base font-medium rounded-button bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white ${
            isFocused
              ? "border-2 border-primary-500"
              : error
                ? "border-2 border-red-500"
                : "border-2 border-neutral-200 dark:border-neutral-700"
          } ${multiline ? "min-h-[100px]" : ""}`}
          style={multiline ? { textAlignVertical: "top" } : undefined}
        />
      </View>
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
