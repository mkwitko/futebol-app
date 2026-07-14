import { View } from "react-native";
import { cn } from "@/lib/utils";

export type DividerProps = {
  className?: string;
  /** Recuo nas pontas (ex.: dentro de um Card com padding) em vez de linha cheia. */
  inset?: boolean;
};

/** Hairline "linha de campo" — usada no lugar de bordas pesadas entre seções. */
export function Divider({ className, inset = false }: DividerProps) {
  return <View className={cn("h-px bg-line", inset && "mx-4", className)} />;
}
