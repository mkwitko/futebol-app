import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Chip } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import type { CastVote200CategoryEnumKey } from "@/api/generated/types/CastVote";
import type { GetVoteTally200 } from "@/api/generated/types/GetVoteTally";

export type VotingCandidate = { playerId: string; name: string };

export type VotingSectionProps = {
  /** Todos os confirmados (para o nome do líder na tally, inclusive quem não pode ser candidato). */
  confirmed: VotingCandidate[];
  /** `true` quando o usuário logado é um confirmado da pelada — só participantes votam. */
  isParticipant: boolean;
  /** Player id do usuário logado (para excluí-lo da lista de candidatos — sem auto-voto). */
  selfPlayerId?: string | null;
  tally?: GetVoteTally200;
  isLoadingTally: boolean;
  onVote: (category: CastVote200CategoryEnumKey, votedPlayerId: string) => Promise<void>;
  /** `true` depois de um 409 (janela de 48h fechada, ou pelada ainda não finalizada) — troca os chips por um aviso. */
  windowClosed: boolean;
};

const CATEGORIES: readonly CastVote200CategoryEnumKey[] = ["mvp", "melhor_goleiro", "craque", "fair_play"];

/**
 * Seção "Votação" — cada confirmado escolhe um jogador por categoria (upsert,
 * pode trocar dentro da janela de 48h). Sem endpoint de "meu voto": a seleção
 * mostrada é otimista (estado local), revertida se o `castVote` falhar. A
 * tally agregada (sem identidade de quem votou) fica sempre visível pra quem
 * acessa a tela.
 */
export function VotingSection({
  confirmed,
  isParticipant,
  selfPlayerId,
  tally,
  isLoadingTally,
  onVote,
  windowClosed,
}: VotingSectionProps) {
  const { t } = useTranslation("matches");

  const [selected, setSelected] = useState<Partial<Record<CastVote200CategoryEnumKey, string>>>({});
  const [pendingCategory, setPendingCategory] = useState<CastVote200CategoryEnumKey | null>(null);

  const candidates = confirmed.filter((player) => player.playerId !== selfPlayerId);
  const nameFor = (playerId: string) => confirmed.find((p) => p.playerId === playerId)?.name;

  const handlePress = async (category: CastVote200CategoryEnumKey, playerId: string) => {
    const previous = selected[category];
    setSelected((prev) => ({ ...prev, [category]: playerId }));
    setPendingCategory(category);
    try {
      await onVote(category, playerId);
    } catch {
      setSelected((prev) => ({ ...prev, [category]: previous }));
    } finally {
      setPendingCategory(null);
    }
  };

  return (
    <View className="gap-6">
      {isParticipant ? (
        windowClosed ? (
          <Text variant="muted" className="text-center">
            {t("detail.voting.windowClosed")}
          </Text>
        ) : (
          <View className="gap-5">
            {CATEGORIES.map((category) => (
              <View key={category} className="gap-2">
                <Text className="font-body-semibold text-sm text-ink">
                  {t(`detail.voting.categories.${category}`)}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {candidates.map((candidate) => (
                    <Chip
                      key={candidate.playerId}
                      testID={`vote-${category}-${candidate.playerId}`}
                      label={candidate.name}
                      selected={selected[category] === candidate.playerId}
                      disabled={pendingCategory === category}
                      onPress={() => void handlePress(category, candidate.playerId)}
                      accessibilityLabel={`${t(`detail.voting.categories.${category}`)}: ${candidate.name}`}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )
      ) : (
        <Text variant="muted" className="text-center">
          {t("detail.voting.notParticipant")}
        </Text>
      )}

      <View className="gap-2">
        <Text variant="display" className="text-lg">
          {t("detail.voting.tallyTitle")}
        </Text>
        {isLoadingTally ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          CATEGORIES.map((category) => {
            const entry = tally?.find((item) => item.category === category);
            const leaderName = entry?.leaderPlayerId ? nameFor(entry.leaderPlayerId) : undefined;
            const leaderVotes = entry?.tally.find((row) => row.playerId === entry.leaderPlayerId)?.votes ?? 0;
            return (
              <View
                key={category}
                className="flex-row items-center justify-between rounded-xl bg-surface-up px-4 py-3"
              >
                <Text className="font-body-medium text-sm text-ink">
                  {t(`detail.voting.categories.${category}`)}
                </Text>
                <Text variant="muted" className="text-sm">
                  {leaderName
                    ? t("detail.voting.leaderLabel", { name: leaderName, votes: leaderVotes })
                    : t("detail.voting.noVotesYet")}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
