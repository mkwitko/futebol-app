import { Pressable, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export type ChipProps = Omit<PressableProps, "children"> & {
  label: string;
  selected?: boolean;
};

/**
 * Pill selecionável (toggle) — ex.: posição secundária, filtro de lista.
 * Visualmente compacta; `hitSlop` garante alvo de toque ≥ 44pt sem inflar o
 * chip.
 */
export function Chip({ label, selected = false, className, disabled, ...props }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      hitSlop={8}
      className={cn(
        "min-h-[36px] flex-row items-center justify-center rounded-full border px-3.5 py-2 active:opacity-80",
        selected ? "border-primary bg-primary/15" : "border-line bg-surface",
        disabled && "opacity-50",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <Text
        className={cn(
          "font-body-medium text-sm",
          selected ? "text-primary" : "text-ink",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
