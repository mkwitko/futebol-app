import type { ReactNode } from "react";
import { useEffect } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./text";

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/**
 * Bottom sheet simples (Modal + Reanimated) para formulários curtos (criar
 * grupo, adicionar membro...). Sem dependência externa de bottom-sheet.
 */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: reducedMotion ? 0 : 220 });
  }, [visible, progress, reducedMotion]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.6 }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 40 }],
    opacity: progress.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Animated.View style={backdropStyle} className="absolute inset-0 bg-black">
          <Pressable
            accessibilityLabel="Fechar"
            accessibilityRole="button"
            onPress={onClose}
            className="flex-1"
          />
        </Animated.View>

        <Animated.View style={sheetStyle}>
          <SafeAreaView edges={["bottom"]} className="rounded-t-3xl border-t border-line bg-surface">
            <View className="items-center pt-3">
              <View className="h-1 w-10 rounded-full bg-line" />
            </View>
            <View className="gap-4 p-6">
              {title ? (
                <Text variant="display" className="text-xl">
                  {title}
                </Text>
              ) : null}
              {children}
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
