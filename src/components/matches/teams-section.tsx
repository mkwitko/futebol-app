import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import type { GetTeams200 } from "@/api/generated/types/GetTeams";

export type TeamsSectionProps = {
  /** Times persistidos (`getTeams`) — `null` = ainda não montados (404) ou carregando. */
  teams: GetTeams200 | null;
  /** Carregando os times persistidos (checagem inicial, antes de decidir vazio/dados). */
  isLoading: boolean;
  onGenerate: () => void;
  generating: boolean;
  error?: string | null;
};

/**
 * Seção "Times" — lê os times persistidos via `getTeams` (sobrevivem a
 * navegar pra fora e voltar) e monta/refaz via `generateTeams`. A resposta já
 * traz `overall` por jogador e `overallTotal` por time calculados pelo
 * backend (inclui convidados avulsos), então a tela não precisa cruzar com o
 * elenco do grupo.
 */
export function TeamsSection({ teams, isLoading, onGenerate, generating, error }: TeamsSectionProps) {
  const { t } = useTranslation("matches");

  if (isLoading) {
    return (
      <View className="gap-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </View>
    );
  }

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
        {teams.teams.map((team) => (
          <View key={team.team} className="min-w-[47%] flex-1 gap-2 rounded-2xl border border-line bg-surface p-3">
            <View className="flex-row items-center justify-between">
              <Text variant="display" className="text-lg">
                {t("detail.teams.teamLabel", { team: team.team + 1 })}
              </Text>
              <Text variant="display" className="text-lg">
                {team.overallTotal}
              </Text>
            </View>
            <View className="gap-1">
              {team.players.map((player) => (
                <View key={player.playerId} className="flex-row items-center justify-between gap-2">
                  <Text className="flex-1 font-body text-sm text-ink" numberOfLines={1}>
                    {player.name}
                  </Text>
                  <Text variant="display" className="text-sm text-muted">
                    {player.overall}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
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
