import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export type ListRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  className?: string;
};

/** Linha de lista genérica — leading (avatar/ícone) + título/subtítulo + trailing (badge/valor/chevron). */
export function ListRow({ title, subtitle, leading, trailing, onPress, className }: ListRowProps) {
  const content = (
    <View className={cn("min-h-[44px] flex-row items-center gap-3 px-4 py-3", className)}>
      {leading}
      <View className="flex-1 gap-0.5">
        <Text className="font-body-medium text-base text-ink" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="muted" className="text-sm" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="active:bg-surface-up">
      {content}
    </Pressable>
  );
}
