import type { ReactNode } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";

export type QueryStateProps = {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage: string;
  retryLabel: string;
  onRetry: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  skeletonCount?: number;
  children: ReactNode;
};

const DEFAULT_SKELETON_COUNT = 3;

/**
 * Wrapper de loading/erro/vazio para listas alimentadas por TanStack Query —
 * usado nas 3 listas desta feature (peladas, elenco, peladas do grupo) para
 * não repetir o mesmo `if/else` três vezes. Sem `useTranslation` próprio: o
 * chamador passa as strings já traduzidas, mantendo o componente reutilizável
 * fora do módulo `groups`.
 */
export function QueryState({
  isPending,
  isError,
  isEmpty,
  errorMessage,
  retryLabel,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  skeletonCount = DEFAULT_SKELETON_COUNT,
  children,
}: QueryStateProps) {
  if (isPending) {
    return (
      <View className="gap-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View className="items-center gap-3 py-6">
        <Text variant="muted" className="text-center">
          {errorMessage}
        </Text>
        <Button variant="secondary" onPress={onRetry}>
          {retryLabel}
        </Button>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return <>{children}</>;
}
