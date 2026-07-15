import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Text } from "@/components/ui/text";
import type { ListAttendance200 } from "@/api/generated/types/ListAttendance";

export type AttendanceSectionProps = {
  attendance: ListAttendance200;
  onConfirmMyPresence: () => void;
  confirmingPresence: boolean;
  onRemove: (attId: string) => void;
  onInvite: () => void;
  /** Abre a carreira do jogador (`/player/[playerId]`) — tocar em qualquer linha da lista/fila. */
  onOpenPlayer: (player: { id: string; name: string }) => void;
};

/** Seção "Lista" — confirmados (com contagem) e fila de espera (ordenada por posição). */
export function AttendanceSection({
  attendance,
  onConfirmMyPresence,
  confirmingPresence,
  onRemove,
  onInvite,
  onOpenPlayer,
}: AttendanceSectionProps) {
  const { t } = useTranslation("matches");

  const confirmed = attendance.filter((item) => item.status === "confirmed");
  const waitlisted = attendance
    .filter((item) => item.status === "waitlisted")
    .sort((a, b) => (a.waitlistPos ?? 0) - (b.waitlistPos ?? 0));

  if (confirmed.length === 0 && waitlisted.length === 0) {
    return (
      <View className="gap-4">
        <Button testID="confirm-my-presence-cta" variant="secondary" onPress={onConfirmMyPresence} loading={confirmingPresence}>
          {t("detail.list.confirmPresenceCta")}
        </Button>
        <EmptyState
          title={t("detail.list.emptyTitle")}
          description={t("detail.list.emptyDescription")}
          actionLabel={t("detail.actions.inviteCta")}
          onAction={onInvite}
        />
      </View>
    );
  }

  return (
    <View className="gap-5">
      <Button testID="confirm-my-presence-cta" variant="secondary" onPress={onConfirmMyPresence} loading={confirmingPresence}>
        {t("detail.list.confirmPresenceCta")}
      </Button>

      <View className="gap-2">
        <Text variant="display" className="text-lg">
          {t("detail.list.confirmedTitle")} ({confirmed.length})
        </Text>
        {confirmed.map((item) => (
          <ListRow
            key={item.id}
            title={item.player.name}
            onPress={() => onOpenPlayer(item.player)}
            trailing={
              <View className="flex-row items-center gap-3">
                <Badge variant={item.paymentStatus === "paid" ? "primary" : "neutral"}>
                  {t(`detail.payment.${item.paymentStatus}`)}
                </Badge>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("detail.list.removeCta")}
                  hitSlop={8}
                  onPress={() => onRemove(item.id)}
                >
                  <Text className="font-body-medium text-sm text-danger">{t("detail.list.removeCta")}</Text>
                </Pressable>
              </View>
            }
          />
        ))}
      </View>

      {waitlisted.length > 0 ? (
        <View className="gap-2">
          <Text variant="display" className="text-lg">
            {t("detail.list.waitlistTitle")} ({waitlisted.length})
          </Text>
          {waitlisted.map((item) => (
            <ListRow
              key={item.id}
              title={item.player.name}
              subtitle={t("detail.list.waitlistPosition", { position: item.waitlistPos })}
              onPress={() => onOpenPlayer(item.player)}
              trailing={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("detail.list.removeCta")}
                  hitSlop={8}
                  onPress={() => onRemove(item.id)}
                >
                  <Text className="font-body-medium text-sm text-danger">{t("detail.list.removeCta")}</Text>
                </Pressable>
              }
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
