import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { AchievementsGrid, type Achievement } from "@/components/players/achievements-grid";
import { Text } from "@/components/ui/text";

/** Conquistas recentes na home — até 4 desbloqueadas + atalho pro perfil. */
export function RecentAchievements({ achievements }: { achievements: readonly Achievement[] }) {
  const { t } = useTranslation("common");
  const router = useRouter();

  const unlocked = achievements.filter((a) => a.unlocked).slice(0, 4);
  if (unlocked.length === 0) return null;

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text variant="display" className="text-lg">
          {t("home.achievementsTitle")}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.navigate("/perfil")}>
          <Text className="text-sm text-primary">{t("home.viewAll")}</Text>
        </Pressable>
      </View>
      <AchievementsGrid achievements={unlocked} />
    </View>
  );
}
