import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "expo-router";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Text } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import { StadiumBackground } from "@/components/ui/stadium-background";
import { AuthHero } from "@/components/auth/auth-hero";
import { SignInForm } from "@/components/auth/sign-in-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useAuth } from "@/hooks/auth/use-auth";
import type { SignInFormValues } from "@/schemas/auth/sign-in.schema";

export default function SignInScreen() {
  const { t } = useTranslation("auth");
  const { signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async ({ email, password }: SignInFormValues) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      // Sucesso: `isAuthenticated` vira `true` e o guard no root layout
      // navega automaticamente para `(tabs)`.
    } catch {
      setFormError(t("signIn.invalidCredentials"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer background={<StadiumBackground />} className="items-center justify-center">
      <View className="w-full max-w-[420px] gap-6 rounded-3xl border border-line bg-surface/90 p-6">
        <AuthHero />

        <View className="gap-2">
          <Text variant="display" className="text-3xl">
            {t("signIn.title")}
          </Text>
          <Text variant="muted">{t("signIn.subtitle")}</Text>
        </View>

        <SignInForm onSubmit={onSubmit} submitting={submitting} formError={formError} />

        <View className="flex-row items-center gap-3">
          <Divider className="flex-1" />
          <Text variant="muted" className="text-xs uppercase tracking-wide">
            {t("signIn.orDivider")}
          </Text>
          <Divider className="flex-1" />
        </View>

        <GoogleSignInButton />

        <View className="flex-row items-center justify-center gap-1">
          <Text variant="muted">{t("signIn.noAccount")}</Text>
          <Link href="/(auth)/register">
            <Text className="font-body-semibold text-primary">{t("signIn.createAccount")}</Text>
          </Link>
        </View>
      </View>
    </ScreenContainer>
  );
}
