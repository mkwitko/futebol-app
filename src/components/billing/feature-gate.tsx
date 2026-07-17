import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { FeatureKey } from "@/api/modules/billing";
import { useEntitlements } from "@/hooks/billing/use-entitlements";

/**
 * CTA de upgrade — leva para a tela de planos. Só deve ser renderizado quando
 * `paymentsEnabled` (o `FeatureGate` cuida disso); exposto separadamente para
 * uso pontual em paywalls.
 */
export function UpgradeCta() {
  const { t } = useTranslation("billing");
  const router = useRouter();

  return (
    <View className="gap-2 rounded-2xl border border-line bg-surface p-4" testID="upgrade-cta">
      <Text variant="display" className="text-lg">
        {t("upgrade.title")}
      </Text>
      <Text variant="muted" className="text-sm">
        {t("upgrade.description")}
      </Text>
      <Button onPress={() => router.push("/planos")} testID="upgrade-cta-button">
        {t("upgrade.cta")}
      </Button>
    </View>
  );
}

/**
 * Paywall declarativo. Regras (bypass revisor incluso):
 * - tem a feature ⇒ renderiza `children`;
 * - falta a feature e `paymentsEnabled` ⇒ `fallback` (default `<UpgradeCta/>`);
 * - falta a feature e `!paymentsEnabled` (revisor / pagamentos off / ainda
 *   carregando) ⇒ `null` — esconde qualquer sinal de compra in-app.
 */
export function FeatureGate({
  feature,
  children,
  fallback,
}: {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { features, paymentsEnabled } = useEntitlements();

  if (features.includes(feature)) return <>{children}</>;
  if (!paymentsEnabled) return null;
  return <>{fallback ?? <UpgradeCta />}</>;
}
