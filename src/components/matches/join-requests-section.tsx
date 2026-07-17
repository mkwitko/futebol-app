import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/common/use-toast";
import { useDecideJoinRequest } from "@/hooks/join-requests/use-decide-join-request";
import { useMatchJoinRequests } from "@/hooks/join-requests/use-match-join-requests";

/**
 * Inbox de pedidos pra entrar (só o organizador, e só quando o grupo usa
 * `joinPolicy=request`). Lista os pendentes com Aprovar/Recusar; ao decidir,
 * o hook invalida a lista de pedidos e a presença da pelada. Feedback via
 * `Toast` local (a seção é auto-contida).
 */
export function JoinRequestsSection({ matchId }: { matchId: string }) {
  const { t } = useTranslation(["matches", "common"]);
  const toast = useToast();
  const query = useMatchJoinRequests(matchId);
  const decide = useDecideJoinRequest(matchId);

  const requests = query.data ?? [];

  const handleDecide = async (reqId: string, approve: boolean) => {
    try {
      await decide.mutateAsync(reqId, approve);
      toast.show(
        t(approve ? "matches:detail.joinRequests.approveSuccess" : "matches:detail.joinRequests.rejectSuccess"),
      );
    } catch {
      toast.show(t("matches:detail.joinRequests.decideError"), "danger");
    }
  };

  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface p-4" testID="join-requests-section">
      <Text variant="display" className="text-base">
        {t("matches:detail.joinRequests.title")}
      </Text>

      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      {query.isError ? (
        <Text className="font-body text-sm text-danger">
          {t("matches:detail.joinRequests.loadError")}
        </Text>
      ) : null}

      {!query.isPending && !query.isError && requests.length === 0 ? (
        <Text variant="muted" className="text-sm">
          {t("matches:detail.joinRequests.empty")}
        </Text>
      ) : null}

      <View className="gap-2">
        {requests.map((req) => (
          <View
            key={req.id}
            className="flex-row items-center gap-2 rounded-xl border border-line bg-surface-up p-3"
          >
            <Text className="flex-1 font-body-semibold text-ink" numberOfLines={1}>
              {req.playerName}
            </Text>
            <Button
              size="sm"
              variant="secondary"
              onPress={() => void handleDecide(req.id, false)}
              disabled={decide.isPending}
              testID={`join-request-reject-${req.id}`}
            >
              {t("matches:detail.joinRequests.rejectCta")}
            </Button>
            <Button
              size="sm"
              onPress={() => void handleDecide(req.id, true)}
              loading={decide.isPending}
              testID={`join-request-approve-${req.id}`}
            >
              {t("matches:detail.joinRequests.approveCta")}
            </Button>
          </View>
        ))}
      </View>
    </View>
  );
}
