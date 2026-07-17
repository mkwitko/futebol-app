import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { useTranslation } from "react-i18next";
import { colors, fonts } from "@/lib/theme";
import { usePaymentsEnabled } from "@/hooks/billing/use-entitlements";

export default function DrawerLayout() {
  const { t } = useTranslation("common");
  // Bypass revisor: sem pagamentos habilitados, a entrada "Planos" some do
  // drawer (o revisor da loja vê o app sem compras in-app).
  const paymentsEnabled = usePaymentsEnabled();

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
          title: t("nav.home"),
          drawerLabel: t("nav.home"),
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="grupos"
        options={{
          title: t("nav.myGroups"),
          drawerLabel: t("nav.myGroups"),
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="rankings"
        options={{
          title: t("nav.rankings"),
          drawerLabel: t("nav.rankings"),
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "trophy" : "trophy-outline"} size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="buscar"
        options={{
          title: t("nav.search"),
          drawerLabel: t("nav.search"),
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="descobrir"
        options={{
          title: t("nav.discover"),
          drawerLabel: t("nav.discover"),
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "compass" : "compass-outline"} size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="planos"
        options={{
          title: t("nav.plans"),
          drawerLabel: t("nav.plans"),
          // Escondida (não desmontada) quando pagamentos estão off/revisor.
          drawerItemStyle: paymentsEnabled ? undefined : { display: "none" },
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "star" : "star-outline"} size={22} color={color} />
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
