import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/auth/use-auth";
import { GoogleSignInCancelledError, isGoogleSignInConfigured } from "@/lib/auth/google";

/**
 * Botão "Entrar com Google" — config-gated (ver `.env.example` +
 * `src/lib/auth/google.ts`). Sem os client IDs OAuth configurados, fica
 * desabilitado com um aviso "em breve" (o app continua 100% usável sem
 * login Google, inclusive no Expo Go, sem exigir build nativo). Configurado,
 * dispara o fluxo nativo real via `useAuth().signInWithGoogle`.
 */
export function GoogleSignInButton() {
  const { t } = useTranslation("auth");
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      if (!(error instanceof GoogleSignInCancelledError)) {
        Alert.alert(t("signIn.googleError"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isGoogleSignInConfigured) {
    return (
      <View className="gap-1">
        <Button variant="secondary" disabled testID="google-sign-in-cta">
          {t("signIn.googleButton")}
        </Button>
        <Text variant="muted" className="text-center text-xs">
          {t("signIn.googleComingSoon")}
        </Text>
      </View>
    );
  }

  return (
    <Button
      variant="secondary"
      testID="google-sign-in-cta"
      onPress={() => void onPress()}
      loading={loading}
    >
      {t("signIn.googleButton")}
    </Button>
  );
}
