import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("rounded-2xl border border-line bg-surface p-4", className)}
      {...props}
    />
  );
}
