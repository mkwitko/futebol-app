import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { Text } from "@/components/ui/text";
import type { GetResult200 } from "@/api/generated/types/GetResult";
import type { GetTeams200 } from "@/api/generated/types/GetTeams";
import type { RecordResultMutationRequest } from "@/api/generated/types/RecordResult";

export type ResultSectionProps = {
  /** Times persistidos — usados para saber quantos times existem e seus rótulos. `null` = sem times montados (fallback 2 times genéricos). */
  teams: GetTeams200 | null;
  /** Resultado já registrado (`getResult`). Presente → mostra o placar em modo leitura em vez do formulário. */
  result: GetResult200 | null;
  isLoadingResult: boolean;
  onSubmit: (data: RecordResultMutationRequest) => void;
  submitting: boolean;
  error?: string | null;
};

const DRAW_VALUE = "draw";

/**
 * Seção "Resultado" — organizador registra o placar por time depois de
 * `finish-match`. Se os times foram montados (`getTeams`), usa os times
 * persistidos (rótulos e quantidade); senão cai para 2 times genéricos. Uma
 * vez registrado (`getResult` não é 404), mostra o placar em modo leitura —
 * o backend não expõe edição do resultado já gravado nesta fase.
 */
export function ResultSection({ teams, result, isLoadingResult, onSubmit, submitting, error }: ResultSectionProps) {
  const { t } = useTranslation("matches");

  const teamIndices = useMemo(
    () => (teams?.teams.length ? teams.teams.map((team) => team.team) : [0, 1]),
    [teams],
  );

  const [scores, setScores] = useState<Record<number, number>>(() =>
    Object.fromEntries(teamIndices.map((team) => [team, 0])),
  );
  const [winnerOverride, setWinnerOverride] = useState<string | null>(null);

  const teamLabel = (team: number) => t("detail.teams.teamLabel", { team: team + 1 });

  const autoWinner = useMemo(() => {
    const values = teamIndices.map((team) => scores[team] ?? 0);
    const max = Math.max(...values);
    const leaders = teamIndices.filter((team) => (scores[team] ?? 0) === max);
    return leaders.length === 1 ? String(leaders[0]) : DRAW_VALUE;
  }, [scores, teamIndices]);

  const winnerValue = winnerOverride ?? autoWinner;

  const winnerOptions = [
    ...teamIndices.map((team) => ({ label: teamLabel(team), value: String(team) })),
    { label: t("detail.result.draw"), value: DRAW_VALUE },
  ];

  const handleSubmit = () => {
    onSubmit({
      scores: teamIndices.map((team) => ({ team, goals: scores[team] ?? 0 })),
      winnerTeam: winnerValue === DRAW_VALUE ? null : Number(winnerValue),
    });
  };

  if (isLoadingResult) {
    return (
      <View className="gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </View>
    );
  }

  if (result) {
    return (
      <View className="gap-3 rounded-2xl border border-line bg-surface p-4">
        <Text variant="display" className="text-lg">
          {t("detail.result.recordedTitle")}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {result.scores.map((score) => (
            <View key={score.team} className="min-w-[47%] flex-1 items-center gap-1 rounded-xl bg-surface-up p-3">
              <Text variant="muted" className="text-xs uppercase tracking-wide">
                {teamLabel(score.team)}
              </Text>
              <Text variant="display" className="text-3xl">
                {score.goals}
              </Text>
            </View>
          ))}
        </View>
        <Text className="text-center font-body-semibold text-base text-ink">
          {result.winnerTeam === null
            ? t("detail.result.draw")
            : t("detail.result.winnerLabel", { team: teamLabel(result.winnerTeam) })}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <Text variant="muted">{t("detail.result.formDescription")}</Text>

      <View className="flex-row flex-wrap gap-3">
        {teamIndices.map((team) => (
          <Stepper
            key={team}
            testID={`result-team-${team}-goals`}
            label={teamLabel(team)}
            value={scores[team] ?? 0}
            onChange={(value) => setScores((prev) => ({ ...prev, [team]: value }))}
            max={50}
            className="min-w-[45%] flex-1"
          />
        ))}
      </View>

      <View className="gap-1.5">
        <Text className="font-body-medium text-sm text-muted">{t("detail.result.winnerLabelShort")}</Text>
        <SegmentedControl
          options={winnerOptions}
          value={winnerValue}
          onChange={(value) => setWinnerOverride(value)}
        />
      </View>

      <Button testID="record-result-submit" onPress={handleSubmit} loading={submitting}>
        {submitting ? t("detail.result.submitting") : t("detail.result.submitCta")}
      </Button>

      {error ? (
        <Text className="text-center font-body text-sm text-danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
