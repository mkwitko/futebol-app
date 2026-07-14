import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import type { GenerateTeams200 } from "@/api/generated/types/GenerateTeams";

export type TeamsSectionProps = {
  teams: GenerateTeams200 | null;
  /** `playerId` → overall (0-99) — usado só para o total do time; ver nota no `match/[id].tsx`. */
  overallByPlayerId: Record<string, number>;
  onGenerate: () => void;
  generating: boolean;
  error?: string | null;
};

/**
 * Seção "Times" — monta/refaz times via `generateTeams`. A resposta da API
 * (`GenerateTeams200`) só traz `playerId`+`name` por jogador, sem overall; o
 * total do time é calculado cruzando com o elenco do grupo
 * (`overallByPlayerId`, construído a partir de `listMembers` no screen) —
 * jogadores sem overall conhecido (ex.: convidado avulso) não somam.
 */
export function TeamsSection({ teams, overallByPlayerId, onGenerate, generating, error }: TeamsSectionProps) {
  const { t } = useTranslation("matches");

  if (!teams) {
    return (
      <View className="gap-3">
        <EmptyState title={t("detail.teams.emptyTitle")} description={t("detail.teams.emptyDescription")} />
        <Button testID="generate-teams-cta" onPress={onGenerate} loading={generating}>
          {generating ? t("detail.teams.generating") : t("detail.teams.generateCta")}
        </Button>
        {error ? (
          <Text className="text-center font-body text-sm text-danger" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap gap-3">
        {teams.teams.map((team) => {
          const overallTotal = team.players.reduce(
            (sum, player) => sum + (overallByPlayerId[player.playerId] ?? 0),
            0,
          );

          return (
            <View key={team.team} className="min-w-[47%] flex-1 gap-2 rounded-2xl border border-line bg-surface p-3">
              <View className="flex-row items-center justify-between">
                <Text variant="display" className="text-lg">
                  {t("detail.teams.teamLabel", { team: team.team + 1 })}
                </Text>
                <Text variant="display" className="text-lg">
                  {overallTotal}
                </Text>
              </View>
              <View className="gap-1">
                {team.players.map((player) => (
                  <Text key={player.playerId} className="font-body text-sm text-ink" numberOfLines={1}>
                    {player.name}
                  </Text>
                ))}
              </View>
            </View>
          );
        })}
      </View>

      <Button testID="regenerate-teams-cta" variant="secondary" onPress={onGenerate} loading={generating}>
        {generating ? t("detail.teams.generating") : t("detail.teams.regenerateCta")}
      </Button>
      {error ? (
        <Text className="text-center font-body text-sm text-danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
