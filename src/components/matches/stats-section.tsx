import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { Text } from "@/components/ui/text";
import type { ListAttendance200 } from "@/api/generated/types/ListAttendance";
import type { ListStats200 } from "@/api/generated/types/ListStats";
import type { LogStatsMutationRequest } from "@/api/generated/types/LogStats";

export type StatsSectionProps = {
  /** Confirmados da pelada — só eles podem receber estatísticas (`STAT.INELIGIBLE_PLAYER`). */
  confirmed: ListAttendance200;
  /** Estatísticas já lançadas (`listStats`) — usadas como valor inicial dos campos e, em modo leitura, como a própria lista exibida. */
  stats: ListStats200;
  isLoadingStats: boolean;
  onSubmit: (data: LogStatsMutationRequest) => void;
  submitting: boolean;
  error?: string | null;
  /** `true` depois de `finalize` — mostra só os valores lançados, sem os controles de edição. */
  readOnly: boolean;
};

type StatEntry = { goals: number; assists: number; ownGoals: number; cleanSheet: boolean };

const DEFAULT_ENTRY: StatEntry = { goals: 0, assists: 0, ownGoals: 0, cleanSheet: false };

/**
 * Seção "Estatísticas" — organizador lança gols/assistências/gol contra e
 * "não sofreu gol" (clean sheet, relevante pro goleiro) de cada confirmado,
 * em lote (`logStats`). Defaults em 0/false: só quem marcou algo precisa ser
 * tocado. Uma vez fechada a pelada (`readOnly`), vira uma lista de leitura.
 */
export function StatsSection({
  confirmed,
  stats,
  isLoadingStats,
  onSubmit,
  submitting,
  error,
  readOnly,
}: StatsSectionProps) {
  const { t } = useTranslation("matches");

  const statByPlayer = new Map(stats.map((entry) => [entry.playerId, entry]));

  const [entries, setEntries] = useState<Record<string, StatEntry>>(() =>
    Object.fromEntries(
      confirmed.map((attendance) => {
        const existing = statByPlayer.get(attendance.player.id);
        return [
          attendance.player.id,
          existing
            ? {
                goals: existing.goals,
                assists: existing.assists,
                ownGoals: existing.ownGoals,
                cleanSheet: existing.cleanSheet,
              }
            : DEFAULT_ENTRY,
        ];
      }),
    ),
  );

  const updateEntry = (playerId: string, patch: Partial<StatEntry>) => {
    setEntries((prev) => ({ ...prev, [playerId]: { ...(prev[playerId] ?? DEFAULT_ENTRY), ...patch } }));
  };

  const handleSubmit = () => {
    onSubmit({
      stats: confirmed.map((attendance) => ({
        playerId: attendance.player.id,
        ...(entries[attendance.player.id] ?? DEFAULT_ENTRY),
      })),
    });
  };

  if (isLoadingStats) {
    return (
      <View className="gap-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </View>
    );
  }

  if (readOnly) {
    if (stats.length === 0) {
      return <EmptyState title={t("detail.stats.emptyTitle")} description={t("detail.stats.emptyDescription")} />;
    }
    return (
      <View className="gap-2">
        {stats.map((entry) => {
          const name =
            confirmed.find((attendance) => attendance.player.id === entry.playerId)?.player.name ??
            t("detail.stats.unknownPlayer");
          return (
            <ListRow
              key={entry.id}
              title={name}
              subtitle={t("detail.stats.summaryLine", {
                goals: entry.goals,
                assists: entry.assists,
                ownGoals: entry.ownGoals,
              })}
              trailing={
                entry.cleanSheet ? (
                  <Text className="font-body-medium text-xs uppercase text-primary">
                    {t("detail.stats.cleanSheetLabel")}
                  </Text>
                ) : null
              }
            />
          );
        })}
      </View>
    );
  }

  if (confirmed.length === 0) {
    return <EmptyState title={t("detail.stats.emptyTitle")} description={t("detail.stats.emptyDescription")} />;
  }

  return (
    <View className="gap-4">
      <Text variant="muted">{t("detail.stats.formDescription")}</Text>

      <View className="gap-3">
        {confirmed.map((attendance) => {
          const entry = entries[attendance.player.id] ?? DEFAULT_ENTRY;
          return (
            <View key={attendance.id} className="gap-3 rounded-2xl border border-line bg-surface p-3">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="flex-1 font-body-semibold text-base text-ink" numberOfLines={1}>
                  {attendance.player.name}
                </Text>
                <Chip
                  label={t("detail.stats.cleanSheetLabel")}
                  selected={entry.cleanSheet}
                  onPress={() => updateEntry(attendance.player.id, { cleanSheet: !entry.cleanSheet })}
                  accessibilityLabel={`${t("detail.stats.cleanSheetLabel")} — ${attendance.player.name}`}
                />
              </View>
              <View className="flex-row flex-wrap gap-3">
                <Stepper
                  testID={`stats-${attendance.player.id}-goals`}
                  label={t("detail.stats.goalsLabel")}
                  value={entry.goals}
                  onChange={(value) => updateEntry(attendance.player.id, { goals: value })}
                  max={50}
                  className="min-w-[30%] flex-1"
                />
                <Stepper
                  testID={`stats-${attendance.player.id}-assists`}
                  label={t("detail.stats.assistsLabel")}
                  value={entry.assists}
                  onChange={(value) => updateEntry(attendance.player.id, { assists: value })}
                  max={50}
                  className="min-w-[30%] flex-1"
                />
                <Stepper
                  testID={`stats-${attendance.player.id}-own-goals`}
                  label={t("detail.stats.ownGoalsLabel")}
                  value={entry.ownGoals}
                  onChange={(value) => updateEntry(attendance.player.id, { ownGoals: value })}
                  max={50}
                  className="min-w-[30%] flex-1"
                />
              </View>
            </View>
          );
        })}
      </View>

      <Button testID="log-stats-submit" onPress={handleSubmit} loading={submitting}>
        {submitting ? t("detail.stats.submitting") : t("detail.stats.submitCta")}
      </Button>

      {error ? (
        <Text className="text-center font-body text-sm text-danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
