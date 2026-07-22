import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import type { ListAttendance200 } from "@/api/generated/types/ListAttendance";

export type PaymentSectionProps = {
  pixKey: string | null;
  attendance: ListAttendance200;
  currentUserId?: string | null;
  onCopiedPixKey: () => void;
  onConfirmPayment: (attId: string, paid: boolean) => void;
  onMarkPaid: (attId: string) => void;
  /** `usePaymentsEnabled()` — mostra o "Pagar" (Woovi) quando `true`; o "marcar como pago" manual continua disponível como fallback. */
  paymentsEnabled?: boolean;
  onPay: (attId: string) => void;
  /** Pending state of the pay-attendance mutation — disables button while request is in flight. */
  isPaying?: boolean;
};

/**
 * Seção "Pagamento (PIX)" — chave em destaque (copiável) + lista dos
 * confirmados com ações de pagamento: o organizador confirma/desfaz
 * (`confirmPayment`); o próprio jogador (`player.userId === currentUserId`)
 * pode marcar como pago (`markPaid`). Fila de espera não paga, então fica de
 * fora desta lista (ver `AttendanceSection` para a fila).
 */
export function PaymentSection({
  pixKey,
  attendance,
  currentUserId,
  onCopiedPixKey,
  onConfirmPayment,
  onMarkPaid,
  paymentsEnabled = false,
  onPay,
  isPaying = false,
}: PaymentSectionProps) {
  const { t } = useTranslation(["matches", "payments"]);
  const confirmed = attendance.filter((item) => item.status === "confirmed");

  const copyPixKey = async () => {
    if (!pixKey) return;
    await Clipboard.setStringAsync(pixKey);
    onCopiedPixKey();
  };

  return (
    <View className="gap-4">
      <View className="gap-2 rounded-2xl border border-line bg-surface-up p-4">
        <Text className="font-body-medium text-sm text-muted">{t("detail.payment.pixKeyLabel")}</Text>
        {pixKey ? (
          <>
            <Text className="font-display text-xl text-ink" selectable>
              {pixKey}
            </Text>
            <Button testID="copy-pix-key-cta" variant="secondary" size="sm" onPress={copyPixKey} className="self-start">
              {t("detail.payment.copyCta")}
            </Button>
          </>
        ) : (
          <Text variant="muted">{t("detail.payment.pixKeyEmpty")}</Text>
        )}
      </View>

      {confirmed.length === 0 ? (
        <EmptyState title={t("detail.payment.emptyTitle")} description={t("detail.payment.emptyDescription")} />
      ) : (
        <View className="gap-2">
          {confirmed.map((item) => {
            const isSelf = !!currentUserId && item.player.userId === currentUserId;
            const isPaid = item.paymentStatus === "paid";

            return (
              // Nome + status na 1ª linha; ações na 2ª — antes tudo ficava no
              // `trailing` do ListRow e espremia o nome (some quando aparece o
              // "marcar como pago" do próprio jogador).
              <View
                key={item.id}
                className="gap-2 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="flex-1 font-body-medium text-base text-ink" numberOfLines={1}>
                    {item.player.name}
                  </Text>
                  <Badge variant={isPaid ? "primary" : "neutral"}>
                    {t(`detail.payment.${item.paymentStatus}`)}
                  </Badge>
                </View>

                <View className="flex-row items-center gap-4">
                  {isPaid ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t("detail.payment.undoCta")}
                      hitSlop={8}
                      onPress={() => onConfirmPayment(item.id, false)}
                    >
                      <Text className="font-body-medium text-sm text-muted">{t("detail.payment.undoCta")}</Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("detail.payment.confirmCta")}
                        hitSlop={8}
                        onPress={() => onConfirmPayment(item.id, true)}
                      >
                        <Text className="font-body-medium text-sm text-primary">
                          {t("detail.payment.confirmCta")}
                        </Text>
                      </Pressable>
                      {isSelf ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t("detail.payment.markPaidCta")}
                          hitSlop={8}
                          onPress={() => onMarkPaid(item.id)}
                        >
                          <Text className="font-body-medium text-sm text-ink">
                            {t("detail.payment.markPaidCta")}
                          </Text>
                        </Pressable>
                      ) : null}
                      {isSelf && paymentsEnabled ? (
                        <Button
                          testID="pay-attendance-cta"
                          variant="primary"
                          size="sm"
                          loading={isPaying}
                          disabled={isPaying}
                          onPress={() => onPay(item.id)}
                        >
                          {t("payments:payment.payCta")}
                        </Button>
                      ) : null}
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
