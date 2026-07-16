import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/auth/use-auth";
import { colors } from "@/lib/theme";

/** Config — idioma, sobre o app e sair da conta. */
export default function ConfigScreen() {
  const { t } = useTranslation("common");
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? "—";

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      // Sucesso: `isAuthenticated` vira `false` e o guard no root layout
      // navega automaticamente para `(auth)`.
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScreenContainer className="gap-6">
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

      <Divider />

      <Button
        testID="config-sign-out"
        variant="secondary"
        onPress={() => void handleSignOut()}
        loading={signingOut}
      >
        {t("actions.signOut")}
      </Button>
    </ScreenContainer>
  );
}
