import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export type CardProps = ViewProps & {
  /** Superfície elevada (`surface-up`) — usar para destacar dentro de outro Card. */
  elevated?: boolean;
};

export function Card({ className, elevated = false, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-2xl border border-line p-4",
        elevated ? "bg-surface-up" : "bg-surface",
        className,
      )}
      {...props}
    />
  );
}
