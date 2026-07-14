import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/theme";

export default function TabsLayout() {
  const { t } = useTranslation("common");

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.ink },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("nav.home") }} />
    </Tabs>
  );
}
