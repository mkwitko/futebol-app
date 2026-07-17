import { Image } from "expo-image";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/lib/theme";

/**
 * Tela de carregamento full-screen com a arte de splash (full-bleed) + spinner.
 * Serve de "splash estendida" em JS: cobre a tela inteira (o splash nativo do
 * Android 12+ só mostra um ícone pequeno centralizado, limitação do SO), e
 * evita a tela cinza do SO enquanto o app resolve sessão/perfil pós-login.
 */
export function BrandedLoading() {
  return (
    <View className="flex-1 bg-bg">
      <Image
        source={require("../../../assets/splash-icon.png")}
        style={{ ...StyleSheetAbsoluteFill }}
        contentFit="cover"
      />
      <View className="absolute inset-x-0 bottom-24 items-center">
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    </View>
  );
}

const StyleSheetAbsoluteFill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
