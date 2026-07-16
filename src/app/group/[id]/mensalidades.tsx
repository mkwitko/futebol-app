import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { QueryState } from "@/components/shared/query-state";
import { Badge } from "@/components/ui/badge";
import { ListRow } from "@/components/ui/list-row";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/auth/use-auth";
import { useToast } from "@/hooks/common/use-toast";
import { useConfirmDue } from "@/hooks/dues/use-confirm-due";
import { useMarkDuePaid } from "@/hooks/dues/use-mark-due-paid";
import { formatCentsToBRL } from "@/lib/money";
import { useListGroupDues } from "@/api/generated/hooks/duesHooks";
import { useListMembers } from "@/api/generated/hooks/membersHooks";

/** "YYYY-MM" do mês atual — a tela sempre mostra a competência corrente (sem seletor de mês, Fase 0). */
function currentCompetencyMonth(): string {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}`;
}

/**
 * Mensalidades do grupo, competência do mês corrente — o organizador confirma
 * (ou desfaz) o pagamento de qualquer mensalista; o próprio jogador
 * mensalista pode marcar a própria mensalidade como paga ("Paguei"). Mesmo
 * padrão de gating client-side do resto do app: nenhuma ação é escondida por
 * papel (o backend é a fonte da verdade, ver `lib/api/errors.ts`) — só
 * "Paguei" é restrito a quem é o próprio jogador da mensalidade.
 */
export default function MensalidadesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation(["groups", "common"]);
  const { user } = useAuth();
  const toast = useToast();

  const month = currentCompetencyMonth();
  const membersQuery = useListMembers(id);
  const duesQuery = useListGroupDues(id, { month });

  const confirmDue = useConfirmDue(id);
  const markDuePaid = useMarkDuePaid(id);

  const handleConfirm = async (dueId: string, paid: boolean) => {
    try {
      await confirmDue.mutateAsync(dueId, paid);
      toast.show(t("groups:mensalidades.confirmSuccess"));
    } catch {
      toast.show(t("groups:mensalidades.confirmError"), "danger");
    }
  };

  const handleMarkPaid = async (dueId: string) => {
    try {
      await markDuePaid.mutateAsync(dueId);
      toast.show(t("groups:mensalidades.markPaidSuccess"));
    } catch {
      toast.show(t("groups:mensalidades.markPaidError"), "danger");
    }
  };

  const isPending = membersQuery.isPending || duesQuery.isPending;
  const isError = membersQuery.isError || duesQuery.isError;
  const dues = duesQuery.data ?? [];

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader title={t("groups:mensalidades.title")} onBack={() => router.back()} />

      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      <Text variant="muted" className="text-xs">
        {t("groups:mensalidades.monthLabel", { month })}
      </Text>

      <QueryState
        isPending={isPending}
        isError={isError}
        isEmpty={dues.length === 0}
        errorMessage={t("groups:mensalidades.loadError")}
        retryLabel={t("common:actions.retry")}
        onRetry={() => {
          void membersQuery.refetch();
          void duesQuery.refetch();
        }}
        emptyTitle={t("groups:mensalidades.emptyTitle")}
        emptyDescription={t("groups:mensalidades.emptyDescription")}
      >
        <View className="gap-2">
          {dues.map((due) => {
            const member = membersQuery.data?.find((m) => m.id === due.groupMemberId);
            const isSelf = !!user?.id && member?.player.userId === user.id;
            const isPaid = due.status === "paid";

            return (
              <ListRow
                key={due.id}
                title={member?.player.name ?? due.groupMemberId}
                subtitle={formatCentsToBRL(due.amountCents)}
                trailing={
                  <View className="flex-row items-center gap-3">
                    <Badge variant={isPaid ? "primary" : "neutral"}>
                      {t(isPaid ? "groups:mensalidades.statusPaid" : "groups:mensalidades.statusPending")}
                    </Badge>
                    {isPaid ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("groups:mensalidades.undoCta")}
                        hitSlop={8}
                        onPress={() => void handleConfirm(due.id, false)}
                      >
                        <Text className="font-body-medium text-sm text-muted">
                          {t("groups:mensalidades.undoCta")}
                        </Text>
                      </Pressable>
                    ) : (
                      <>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t("groups:mensalidades.confirmCta")}
                          hitSlop={8}
                          onPress={() => void handleConfirm(due.id, true)}
                        >
                          <Text className="font-body-medium text-sm text-primary">
                            {t("groups:mensalidades.confirmCta")}
                          </Text>
                        </Pressable>
                        {isSelf ? (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("groups:mensalidades.markPaidCta")}
                            hitSlop={8}
                            onPress={() => void handleMarkPaid(due.id)}
                          >
                            <Text className="font-body-medium text-sm text-ink">
                              {t("groups:mensalidades.markPaidCta")}
                            </Text>
                          </Pressable>
                        ) : null}
                      </>
                    )}
                  </View>
                }
              />
            );
          })}
        </View>
      </QueryState>
    </ScreenContainer>
  );
}
