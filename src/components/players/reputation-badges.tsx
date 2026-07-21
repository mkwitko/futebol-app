import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";

const DIMENSIONS = ["pontualidade", "educacao", "compromisso", "respeito"] as const;
export type ReputationDimension = (typeof DIMENSIONS)[number];

export type ReputationBadgesProps = {
  reputation: Record<ReputationDimension, number>;
};

/**
 * Badges de reputação — contagem de tags positivas (`GET
 * /players/:id/public-profile` → `reputation`, ou `GET /groups/:id/reputation`
 * por membro) por dimensão. Só renderiza dimensões com contagem > 0
 * (positivo-only, sem indicador de "zero" — mesma filosofia da seção de
 * tagging pós-jogo); `null` quando nenhuma tag foi registrada ainda, pro
 * chamador não precisar checar isso antes de montar o componente.
 *
 * Reaproveitada tal-qual na visão do organizador (`group/[id].tsx`) passando
 * só `pontualidade`/`compromisso` reais e as outras duas zeradas — o filtro
 * de contagem já cuida de esconder o resto, sem precisar de uma variante
 * "compacta" separada.
 */
export function ReputationBadges({ reputation }: ReputationBadgesProps) {
  const { t } = useTranslation("matches");

  const entries = DIMENSIONS.map((dimension) => ({
    dimension,
    count: reputation[dimension],
  })).filter((entry) => entry.count > 0);

  if (entries.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-1.5" testID="reputation-badges">
      {entries.map((entry) => (
        <Badge key={entry.dimension} variant="primary">
          {t(`detail.reputation.${entry.dimension}`)} {entry.count}×
        </Badge>
      ))}
    </View>
  );
}
