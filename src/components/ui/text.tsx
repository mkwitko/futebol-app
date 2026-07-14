import { Text as RNText, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

export type AppTextProps = TextProps & {
  variant?: "body" | "muted" | "display";
};

/**
 * Texto base do app. `variant="display"` usa Saira Condensed (placares,
 * headings); o default usa Hanken Grotesk (corpo).
 */
export function Text({ variant = "body", className, ...props }: AppTextProps) {
  return (
    <RNText
      className={cn(
        variant === "display" ? "font-display text-ink" : "font-body text-ink",
        variant === "muted" && "text-muted",
        className,
      )}
      {...props}
    />
  );
}
