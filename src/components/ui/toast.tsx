import { Pressable, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export type ToastVariant = "info" | "success" | "danger";

export type ToastProps = {
  children: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  className?: string;
};

const BAR_CLASSES: Record<ToastVariant, string> = {
  info: "bg-muted",
  success: "bg-primary",
  danger: "bg-danger",
};

/**
 * Feedback inline — banner exibido no topo do conteúdo da tela (não é um
 * portal/host global; o chamador controla a visibilidade via estado).
 */
export function Toast({ children, variant = "info", onDismiss, className }: ToastProps) {
  return (
    <View
      accessibilityRole="alert"
      className={cn(
        "flex-row items-center gap-3 overflow-hidden rounded-xl border border-line bg-surface-up py-3 pr-3",
        className,
      )}
    >
      <View className={cn("h-full w-1 self-stretch", BAR_CLASSES[variant])} />
      <Text className="flex-1 font-body text-sm text-ink">{children}</Text>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          hitSlop={8}
          onPress={onDismiss}
        >
          <Text className="font-body-semibold text-muted">✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
