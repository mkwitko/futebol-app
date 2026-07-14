import { ActivityIndicator, Pressable, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/theme";
import { Text } from "./text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "children"> & {
  children: string;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-[44px] px-4 py-2",
  md: "min-h-[44px] px-5 py-3",
  lg: "min-h-[52px] px-6 py-4",
};

const TEXT_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary active:bg-primary-press",
  secondary: "border border-line bg-surface active:bg-surface-up",
  ghost: "bg-transparent active:bg-surface-up",
  danger: "bg-danger active:opacity-80",
};

const TEXT_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-bg",
  secondary: "text-ink",
  ghost: "text-primary",
  danger: "text-ink",
};

const SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary: colors.bg,
  secondary: colors.ink,
  ghost: colors.primary,
  danger: colors.ink,
};

/** Botão do app — alvos de toque ≥ 44pt em todos os tamanhos, feedback via NativeWind `active:`. */
export function Button({
  children,
  loading = false,
  variant = "primary",
  size = "md",
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
        "flex-row items-center justify-center gap-2 rounded-xl",
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        isDisabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER_COLOR[variant]} />
      ) : (
        <Text
          className={cn(
            "font-body-semibold",
            TEXT_SIZE_CLASSES[size],
            TEXT_VARIANT_CLASSES[variant],
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
