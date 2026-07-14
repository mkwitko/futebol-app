import { forwardRef, useState } from "react";
import { TextInput, type TextInputProps, View } from "react-native";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/theme";
import { Text } from "./text";

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
};

/** Campo de texto do app — label, erro (RHF-friendly) e anel de foco visível. */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, helperText, className, onFocus, onBlur, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="font-body-medium text-sm text-muted">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "min-h-[44px] rounded-xl border border-line bg-surface px-4 py-3 font-body text-base text-ink",
          focused && "border-primary",
          error && "border-danger",
          className,
        )}
        {...props}
      />
      {error ? (
        <Text className="font-body text-sm text-danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : helperText ? (
        <Text className="font-body text-sm text-muted">{helperText}</Text>
      ) : null}
    </View>
  );
});
