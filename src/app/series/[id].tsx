import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { MatchRow } from "@/components/matches/match-row";
import { QueryState } from "@/components/shared/query-state";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/common/use-toast";
import { useEndSeries } from "@/hooks/series/use-end-series";
import { formatCentsToBRL } from "@/lib/money";
import { useGetSeries } from "@/api/generated/hooks/seriesHooks";
import { useListMatches } from "@/api/generated/hooks/matchesHooks";
import type { GetSeries200, GetSeries200StatusEnumKey } from "@/api/generated/types/GetSeries";

const STATUS_BADGE_VARIANT: Record<GetSeries200StatusEnumKey, BadgeVariant> = {
  active: "primary",
  paused: "neutral",
  ended: "line",
};

/** Detalhe da série — molde (regra, local, horário, vagas, preço) + próximas ocorrências + encerrar. */
export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation(["matches", "common"]);
  const toast = useToast();

  const seriesQuery = useGetSeries(id);
  const series = seriesQuery.data;

  const matchesQuery = useListMatches(series?.groupId);
  const occurrences = (matchesQuery.data ?? []).filter((match) => match.seriesId === id);

  const endSeries = useEndSeries(id);

  const handleEnd = async () => {
    try {
      await endSeries.mutateAsync();
      toast.show(t("matches:series.endSuccess"));
    } catch {
      toast.show(t("matches:series.endError"), "danger");
    }
  };

  const confirmEnd = () =>
    Alert.alert(t("matches:series.endConfirmTitle"), t("matches:series.endConfirmMessage"), [
      { text: t("common:actions.cancel"), style: "cancel" },
      { text: t("common:actions.confirm"), style: "destructive", onPress: () => void handleEnd() },
    ]);

  // Índice = dia (0=Dom..6=Sáb) / semana (1..4, -1=última) — pré-resolvidos com
  // chaves literais porque o `TFunction` tipado só aceita chaves conhecidas em
  // tempo de compilação (não aceita template com `number` genérico).
  const weekdayLabels = [
    t("matches:weekdays.0"),
    t("matches:weekdays.1"),
    t("matches:weekdays.2"),
    t("matches:weekdays.3"),
    t("matches:weekdays.4"),
    t("matches:weekdays.5"),
    t("matches:weekdays.6"),
  ];
  const monthlyWeekLabels: Record<number, string> = {
    1: t("matches:create.recurrenceMonthlyWeekOptions.1"),
    2: t("matches:create.recurrenceMonthlyWeekOptions.2"),
    3: t("matches:create.recurrenceMonthlyWeekOptions.3"),
    4: t("matches:create.recurrenceMonthlyWeekOptions.4"),
    "-1": t("matches:create.recurrenceMonthlyWeekOptions.-1"),
  };

  const ruleDescription = (rule: GetSeries200["rule"]): string => {
    switch (rule.kind) {
      case "weekly": {
        const weekdays = rule.weekdays.map((day) => weekdayLabels[day]).join(", ");
        return rule.interval > 1
          ? t("matches:series.ruleDescriptions.weeklyInterval", { interval: rule.interval, weekdays })
          : t("matches:series.ruleDescriptions.weekly", { weekdays });
      }
      case "monthly_dom":
        return t("matches:series.ruleDescriptions.monthlyDom", { day: rule.day });
      case "monthly_nth":
        return t("matches:series.ruleDescriptions.monthlyNth", {
          week: monthlyWeekLabels[rule.week],
          weekday: weekdayLabels[rule.weekday],
        });
      case "manual":
        return t("matches:series.ruleDescriptions.manual");
    }
  };

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader
        title={series?.location ?? t("matches:series.loadingTitle")}
        onBack={() => router.back()}
      />

      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      <QueryState
        isPending={seriesQuery.isPending}
        isError={seriesQuery.isError}
        isEmpty={false}
        errorMessage={t("matches:series.loadError")}
        retryLabel={t("common:actions.retry")}
        onRetry={() => void seriesQuery.refetch()}
        emptyTitle=""
      >
        {series ? (
          <View className="gap-6">
            <Card className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text variant="display" className="text-lg">
                  {t("matches:series.ruleSummaryLabel")}
                </Text>
                <Badge variant={STATUS_BADGE_VARIANT[series.status]}>
                  {t(`matches:series.status.${series.status}`)}
                </Badge>
              </View>
              <Text className="font-body text-base text-ink">{ruleDescription(series.rule)}</Text>

              <Divider />

              <View className="gap-1">
                <Text variant="muted" className="text-xs">
                  {t("matches:series.locationLabel")}
                </Text>
                <Text className="font-body text-base text-ink">{series.location}</Text>
              </View>

              {series.time ? (
                <View className="gap-1">
                  <Text variant="muted" className="text-xs">
                    {t("matches:series.timeLabel")}
                  </Text>
                  <Text className="font-body text-base text-ink">{series.time}</Text>
                </View>
              ) : null}

              <View className="flex-row gap-6">
                <View className="gap-1">
                  <Text variant="muted" className="text-xs">
                    {t("matches:series.slotsLabel")}
                  </Text>
                  <Text className="font-body text-base text-ink">{series.slots}</Text>
                </View>
                <View className="gap-1">
                  <Text variant="muted" className="text-xs">
                    {t("matches:series.priceLabel")}
                  </Text>
                  <Text className="font-body text-base text-ink">
                    {series.priceCents ? formatCentsToBRL(series.priceCents) : t("matches:series.freeMatch")}
                  </Text>
                </View>
              </View>
            </Card>

            <View className="gap-3">
              <Text variant="display" className="text-lg">
                {t("matches:series.upcomingTitle")}
              </Text>

              <QueryState
                isPending={matchesQuery.isPending}
                isError={matchesQuery.isError}
                isEmpty={occurrences.length === 0}
                errorMessage={t("matches:series.loadError")}
                retryLabel={t("common:actions.retry")}
                onRetry={() => void matchesQuery.refetch()}
                emptyTitle={t("matches:series.upcomingEmptyTitle")}
                emptyDescription={t("matches:series.upcomingEmptyDescription")}
              >
                <View className="gap-2">
                  {occurrences.map((match) => (
                    <MatchRow
                      key={match.id}
                      match={match}
                      onPress={() => router.push({ pathname: "/match/[id]", params: { id: match.id } })}
                    />
                  ))}
                </View>
              </QueryState>
            </View>

            {series.status !== "ended" ? (
              <Button
                variant="danger"
                onPress={confirmEnd}
                loading={endSeries.isPending}
                testID="end-series-cta"
              >
                {t("matches:series.endCta")}
              </Button>
            ) : null}
          </View>
        ) : null}
      </QueryState>
    </ScreenContainer>
  );
}
