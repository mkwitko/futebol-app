import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

/**
 * Hero de marca das telas de auth — logo do app + wordmark em Saira Condensed.
 */
export function AuthHero() {
  const { t } = useTranslation("common");

  return (
    <View className="items-center gap-3 pb-2 pt-6">
      <View
        className="overflow-hidden rounded-3xl border border-line bg-surface-up"
        style={{ width: 88, height: 88 }}
      >
        <Image
          source={require("../../../assets/icon.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      </View>
      <Text className="text-center font-display-bold text-4xl uppercase tracking-widest text-ink">
        {t("app.name")}
      </Text>
      <Text className="font-body-medium text-xs uppercase tracking-wide text-muted">
        {t("app.tagline")}
      </Text>
    </View>
  );
}
