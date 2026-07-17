import { useEffect } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button, type ButtonVariant } from "./button";
import { Text } from "./text";

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  /** Rótulo do botão de confirmação. */
  confirmLabel: string;
  /**
   * Rótulo do botão de cancelamento. Omitido → modo aviso (só o botão de
   * confirmação, sem ação de cancelar).
   */
  cancelLabel?: string;
  /** `true` deixa o botão de confirmação com o visual `danger`. */
  destructive?: boolean;
  /** Loading no botão de confirmação (ação assíncrona em andamento). */
  loading?: boolean;
  onConfirm: () => void;
  /** Fechar sem confirmar (backdrop, botão voltar do Android, cancelar). */
  onCancel: () => void;
};

/**
 * Diálogo de confirmação/aviso centralizado — substitui `Alert.alert` do RN
 * mantendo a identidade visual do app (Modal + Reanimated, tokens do tema).
 * Sem `cancelLabel` vira um aviso de um botão só.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: reducedMotion ? 0 : 180 });
  }, [visible, progress, reducedMotion]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.6 }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
    opacity: progress.value,
  }));

  const confirmVariant: ButtonVariant = destructive ? "danger" : "primary";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center p-6">
        <Animated.View style={backdropStyle} className="absolute inset-0 bg-black">
          <Pressable
            accessibilityLabel="Fechar"
            accessibilityRole="button"
            onPress={onCancel}
            className="flex-1"
          />
        </Animated.View>

        <Animated.View
          style={cardStyle}
          className="w-full max-w-sm gap-4 rounded-3xl border border-line bg-surface p-6"
        >
          <View className="gap-2">
            <Text variant="display" className="text-xl">
              {title}
            </Text>
            {message ? <Text variant="muted">{message}</Text> : null}
          </View>

          <View className="gap-2">
            <Button variant={confirmVariant} onPress={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
            {cancelLabel ? (
              <Button variant="ghost" onPress={onCancel} disabled={loading}>
                {cancelLabel}
              </Button>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
