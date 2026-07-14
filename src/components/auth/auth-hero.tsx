import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { colors } from "@/lib/theme";

/**
 * Hero de marca das telas de auth — wordmark em Saira Condensed sobre um
 * glow sutil (verde-gramado) e um motivo de "linha de campo". Único lugar
 * fora do PlayerCard que usa um gradiente — mantém o resto do app discreto.
 */
export function AuthHero() {
  const { t } = useTranslation("common");

  return (
    <View className="items-center gap-3 pb-2 pt-6">
      <LinearGradient
        pointerEvents="none"
        colors={[`${colors.primary}26`, "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", top: -32, left: -32, right: -32, height: 180 }}
      />
      <View className="h-px w-14 bg-primary" />
      <Text className="text-center font-display-bold text-4xl uppercase tracking-widest text-ink">
        {t("app.name")}
      </Text>
      <Text className="font-body-medium text-xs uppercase tracking-wide text-muted">
        {t("app.tagline")}
      </Text>
    </View>
  );
}
