import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

export type SkeletonProps = {
  className?: string;
};

/** Placeholder de carregamento — pulso sutil em `surface-up`, respeita "reduzir movimento". */
export function Skeleton({ className }: SkeletonProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 0.6 : 0.4);

  useEffect(() => {
    if (reducedMotion) return;
    opacity.value = withRepeat(withTiming(0.85, { duration: 700 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity, reducedMotion]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={style}
      className={cn("rounded-xl bg-surface-up", className)}
    />
  );
}
