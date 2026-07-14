import type { ReactNode } from "react";
import { View } from "react-native";
import { Button } from "./button";
import { Text } from "./text";

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

/** Estado vazio — convite à ação, nunca um beco sem saída. */
export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 px-6 py-12">
      {icon ?? <Text className="text-5xl">⚽</Text>}
      <Text variant="display" className="text-center text-xl">
        {title}
      </Text>
      {description ? (
        <Text variant="muted" className="text-center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button onPress={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
