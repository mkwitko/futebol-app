import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { QueryState } from "@/components/shared/query-state";
import { ListRow } from "@/components/ui/list-row";
import { Text } from "@/components/ui/text";
import { colors } from "@/lib/theme";
import { useListCourts } from "@/api/generated/hooks/courtsHooks/useListCourts";

export type VenueCourtsProps = {
  venueId: string;
};

/**
 * Lista de quadras (Court) de uma Venue — exibida na tela da partida, abaixo
 * do resumo da quadra (`VenueSummary`). Só mostra quadras ativas
 * (`active: true`): quadras inativas são gestão do organizador/dono da quadra
 * (web), não algo que o jogador deveria conseguir escolher pra reservar.
 * Tocar numa quadra abre a tela de disponibilidade de horários.
 */
export function VenueCourts({ venueId }: VenueCourtsProps) {
  const { t } = useTranslation(["court", "common"]);
  const router = useRouter();
  const query = useListCourts(venueId);
  const courts = (query.data ?? []).filter((court) => court.active);

  return (
    <View className="gap-2" testID="venue-courts">
      <Text className="font-body-semibold text-xs uppercase tracking-wide text-muted">
        {t("court:list.title")}
      </Text>
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={courts.length === 0}
        errorMessage={t("court:list.loadError")}
        retryLabel={t("common:actions.retry")}
        onRetry={() => void query.refetch()}
        emptyTitle={t("court:list.empty")}
        skeletonCount={2}
      >
        <View className="gap-px overflow-hidden rounded-2xl border border-line bg-surface">
          {courts.map((court) => (
            <ListRow
              key={court.id}
              title={court.name}
              subtitle={t(`court:modality.${court.modality}`)}
              trailing={<Ionicons name="chevron-forward" size={18} color={colors.muted} />}
              onPress={() =>
                router.push({
                  pathname: "/court/[id]/availability",
                  params: { id: court.id, name: court.name },
                })
              }
            />
          ))}
        </View>
      </QueryState>
    </View>
  );
}
