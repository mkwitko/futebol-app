import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useSearchPlayers } from "@/api/generated/hooks/playersHooks";

/** Busca de jogadores por nome → abre o perfil público (`/player/[playerId]`). */
export default function BuscarScreen() {
  const { t } = useTranslation(["player", "common"]);
  const router = useRouter();
  const [q, setQ] = useState("");

  const enabled = q.trim().length >= 2;
  const query = useSearchPlayers({ q: q.trim() }, { query: { enabled } });
  const players = query.data?.players ?? [];

  return (
    <ScreenContainer className="gap-4">
      <Input
        label={t("player:search.label")}
        placeholder={t("player:search.placeholder")}
        autoCapitalize="none"
        value={q}
        onChangeText={setQ}
      />

      {enabled && !query.isPending && players.length === 0 ? (
        <Text variant="muted" className="text-center text-sm">
          {t("player:search.empty")}
        </Text>
      ) : null}

      <View className="gap-2">
        {players.map((p) => (
          <Pressable
            key={p.playerId}
            accessibilityRole="button"
            onPress={() => router.push(`/player/${p.playerId}`)}
            className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-up p-3 active:opacity-70"
          >
            <Avatar name={p.name} uri={p.avatarUrl} size="md" />
            <Text className="flex-1 font-body-semibold text-ink" numberOfLines={1}>
              {p.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}
