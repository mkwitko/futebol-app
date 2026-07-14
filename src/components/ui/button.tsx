import { ActivityIndicator, Pressable, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/theme";
import { Text } from "./text";

export type ButtonProps = PressableProps & {
  children: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

/** Botão primário do app — alvo de toque ≥ 44pt, feedback de pressed via NativeWind. */
export function Button({
  children,
  loading = false,
  variant = "primary",
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "min-h-[44px] flex-row items-center justify-center rounded-xl px-5 py-3 active:opacity-80",
        variant === "primary" && "bg-primary",
        variant === "secondary" && "border border-line bg-surface",
        isDisabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.bg : colors.ink} />
      ) : (
        <Text
          className={cn(
            "font-body-semibold text-base",
            variant === "primary" ? "text-bg" : "text-ink",
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
