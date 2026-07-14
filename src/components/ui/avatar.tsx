import { Image } from "expo-image";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export type AvatarProps = {
  /** Nome completo — usado para gerar as iniciais do fallback. */
  name: string;
  uri?: string | null;
  size?: AvatarSize;
  className?: string;
};

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-11 w-11",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

const TEXT_SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "text-xs",
  md: "text-base",
  lg: "text-2xl",
  xl: "text-4xl",
};

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/** Avatar com foto (expo-image) ou monograma (iniciais) como fallback. */
export function Avatar({ name, uri, size = "md", className }: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        accessibilityLabel={name}
        transition={150}
        className={cn("rounded-full bg-surface-up", sizeClass, className)}
      />
    );
  }

  return (
    <View
      accessibilityLabel={name}
      className={cn(
        "items-center justify-center rounded-full border border-line bg-surface-up",
        sizeClass,
        className,
      )}
    >
      <Text className={cn("font-display text-ink", TEXT_SIZE_CLASSES[size])}>
        {initialsFrom(name)}
      </Text>
    </View>
  );
}
