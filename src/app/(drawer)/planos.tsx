import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import {
  useCreateBillingCheckout,
  useCreateBillingPortal,
  useListBillingPlans,
} from "@/api/generated/hooks/billingHooks";
import { type FeatureKey, type PlanKey } from "@/api/modules/billing";
import { formatPlanPrice } from "@/lib/billing/format-plan-price";
import { useEntitlements } from "@/hooks/billing/use-entitlements";
import { useToast } from "@/hooks/common/use-toast";

/**
 * Tela de planos (assinatura via Stripe). Abre o Checkout/Portal em browser
 * externo (`expo-web-browser`) — o retorno volta pelo deep link
 * `futebolapp://billing/return`, que invalida `/billing/me`.
 *
 * Bypass revisor: quando `paymentsEnabled === false` (conta revisora,
 * pagamentos desligados ou ainda carregando) a tela não mostra NADA de compra —
 * redireciona pra trás e renderiza `null`. A entrada no drawer também some.
 */
export default function PlanosScreen() {
  const { t } = useTranslation(["billing", "common"]);
  const router = useRouter();
  const { paymentsEnabled, isPending } = useEntitlements();
  const plansQuery = useListBillingPlans();
  const checkout = useCreateBillingCheckout();
  const portal = useCreateBillingPortal();
  const toast = useToast();

  const blocked = !paymentsEnabled;

  // Segurança extra: se alguém navegar aqui direto sem pagamentos habilitados
  // (revisor), volta. Só age depois que `/billing/me` resolveu.
  useEffect(() => {
    if (!isPending && blocked && router.canGoBack()) router.back();
  }, [isPending, blocked, router]);

  if (blocked) return null;

  const handleSubscribe = async (plan: PlanKey) => {
    try {
      const { url } = await checkout.mutateAsync({ data: { plan } });
      await WebBrowser.openBrowserAsync(url);
    } catch {
      toast.show(t("billing:errors.checkout"), "danger");
    }
  };

  const handleManage = async () => {
    try {
      const { url } = await portal.mutateAsync();
      await WebBrowser.openBrowserAsync(url);
    } catch {
      toast.show(t("billing:errors.portal"), "danger");
    }
  };

  const plans = plansQuery.data?.plans ?? [];

  return (
    <ScreenContainer className="gap-6" edges={["bottom"]}>
      <ScreenHeader title={t("billing:planos.title")} subtitle={t("billing:planos.subtitle")} />

      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      {plans.map((plan) => {
        const key = plan.key as PlanKey;
        const recommended = key === "organizer";
        const priceLabel = formatPlanPrice(plan.price, t as (key: string) => string);
        return (
          <Card key={key} className="gap-3" testID={`plan-card-${key}`}>
            <View className="flex-row items-center justify-between">
              <Text variant="display" className="text-xl">
                {t(`billing:planos.${key}.title`)}
              </Text>
              {recommended ? (
                <Text className="rounded-full bg-primary px-2 py-0.5 font-body-semibold text-xs text-white">
                  {t("billing:planos.recommended")}
                </Text>
              ) : null}
            </View>

            {priceLabel ? (
              <Text variant="display" className="text-2xl text-primary">
                {priceLabel}
              </Text>
            ) : null}

            <Text variant="muted" className="text-sm">
              {t(`billing:planos.${key}.tagline`)}
            </Text>

            {plan.includes ? (
              <Text className="font-body-semibold text-sm text-ink">
                {t("billing:planos.includesPlayer")}
              </Text>
            ) : null}

            <View className="gap-1">
              {plan.features.map((feature) => (
                <Text key={feature} className="font-body text-sm text-ink">
                  {`• ${t(`billing:features.${feature as FeatureKey}`)}`}
                </Text>
              ))}
            </View>

            <Button
              onPress={() => void handleSubscribe(key)}
              loading={checkout.isPending}
              disabled={portal.isPending || plan.price === null}
              testID={`plan-subscribe-${key}`}
            >
              {t("billing:planos.subscribe")}
            </Button>
          </Card>
        );
      })}

      <Button
        variant="secondary"
        onPress={() => void handleManage()}
        loading={portal.isPending}
        disabled={checkout.isPending}
        testID="billing-manage"
      >
        {t("billing:planos.manage")}
      </Button>
    </ScreenContainer>
  );
}
