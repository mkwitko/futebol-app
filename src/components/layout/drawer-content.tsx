import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "expo-router/drawer";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/auth/use-auth";
import { useGetMyPlayer } from "@/api/generated/hooks/playersHooks";
import { bestFieldPosition, fieldPositionAbbreviation } from "@/lib/player/position";
import { colors, fonts } from "@/lib/theme";

export function DrawerAppContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      // `signOut` limpa o cache e navega pra `(auth)` — o diálogo desmonta junto.
      await signOut();
    } finally {
      setSigningOut(false);
      setConfirmingSignOut(false);
    }
  };
  const { data: player, isPending } = useGetMyPlayer({
    query: { enabled: Boolean(user), refetchOnMount: true },
  });
  const loadingPlayer = Boolean(user) && isPending;

  const name = player?.name ?? user?.name ?? "";
  const city = user?.lastCity ?? null;
  const overall = player?.generalOverall ?? null;
  const best = bestFieldPosition(
    (player?.overallByPosition ?? {}) as Partial<Record<string, number>>,
  );
  const positionAbbr = best ? fieldPositionAbbreviation(best.pos) : null;

  const goToProfile = () => {
    props.navigation.closeDrawer();
    router.push("/perfil");
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <Pressable onPress={goToProfile} accessibilityRole="button" testID="drawer-banner">
        <View
          style={{
            paddingTop: insets.top + 24,
            paddingBottom: 24,
            paddingHorizontal: 16,
            alignItems: "center",
            gap: 8,
          }}
        >
          {loadingPlayer ? (
            <View testID="drawer-banner-skeleton" style={{ alignItems: "center", gap: 8 }}>
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </View>
          ) : (
            <>
              <Avatar name={name} uri={player?.avatarUrl} size="xl" />
              <Text
                className="text-center text-lg text-ink"
                style={{ fontFamily: fonts.display }}
              >
                {name}
              </Text>
              {(overall != null || positionAbbr || city) && (
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  {overall != null && (
                    <View
                      className="flex-row items-center rounded-full px-2 py-0.5"
                      style={{ backgroundColor: colors.primary, gap: 4 }}
                    >
                      <Text style={{ color: colors.bg }} className="text-sm font-display">
                        {overall}
                      </Text>
                      {positionAbbr && (
                        <>
                          <Text style={{ color: colors.bg }} className="text-sm font-display">
                            ·
                          </Text>
                          <Text style={{ color: colors.bg }} className="text-sm font-display">
                            {positionAbbr}
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                  {overall == null && positionAbbr && (
                    <Text className="text-sm text-muted">{positionAbbr}</Text>
                  )}
                  {city && <Text className="text-sm text-muted">{city}</Text>}
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>
      <View>
        <DrawerItemList {...props} />
      </View>

      <Pressable
        testID="drawer-sign-out"
        accessibilityRole="button"
        onPress={() => setConfirmingSignOut(true)}
        className="active:opacity-70"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
          marginTop: 8,
          marginBottom: insets.bottom + 8,
        }}
      >
        <Ionicons name="log-out-outline" size={22} color={colors.danger} />
        <Text style={{ color: colors.danger }} className="font-body-medium">
          {t("actions.signOut")}
        </Text>
      </Pressable>

      <ConfirmDialog
        visible={confirmingSignOut}
        title={t("signOutConfirm.title")}
        message={t("signOutConfirm.message")}
        confirmLabel={t("actions.signOut")}
        cancelLabel={t("actions.cancel")}
        destructive
        loading={signingOut}
        onConfirm={() => void handleSignOut()}
        onCancel={() => setConfirmingSignOut(false)}
      />
    </DrawerContentScrollView>
  );
}
