import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { bestPositionFromOverall, computeWinRate, positionOverallEntries } from "@/lib/player/career";
import {
  type FieldPosition,
  fieldPositionAbbreviation,
  fieldPositionLabel,
} from "@/lib/player/position";
import type { GetPlayerCareer200 } from "@/api/generated/types/GetPlayerCareer";
import { PlayerCard } from "./player-card";

export type CareerSummaryProps = {
  name: string;
  avatarUri?: string | null;
  career: GetPlayerCareer200;
  /** Slot para a ação de compartilhar (só em "Minha carreira" — read-only na carreira de outro jogador). */
  action?: ReactNode;
  testID?: string;
};

/** Uma linha do bloco "Overall por posição" — barra proporcional ao overall (0-99), destaque na melhor posição. */
function PositionRow({ position, overall, isBest }: { position: FieldPosition; overall: number; isBest: boolean }) {
  const { t } = useTranslation("player");

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 flex-row items-center gap-2">
          <Badge variant="line">{fieldPositionAbbreviation(position)}</Badge>
          <Text className="flex-1 font-body-medium text-sm text-ink" numberOfLines={1}>
            {fieldPositionLabel(position)}
          </Text>
          {isBest ? <Badge variant="primary">{t("career.bestPositionBadge")}</Badge> : null}
        </View>
        <Text className="font-display text-lg text-ink">{overall}</Text>
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-line">
        <View className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(99, overall))}%` }} />
      </View>
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card elevated className="w-[47%] items-center gap-1 py-4">
      <Text className="font-display text-2xl text-ink">{value}</Text>
      <Text className="text-center font-body-medium text-[11px] uppercase tracking-wide text-muted">{label}</Text>
    </Card>
  );
}

/**
 * Composição "carreira" — hero (`PlayerCard` full com overall/tier reais) +
 * "Overall por posição" (mapa `career.overall`, melhor posição em destaque) +
 * grid de estatísticas completas. Usada tanto em "Minha carreira" (Perfil)
 * quanto na carreira de outro jogador (`/player/[playerId]`, read-only — sem
 * `action`). Quando `career.id` é `null`, o backend já respondeu o corpo
 * zerado/bootstrap (nenhuma pelada finalizada ainda) — mostramos o hero
 * zerado (sem a linha de stats do próprio card, seguindo a convenção do
 * `PlayerCard`) com um convite abaixo, em vez de tratar como erro.
 */
export function CareerSummary({ name, avatarUri, career, action, testID }: CareerSummaryProps) {
  const { t } = useTranslation("player");

  const isNewCareer = career.id === null;
  const best = bestPositionFromOverall(career.overall);
  const positions = positionOverallEntries(career.overall);
  const winRate = computeWinRate(career.wins, career.matchesPlayed);

  const statItems: { label: string; value: string | number }[] = [
    { label: t("career.stats.matches"), value: career.matchesPlayed },
    { label: t("career.stats.wins"), value: career.wins },
    { label: t("career.stats.draws"), value: career.draws },
    { label: t("career.stats.losses"), value: career.losses },
    { label: t("career.stats.winRate"), value: `${winRate}%` },
    { label: t("career.stats.goals"), value: career.goals },
    { label: t("career.stats.assists"), value: career.assists },
    { label: t("career.stats.cleanSheets"), value: career.cleanSheets },
    { label: t("career.stats.mvpCount"), value: career.mvpCount },
    { label: t("career.stats.currentStreak"), value: career.currentStreak },
    { label: t("career.stats.bestStreak"), value: career.bestStreak },
  ];

  return (
    <View className="gap-6" testID={testID}>
      <View className="gap-3">
        {/*
          Sem `stats` aqui de propósito: o grid completo logo abaixo já cobre
          partidas/vitórias/gols (e mais) com mais detalhe — repetir os mesmos
          3 no mini-resumo do hero duplicaria rótulos ("Vitórias", "Gols") na
          tela por nenhum ganho. O hero fica só overall + posição + tier.
        */}
        <PlayerCard
          name={name}
          position={best?.position ?? "campo_atacante"}
          overall={best?.overall ?? 0}
          tier={career.level}
          avatarUri={avatarUri}
          variant="full"
        />
        {isNewCareer ? (
          <Text variant="muted" className="text-center text-sm">
            {t("career.emptyDescription")}
          </Text>
        ) : null}
        {action}
      </View>

      {positions.length > 0 ? (
        <View className="gap-3">
          <Text variant="display" className="text-lg">
            {t("career.positionsTitle")}
          </Text>
          <View className="gap-3">
            {positions.map((entry) => (
              <PositionRow key={entry.position} position={entry.position} overall={entry.overall} isBest={entry.isBest} />
            ))}
          </View>
        </View>
      ) : null}

      <View className="gap-3">
        <Text variant="display" className="text-lg">
          {t("career.statsTitle")}
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {statItems.map((item) => (
            <StatTile key={item.label} label={item.label} value={item.value} />
          ))}
        </View>
      </View>
    </View>
  );
}
