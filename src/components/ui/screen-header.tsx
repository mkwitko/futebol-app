import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./text";

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  trailing?: ReactNode;
};

/** Cabeçalho de tela in-content — título (Saira Condensed) + voltar/trailing opcionais. */
export function ScreenHeader({ title, subtitle, onBack, trailing }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center gap-3">
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-up"
        >
          <Text className="font-display text-2xl text-ink">‹</Text>
        </Pressable>
      ) : null}
      <View className="flex-1 gap-0.5">
        <Text variant="display" className="text-2xl" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
