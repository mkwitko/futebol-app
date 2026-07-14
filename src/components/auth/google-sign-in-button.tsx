import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";

/**
 * TODO(auth-google): stub. O fluxo real precisa de
 * `@react-native-google-signin/google-signin` (código nativo + config plugin),
 * o que exige `expo prebuild` / dev client e client IDs OAuth do Google — fora
 * do escopo desta fase (fundação). O botão existe para o layout da tela de
 * login já prever o espaço; hoje só mostra um aviso de "em breve".
 */
export function GoogleSignInButton() {
  const { t } = useTranslation("auth");
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      Alert.alert(t("signIn.googleComingSoon"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" onPress={() => void onPress()} loading={loading}>
      {t("signIn.googleButton")}
    </Button>
  );
}
