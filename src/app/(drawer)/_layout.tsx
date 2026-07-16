import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { useTranslation } from "react-i18next";
import { colors, fonts } from "@/lib/theme";

export default function DrawerLayout() {
  const { t } = useTranslation("common");

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.ink, fontFamily: fonts.display },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
        drawerStyle: { backgroundColor: colors.surface, width: 280 },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.muted,
        drawerActiveBackgroundColor: colors.surfaceUp,
        drawerLabelStyle: { fontFamily: fonts.display, fontSize: 15 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: t("nav.myGroups"),
          drawerLabel: t("nav.myGroups"),
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="perfil"
        options={{
          title: t("nav.profile"),
          drawerLabel: t("nav.profile"),
          drawerIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="config"
        options={{
          title: t("nav.config"),
          drawerLabel: t("nav.config"),
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
