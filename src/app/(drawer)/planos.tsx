import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useListBillingPlans } from "@/api/generated/hooks/billingHooks";
import { type FeatureKey, type PlanKey } from "@/api/modules/billing";
import { SubscribeForm } from "@/components/billing/subscribe-form";
import { ScreenContainer } from "@/components/layout/screen-container";
import { PaymentSheet, type PaymentSheetCharge } from "@/components/payments/payment-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useCancelSubscription } from "@/hooks/billing/use-cancel-subscription";
import { useEntitlements } from "@/hooks/billing/use-entitlements";
import { useSubscribe } from "@/hooks/billing/use-subscribe";
import { useToast } from "@/hooks/common/use-toast";
import { formatPlanPrice } from "@/lib/billing/format-plan-price";
import type { SubscribeFormValues } from "@/schemas/billing/subscribe.schema";

/**
 * Tela de planos — assinatura via Woovi PIX Automático (`POST
 * /billing/subscribe`). Sem assinatura ativa: lista os planos (preço de
 * `/billing/plans`) e abre um formulário (CPF + telefone) por plano; em
 * sucesso mostra o `emv` (copia-e-cola) no `PaymentSheet` reaproveitado da
 * Fase 1 — aqui sem `qrCodeImage` (o PIX Automático não gera QR), então o
 * sheet renderiza só o copia-e-cola + o aviso "aprove no app do banco".
 * Assinatura `active`: mostra o plano atual e "Cancelar assinatura"
 * (`ConfirmDialog` → `POST /billing/cancel`).
 *
 * Bypass revisor: quando `paymentsEnabled === false` (conta revisora,
 * pagamentos desligados ou ainda carregando) a tela não mostra NADA de compra —
 * redireciona pra trás e renderiza `null`. A entrada no drawer também some.
 */
export default function PlanosScreen() {
  const { t } = useTranslation(["billing", "common"]);
  const router = useRouter();
  const { paymentsEnabled, isPending, plan, status } = useEntitlements();
  const plansQuery = useListBillingPlans();
  const subscribe = useSubscribe();
  const cancelSubscription = useCancelSubscription();
  const toast = useToast();

  const [subscribingPlan, setSubscribingPlan] = useState<PlanKey | null>(null);
  const [charge, setCharge] = useState<PaymentSheetCharge | null>(null);
  const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);

  const blocked = !paymentsEnabled;
  const isActive = status === "active" && plan !== null;

  // Segurança extra: se alguém navegar aqui direto sem pagamentos habilitados
  // (revisor), volta. Só age depois que `/billing/me` resolveu.
  useEffect(() => {
    if (!isPending && blocked && router.canGoBack()) router.back();
  }, [isPending, blocked, router]);

  if (blocked) return null;

  const handleSubscribeSubmit = async (values: SubscribeFormValues) => {
    if (!subscribingPlan) return;
    try {
      const result = await subscribe.mutateAsync({
        plan: subscribingPlan,
        taxId: values.taxId,
        phone: values.phone,
      });
      setSubscribingPlan(null);
      setCharge({ brCode: result.emv, status: result.status });
    } catch {
      toast.show(t("billing:errors.subscribe"), "danger");
    }
  };

  const handleConfirmCancel = async () => {
    setCancelConfirmVisible(false);
    try {
      await cancelSubscription.mutateAsync();
      toast.show(t("billing:planos.currentPlan.canceledToast"));
    } catch {
      toast.show(t("billing:errors.cancel"), "danger");
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

      {isActive && plan ? (
        <Card className="gap-3" testID="billing-current-plan">
          <Text variant="display" className="text-xl">
            {t("billing:planos.currentPlan.title")}
          </Text>
          <Text className="font-body-semibold text-base text-ink">
            {t(`billing:planos.${plan}.title`)}
          </Text>
          <Text variant="muted" className="text-sm">
            {t(`billing:planos.currentPlan.status.${status}`)}
          </Text>
          <Button variant="danger" onPress={() => setCancelConfirmVisible(true)} testID="billing-cancel">
            {t("billing:planos.currentPlan.cancel")}
          </Button>
        </Card>
      ) : (
        plans.map((planItem) => {
          const key = planItem.key as PlanKey;
          const recommended = key === "organizer";
          const priceLabel = formatPlanPrice(planItem.price, t as (key: string) => string);
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

              {planItem.includes ? (
                <Text className="font-body-semibold text-sm text-ink">
                  {t("billing:planos.includesPlayer")}
                </Text>
              ) : null}

              <View className="gap-1">
                {planItem.features.map((feature) => (
                  <Text key={feature} className="font-body text-sm text-ink">
                    {`• ${t(`billing:features.${feature as FeatureKey}`)}`}
                  </Text>
                ))}
              </View>

              <Button onPress={() => setSubscribingPlan(key)} testID={`plan-subscribe-${key}`}>
                {t("billing:planos.subscribe")}
              </Button>
            </Card>
          );
        })
      )}

      <Sheet
        visible={subscribingPlan !== null}
        onClose={() => setSubscribingPlan(null)}
        title={t("billing:subscribeForm.title")}
      >
        <SubscribeForm onSubmit={handleSubscribeSubmit} submitting={subscribe.isPending} />
      </Sheet>

      <PaymentSheet visible={charge !== null} onClose={() => setCharge(null)} charge={charge} />

      <ConfirmDialog
        visible={cancelConfirmVisible}
        title={t("billing:planos.currentPlan.cancelConfirmTitle")}
        message={t("billing:planos.currentPlan.cancelConfirmMessage")}
        confirmLabel={t("common:actions.confirm")}
        cancelLabel={t("common:actions.cancel")}
        destructive
        loading={cancelSubscription.isPending}
        onConfirm={() => void handleConfirmCancel()}
        onCancel={() => setCancelConfirmVisible(false)}
      />
    </ScreenContainer>
  );
}
