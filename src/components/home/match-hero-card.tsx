import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useConfirmPresence } from "@/api/generated/hooks/attendanceHooks";
import { getMyUpcomingMatchesQueryKey } from "@/api/generated/hooks/playersHooks";
import type { GetMyUpcomingMatches200 } from "@/api/generated/types/GetMyUpcomingMatches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/common/use-toast";
import { matchCountdown } from "@/lib/datetime/format";

export type HeroMatch = GetMyUpcomingMatches200[number];

/** Card de destaque da próxima partida — contagem regressiva + confirmar presença. */
export function MatchHeroCard({ match }: { match: HeroMatch }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const countdown = matchCountdown(match.datetime, new Date());
  const countdownLabel =
    countdown.kind === "today"
      ? t("home.countdownToday", { time: countdown.time })
      : countdown.kind === "tomorrow"
        ? t("home.countdownTomorrow", { time: countdown.time })
        : countdown.kind === "days"
          ? t("home.countdownDays", { count: countdown.days })
          : countdown.label;

  const confirm = useConfirmPresence({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getMyUpcomingMatchesQueryKey() });
        toast.show(t("home.confirmPresenceSuccess"));
      },
      onError: () => toast.show(t("home.confirmPresenceError"), "danger"),
    },
  });

  const onConfirm = () => confirm.mutate({ id: match.id });

  return (
    <>
      <Pressable
        accessibilityRole="button"
        testID="match-hero-card"
        onPress={() => router.push({ pathname: "/match/[id]", params: { id: match.id } })}
        className="active:opacity-80"
      >
        <Card className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-body-medium text-xs uppercase tracking-wide text-muted">
              {t("home.heroTitle")}
            </Text>
            {match.attendanceStatus === "confirmed" ? (
              <Badge variant="primary">{t("home.attendanceConfirmed")}</Badge>
            ) : match.attendanceStatus === "waitlisted" ? (
              <Badge variant="line">{t("home.attendanceWaitlisted")}</Badge>
            ) : null}
          </View>

          <Text variant="display" className="text-2xl text-ink">
            {match.groupName}
          </Text>
          <Text className="text-base text-ink">{countdownLabel}</Text>
          <Text variant="muted" className="text-sm">
            {match.location}
          </Text>

          {match.attendanceStatus == null ? (
            <Button onPress={onConfirm} loading={confirm.isPending} testID="hero-confirm-cta">
              {t("home.confirmPresenceCta")}
            </Button>
          ) : null}
        </Card>
      </Pressable>
      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}
    </>
  );
}
