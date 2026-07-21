import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Divider } from "@/components/ui/divider";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { colors } from "@/lib/theme";

/** Config — idioma e sobre o app. (Sair da conta fica na sidebar.) */
export default function ConfigScreen() {
  const { t } = useTranslation("common");

  const appVersion = Constants.expoConfig?.version ?? "—";

  return (
    <ScreenContainer className="gap-6" edges={["bottom"]}>
      <ScreenHeader title={t("nav.config")} />

      <View className="gap-3">
        <Text variant="display" className="text-lg">
          {t("config.languageLabel")}
        </Text>
        <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4">
          <Ionicons name="language-outline" size={22} color={colors.muted} />
          <Text className="flex-1">{t("config.languageValue")}</Text>
        </View>
      </View>

      <Divider />

      <View className="gap-1">
        <Text variant="display" className="text-lg">
          {t("config.aboutLabel")}
        </Text>
        <Text className="font-body-medium">{t("app.name")}</Text>
        <Text variant="muted">{t("app.tagline")}</Text>
        <Text variant="muted" className="text-xs">
          {t("profile.version", { version: appVersion })}
        </Text>
      </View>
    </ScreenContainer>
  );
}
