import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { ShareSheet } from "@/components/share/share-sheet";
import { useGetMyPlayer } from "@/api/generated/hooks/playersHooks";
import { colors } from "@/lib/theme";
import type { GetGroupRanking200 } from "@/api/generated/types/GetGroupRanking";

type RankRow = GetGroupRanking200["goals"][number];

const MEDALS = ["🥇", "🥈", "🥉"];

function RankList({
  title,
  rows,
  myPlayerId,
  onShareOwnRow,
}: {
  title: string;
  rows: readonly RankRow[];
  myPlayerId?: string;
  onShareOwnRow?: () => void;
}) {
  const router = useRouter();
  const { t } = useTranslation("groups");

  return (
    <View className="gap-2">
      <Text variant="display" className="text-base">
        {title}
      </Text>
      {rows.length === 0 ? (
        <Text variant="muted" className="text-sm">
          {t("hub.rankingEmpty")}
        </Text>
      ) : (
        rows.map((r, i) => (
          <Pressable
            key={r.playerId}
            accessibilityRole="button"
            onPress={() => router.push(`/player/${r.playerId}`)}
            className="flex-row items-center gap-3 rounded-xl border border-line bg-surface-up p-2.5 active:opacity-70"
          >
            <Text className="w-6 text-center font-display text-sm text-muted">
              {MEDALS[i] ?? `${i + 1}º`}
            </Text>
            <Avatar name={r.name} uri={r.avatarUrl} size="sm" />
            <Text className="flex-1 font-body-semibold text-ink" numberOfLines={1}>
              {r.name}
            </Text>
            <Text className="font-display text-lg text-primary">{r.value}</Text>
            {onShareOwnRow && r.playerId === myPlayerId ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Compartilhar minha posição"
                hitSlop={8}
                onPress={(e) => {
                  e.stopPropagation();
                  onShareOwnRow();
                }}
              >
                <Ionicons name="share-social-outline" size={18} color={colors.primary} />
              </Pressable>
            ) : null}
          </Pressable>
        ))
      )}
    </View>
  );
}

/**
 * Ranking do grupo — 6 listas top-10 (pontuação primeiro). Um ícone de
 * compartilhar aparece só na própria linha do usuário (quando `groupId` é
 * conhecido — ranking de uma pelada específica, não o ranking global) e abre
 * o `<ShareSheet>` com `subject: { kind: "ranking" }`.
 */
export function RankingSection({
  ranking,
  groupId,
}: {
  ranking: GetGroupRanking200;
  groupId?: string;
}) {
  const { t } = useTranslation(["groups", "common"]);
  const myPlayerQuery = useGetMyPlayer();
  const [shareOpen, setShareOpen] = useState(false);

  const myPlayerId = myPlayerQuery.data?.id;
  const slug = myPlayerQuery.data?.slug;
  const shareTarget = groupId && slug && myPlayerId ? { groupId, slug, playerId: myPlayerId } : null;

  const rowShareProps = shareTarget
    ? { myPlayerId: shareTarget.playerId, onShareOwnRow: () => setShareOpen(true) }
    : {};

  return (
    <View className="gap-5">
      <RankList title={t("groups:hub.rankingPoints")} rows={ranking.points} {...rowShareProps} />
      <RankList title={t("groups:hub.rankingGoals")} rows={ranking.goals} {...rowShareProps} />
      <RankList title={t("groups:hub.rankingAssists")} rows={ranking.assists} {...rowShareProps} />
      <RankList title={t("groups:hub.rankingMvp")} rows={ranking.mvp} {...rowShareProps} />
      <RankList title={t("groups:hub.rankingPresence")} rows={ranking.presence} {...rowShareProps} />
      <RankList
        title={t("groups:hub.rankingCleanSheets")}
        rows={ranking.cleanSheets}
        {...rowShareProps}
      />

      {shareTarget ? (
        <ShareSheet
          visible={shareOpen}
          onClose={() => setShareOpen(false)}
          slug={shareTarget.slug}
          subject={{ kind: "ranking", groupId: shareTarget.groupId, playerId: shareTarget.playerId }}
          message={t("common:share.rankingMessage")}
        />
      ) : null}
    </View>
  );
}
