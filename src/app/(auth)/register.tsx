import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "expo-router";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Text } from "@/components/ui/text";
import { StadiumBackground } from "@/components/ui/stadium-background";
import { AuthHero } from "@/components/auth/auth-hero";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/hooks/auth/use-auth";
import type { RegisterFormValues } from "@/schemas/auth/register.schema";

export default function RegisterScreen() {
  const { t } = useTranslation("auth");
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async ({ email, password, name, roles }: RegisterFormValues) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await register(email, password, name, roles);
      // Sucesso: guard no root layout navega automaticamente para `(drawer)`.
    } catch {
      setFormError(t("register.emailInUse"));
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
            {t("register.title")}
          </Text>
          <Text variant="muted">{t("register.subtitle")}</Text>
        </View>

        <RegisterForm onSubmit={onSubmit} submitting={submitting} formError={formError} />

        <View className="flex-row items-center justify-center gap-1">
          <Text variant="muted">{t("register.hasAccount")}</Text>
          <Link href="/(auth)/sign-in">
            <Text className="font-body-semibold text-primary">{t("register.signIn")}</Text>
          </Link>
        </View>
      </View>
    </ScreenContainer>
  );
}
