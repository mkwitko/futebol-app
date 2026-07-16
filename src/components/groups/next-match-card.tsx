import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { formatMatchDateTime } from "@/lib/datetime/format";
import type { ListMatches200 } from "@/api/generated/types/ListMatches";

export type NextMatchCardProps = {
  /** A pelada futura mais próxima do grupo (já filtrada/ordenada pelo chamador), ou `undefined` se nenhuma. */
  match?: ListMatches200[number];
  /** Confirmados na pelada — `undefined` enquanto a lista de presença carrega. */
  confirmedCount?: number;
  onOpenMatch: () => void;
  onConfirmPresence: () => void;
  confirmingPresence?: boolean;
  onCreateMatch: () => void;
};

/**
 * Card "PRÓXIMA" do hub do grupo — a pelada futura mais próxima, com ações
 * rápidas (confirmar presença / ver times, que abre o detalhe da pelada).
 * Sem pelada futura marcada, mostra a CTA de criar a próxima.
 */
export function NextMatchCard({
  match,
  confirmedCount,
  onOpenMatch,
  onConfirmPresence,
  confirmingPresence = false,
  onCreateMatch,
}: NextMatchCardProps) {
  const { t } = useTranslation(["groups", "matches"]);

  if (!match) {
    return (
      <Card className="items-center gap-3">
        <Text className="font-body-medium text-xs uppercase tracking-wide text-muted">
          {t("groups:hub.nextTitle")}
        </Text>
        <Text variant="muted" className="text-center">
          {t("groups:hub.nextEmptyDescription")}
        </Text>
        <Button testID="hub-create-match-cta" size="sm" onPress={onCreateMatch}>
          {t("groups:hub.nextEmptyCta")}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-medium text-xs uppercase tracking-wide text-muted">
          {t("groups:hub.nextTitle")}
        </Text>
        {match.seriesId ? <Badge variant="line">{t("groups:hub.recurringBadge")}</Badge> : null}
      </View>

      <Text variant="display" className="text-xl">
        {formatMatchDateTime(match.datetime)}
      </Text>
      <Text variant="muted">{match.location}</Text>

      {confirmedCount != null ? (
        <Text className="font-body-semibold text-sm text-ink">
          {t("matches:detail.slotsConfirmed", { confirmed: confirmedCount, slots: match.slots })}
        </Text>
      ) : null}

      <View className="flex-row gap-2 pt-1">
        <Button
          testID="hub-confirm-presence-cta"
          size="sm"
          className="flex-1"
          onPress={onConfirmPresence}
          loading={confirmingPresence}
        >
          {t("groups:hub.confirmPresenceCta")}
        </Button>
        <Button
          testID="hub-view-teams-cta"
          size="sm"
          variant="secondary"
          className="flex-1"
          onPress={onOpenMatch}
        >
          {t("groups:hub.viewTeamsCta")}
        </Button>
      </View>
    </Card>
  );
}
