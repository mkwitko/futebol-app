import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";

/**
 * Placeholder pós-login (fundação). Telas de produto (grupos, partidas,
 * presença...) chegam nas próximas tasks.
 */
export default function HomeScreen() {
  const { t } = useTranslation(["auth", "common"]);
  const { user, signOut } = useAuth();

  return (
    <ScreenContainer>
      <Card>
        <Text variant="display" className="text-2xl">
          {t("auth:home.greeting", { name: user?.name ?? "" })}
        </Text>
        <Text variant="muted">{t("auth:home.subtitle")}</Text>
      </Card>

      <View>
        <Button variant="secondary" onPress={() => void signOut()}>
          {t("common:actions.signOut")}
        </Button>
      </View>
    </ScreenContainer>
  );
}
