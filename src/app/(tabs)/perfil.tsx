import Constants from "expo-constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { PlayerCard } from "@/components/players/player-card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/auth/use-auth";

/** Overall neutro (nem bronze nem ouro) — placeholder até a carreira real (Fase 1). */
const TEASER_OVERALL = 60;

/** Perfil — dados do usuário logado, sair da conta e teaser do próprio PlayerCard. */
export default function PerfilScreen() {
  const { t } = useTranslation("common");
  const { user, signOut } = useAuth();
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
      <View className="flex-row items-center gap-4">
        <Avatar name={user?.name ?? "?"} size="lg" />
        <View className="flex-1 gap-0.5">
          <Text variant="display" className="text-xl" numberOfLines={1}>
            {user?.name}
          </Text>
          <Text variant="muted" numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      <Divider />

      <View className="gap-3">
        <Text variant="display" className="text-lg">
          {t("profile.playerCardTitle")}
        </Text>
        <PlayerCard name={user?.name ?? ""} position="atacante" overall={TEASER_OVERALL} variant="full" />
        <Text variant="muted" className="text-center text-sm">
          {t("profile.playerCardTeaser")}
        </Text>
      </View>

      <Divider />

      <View className="gap-3">
        <Button
          testID="profile-sign-out"
          variant="secondary"
          onPress={() => void handleSignOut()}
          loading={signingOut}
        >
          {t("actions.signOut")}
        </Button>
        <Text variant="muted" className="text-center text-xs">
          {t("profile.version", { version: appVersion })}
        </Text>
      </View>
    </ScreenContainer>
  );
}
