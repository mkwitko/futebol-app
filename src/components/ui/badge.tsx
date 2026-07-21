import type { ReactNode } from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export type BadgeVariant = "neutral" | "line" | "primary" | "danger" | "bronze" | "prata" | "ouro";

const CONTAINER_CLASSES: Record<BadgeVariant, string> = {
  neutral: "border-line bg-surface-up",
  line: "border-line bg-transparent",
  primary: "border-primary bg-primary/15",
  danger: "border-danger bg-danger/15",
  bronze: "border-tier-bronze bg-tier-bronze/15",
  prata: "border-tier-prata bg-tier-prata/15",
  ouro: "border-tier-ouro bg-tier-ouro/15",
};

const TEXT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "text-muted",
  line: "text-ink",
  primary: "text-primary",
  danger: "text-danger",
  bronze: "text-tier-bronze",
  prata: "text-tier-prata",
  ouro: "text-tier-ouro",
};

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  textClassName?: string;
};

/** Pill compacta — badge de posição, tier ou status. Composable, sem lógica de domínio. */
export function Badge({ children, variant = "neutral", className, textClassName }: BadgeProps) {
  return (
    <View
      className={cn(
        // `shrink-0`: pill nunca é espremida em flex-row apertado — senão o
        // texto quebra em 2 linhas (ex.: "VOL" virava "VO"/"L").
        "shrink-0 flex-row items-center self-start rounded-full border px-2.5 py-1",
        CONTAINER_CLASSES[variant],
        className,
      )}
    >
      <Text
        numberOfLines={1}
        className={cn(
          "font-body-semibold text-xs tracking-wide",
          TEXT_CLASSES[variant],
          textClassName,
        )}
      >
        {children}
      </Text>
    </View>
  );
}
