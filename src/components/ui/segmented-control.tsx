import { Pressable, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export type SegmentOption<T extends string> = {
  label: string;
  value: T;
};

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Seletor de opções únicas em linha — ex.: time A/B, posição. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      className={cn("flex-row gap-1 rounded-xl bg-surface-up p-1", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className={cn(
              "min-h-[36px] flex-1 items-center justify-center rounded-lg px-3 py-2",
              active && "bg-primary",
            )}
          >
            <Text
              className={cn(
                "font-body-semibold text-sm",
                active ? "text-bg" : "text-muted",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
