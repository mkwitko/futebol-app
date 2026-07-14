import { Pressable, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export type StepperProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

/** Campo numérico com +/- — usado para slots e ratings (0-99). */
export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  className,
}: StepperProps) {
  const canDecrement = value - step >= min;
  const canIncrement = value + step <= max;

  return (
    <View className={cn("gap-1.5", className)}>
      {label ? <Text className="font-body-medium text-sm text-muted">{label}</Text> : null}
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Diminuir"
          disabled={!canDecrement}
          onPress={() => onChange(Math.max(min, value - step))}
          className={cn(
            "h-11 w-11 items-center justify-center rounded-lg bg-surface-up active:opacity-70",
            !canDecrement && "opacity-40",
          )}
        >
          <Text className="font-display text-xl text-ink">–</Text>
        </Pressable>

        <Text
          className="min-w-[44px] text-center font-display text-2xl text-ink"
          accessibilityLabel={label ? `${label}: ${value}` : `${value}`}
        >
          {value}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aumentar"
          disabled={!canIncrement}
          onPress={() => onChange(Math.min(max, value + step))}
          className={cn(
            "h-11 w-11 items-center justify-center rounded-lg bg-surface-up active:opacity-70",
            !canIncrement && "opacity-40",
          )}
        >
          <Text className="font-display text-xl text-ink">+</Text>
        </Pressable>
      </View>
    </View>
  );
}
