import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { usePlayerSuggestions } from "@/hooks/players/use-player-suggestions";
import { useUpdateLocation } from "@/hooks/location/use-update-location";
import { useSearchPlayers } from "@/api/generated/hooks/playersHooks";

/**
 * Busca de jogadores por nome → abre o perfil público (`/player/[playerId]`).
 * Com o campo vazio, mostra "Sugestões pra você" (jogadores perto, via
 * `GET /players/suggestions`) — some assim que o usuário digita 2+ letras.
 */
export default function BuscarScreen() {
  const { t } = useTranslation(["player", "common"]);
  const router = useRouter();
  const [q, setQ] = useState("");

  const searching = q.trim().length >= 2;
  const query = useSearchPlayers({ q: q.trim() }, { query: { enabled: searching } });
  const players = query.data?.players ?? [];

  const location = useUpdateLocation();
  const { query: suggestionsQuery, hasCoords } = usePlayerSuggestions(!searching);
  const suggestions = suggestionsQuery.data?.suggestions ?? [];

  const goToPlayer = (playerId: string) => router.push(`/player/${playerId}`);

  return (
    <ScreenContainer className="gap-4" edges={["bottom"]}>
      <Input
        label={t("player:search.label")}
        placeholder={t("player:search.placeholder")}
        autoCapitalize="none"
        value={q}
        onChangeText={setQ}
      />

      {searching ? (
        <>
          {!query.isPending && players.length === 0 ? (
            <Text variant="muted" className="text-center text-sm">
              {t("player:search.empty")}
            </Text>
          ) : null}

          <View className="gap-2">
            {players.map((p) => (
              <Pressable
                key={p.playerId}
                accessibilityRole="button"
                onPress={() => goToPlayer(p.playerId)}
                className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-up p-3 active:opacity-70"
              >
                <Avatar name={p.name} uri={p.avatarUrl} size="md" />
                <Text className="flex-1 font-body-semibold text-ink" numberOfLines={1}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <View className="gap-2">
          <Text variant="display" className="text-lg">
            {t("player:search.suggestionsTitle")}
          </Text>

          {!hasCoords ? (
            <View
              className="gap-3 rounded-xl border border-line bg-surface p-4"
              testID="buscar-need-location"
            >
              <Text variant="muted" className="text-sm">
                {t("player:search.needLocation")}
              </Text>
              <Button
                variant="secondary"
                onPress={() => void location.captureFromDevice()}
                loading={location.isPending}
                testID="buscar-use-location"
              >
                {t("player:search.useLocationCta")}
              </Button>
            </View>
          ) : suggestionsQuery.isPending ? (
            <View className="gap-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </View>
          ) : suggestions.length === 0 ? (
            <Text variant="muted" className="text-center text-sm">
              {t("player:search.suggestionsEmpty")}
            </Text>
          ) : (
            suggestions.map((s) => (
              <Pressable
                key={s.playerId}
                accessibilityRole="button"
                onPress={() => goToPlayer(s.playerId)}
                className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-up p-3 active:opacity-70"
              >
                <Avatar name={s.name} uri={s.avatarUrl} size="md" />
                <View className="flex-1 gap-0.5">
                  <Text className="font-body-semibold text-ink" numberOfLines={1}>
                    {s.name}
                  </Text>
                  {s.city ? (
                    <Text variant="muted" className="text-xs">
                      {s.city} · {t("player:search.distanceKm", { km: s.distanceKm })}
                    </Text>
                  ) : null}
                </View>
                <Badge variant={s.level as BadgeVariant}>{s.overall}</Badge>
              </Pressable>
            ))
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
