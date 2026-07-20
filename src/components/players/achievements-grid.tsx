import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

export type Achievement = {
  key: string;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export type AchievementsGridProps = {
  achievements: readonly Achievement[];
  title?: string;
  /**
   * Chamado ao tocar numa conquista já desbloqueada — o próprio grid não
   * conhece o `slug` do jogador, então quem monta o `<ShareSheet>` é a tela
   * que o reaproveita com dados de "meu perfil" (ex.: `perfil.tsx`). Sem esse
   * callback, o grid continua puramente apresentacional (ex.: `RecentAchievements`
   * na home, ou o perfil público de outro jogador).
   */
  onShare?: (key: string) => void;
};

/**
 * Grade de conquistas (badges). Desbloqueadas em destaque; bloqueadas
 * esmaecidas (mostra o que dá pra conquistar). Deriva do `achievements` do
 * `GET /players/:id/career` / `public-profile`.
 */
export function AchievementsGrid({ achievements, title, onShare }: AchievementsGridProps) {
  if (achievements.length === 0) return null;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <View className="gap-3">
      {title ? (
        <View className="flex-row items-center justify-between">
          <Text variant="display" className="text-lg">
            {title}
          </Text>
          <Text variant="muted" className="text-sm">
            {unlockedCount}/{achievements.length}
          </Text>
        </View>
      ) : null}

      <View className="flex-row flex-wrap gap-3">
        {achievements.map((a) => {
          const shareable = a.unlocked && !!onShare;
          return (
            <Pressable
              key={a.key}
              accessibilityLabel={`${a.label}: ${a.description}${a.unlocked ? "" : " (bloqueada)"}`}
              accessibilityRole={shareable ? "button" : undefined}
              disabled={!shareable}
              onPress={shareable ? () => onShare(a.key) : undefined}
              className="w-[30%] items-center gap-1 rounded-2xl border border-line bg-surface-up p-3"
              style={{ opacity: a.unlocked ? 1 : 0.35 }}
            >
              <Text className="text-3xl">{a.icon}</Text>
              <Text className="text-center font-body-semibold text-[11px] text-ink" numberOfLines={2}>
                {a.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
