import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Text } from "@/components/ui/text";
import { BILLING } from "@/api/modules/billing";
import { colors } from "@/lib/theme";

/**
 * Retorno do Checkout/Portal do Stripe (deep link `futebolapp://billing/return`,
 * com `?status=success|cancel`). Invalida `/billing/me` pra a UI refletir a
 * assinatura nova e volta pra tela anterior.
 */
export default function BillingReturnScreen() {
  const { t } = useTranslation("billing");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useLocalSearchParams<{ status?: string }>();

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: BILLING.queryKeyRoot });
    const id = setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    }, 400);
    return () => clearTimeout(id);
  }, [queryClient, router]);

  return (
    <ScreenContainer className="items-center justify-center gap-4" scroll={false}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text variant="muted" className="text-sm">
        {status === "cancel" ? t("return.cancel") : t("return.success")}
      </Text>
    </ScreenContainer>
  );
}
