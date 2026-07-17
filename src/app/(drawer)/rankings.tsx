import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { QueryState } from "@/components/shared/query-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import { RankingSection } from "@/components/groups/ranking-section";
import { useUpdateLocation } from "@/hooks/location/use-update-location";
import type { GetGroupRanking200 } from "@/api/generated/types/GetGroupRanking";
import { useGetMe } from "@/api/generated/hooks/authHooks";
import { useGetGlobalRanking } from "@/api/generated/hooks/rankingsHooks";

type RankingScope = "global" | "city";

/** Ranking global (all-time) + ranking por cidade (usa a `lastCity` do jogador). */
export default function RankingsScreen() {
  const { t } = useTranslation(["player", "groups", "common"]);
  const [scope, setScope] = useState<RankingScope>("global");
  const [cityDraft, setCityDraft] = useState("");

  const me = useGetMe();
  const lastCity = me.data?.lastCity ?? null;
  const location = useUpdateLocation();

  // No escopo "cidade" só consulta quando já há uma cidade conhecida; senão
  // mostra o fluxo de captura (localização / cidade manual) abaixo.
  const cityFilter = scope === "city" ? lastCity : null;
  const query = useGetGlobalRanking(cityFilter ? { city: cityFilter } : undefined, {
    query: { enabled: scope === "global" || !!cityFilter },
  });

  const needsCity = scope === "city" && !cityFilter;

  const handleUseLocation = async () => {
    await location.captureFromDevice();
  };

  const handleSaveCity = async () => {
    if (!cityDraft.trim()) return;
    await location.setCity(cityDraft);
    setCityDraft("");
  };

  return (
    <ScreenContainer className="gap-4">
      <Text variant="display" className="text-2xl">
        {t("player:rankings.globalTitle")}
      </Text>

      <SegmentedControl<RankingScope>
        options={[
          { label: t("player:rankings.scopeGlobal"), value: "global" },
          { label: t("player:rankings.scopeCity"), value: "city" },
        ]}
        value={scope}
        onChange={setScope}
      />

      <Text variant="muted" className="text-sm">
        {scope === "city" && cityFilter
          ? t("player:rankings.cityHint", { city: cityFilter })
          : t("player:rankings.globalHint")}
      </Text>

      {needsCity ? (
        <View className="gap-3 rounded-xl border border-line bg-surface p-4">
          <Text variant="display" className="text-lg">
            {t("player:rankings.noCityTitle")}
          </Text>
          <Text variant="muted" className="text-sm">
            {t("player:rankings.noCityHint")}
          </Text>
          <Input
            label={t("player:rankings.cityInputLabel")}
            placeholder={t("player:rankings.cityInputPlaceholder")}
            value={cityDraft}
            onChangeText={setCityDraft}
            testID="rankings-city-input"
          />
          <Button
            onPress={() => void handleSaveCity()}
            loading={location.isPending}
            testID="rankings-city-save"
          >
            {t("player:rankings.citySaveCta")}
          </Button>
          <Button
            variant="secondary"
            onPress={() => void handleUseLocation()}
            loading={location.isPending}
            testID="rankings-use-location"
          >
            {t("player:rankings.useLocationCta")}
          </Button>
          {location.permissionDenied ? (
            <Text className="font-body text-sm text-muted">
              {t("player:rankings.permissionDenied")}
            </Text>
          ) : null}
        </View>
      ) : (
        <QueryState
          isPending={query.isPending}
          isError={query.isError}
          isEmpty={!!query.data && query.data.points.length === 0}
          errorMessage={t("groups:hub.rankingLoadError")}
          retryLabel={t("common:actions.retry")}
          onRetry={() => void query.refetch()}
          emptyTitle={t("groups:hub.rankingEmptyTitle")}
          emptyDescription={t("groups:hub.rankingEmptyDescription")}
        >
          {query.data ? <RankingSection ranking={query.data as GetGroupRanking200} /> : null}
        </QueryState>
      )}
    </ScreenContainer>
  );
}
