import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

export function ScreenContainer({
  children,
  className,
  scroll = true,
  background,
}: {
  children: ReactNode;
  className?: string;
  scroll?: boolean;
  /** Backdrop opcional (ex.: `StadiumBackground`) — renderizado atrás do conteúdo, cobrindo a tela toda. */
  background?: ReactNode;
}) {
  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn("flex-grow gap-6 p-6", className)}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      {background ? (
        <View className="absolute inset-0" pointerEvents="none">
          {background}
        </View>
      ) : null}
      <KeyboardAvoidingView
        className="flex-1"
        // iOS: "padding" empurra o conteúdo. Android: `windowSoftInputMode`
        // já é "adjustResize" por padrão (ver `app.config.ts`), mas o
        // edge-to-edge obrigatório desde o Android 15/SDK 57 (status bar
        // translúcida) quebra esse resize automático — o próprio
        // `@expo/config-plugins` (WindowSoftInputMode) avisa que nesse caso
        // é preciso um `KeyboardAvoidingView` de verdade. "height" resolve:
        // sem ele, o teclado cobria os inputs no fim do formulário no Android.
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
