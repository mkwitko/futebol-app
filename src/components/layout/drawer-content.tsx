import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "expo-router/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/auth/use-auth";
import { useGetMyPlayer } from "@/api/generated/hooks/playersHooks";
import { bestFieldPosition, fieldPositionAbbreviation } from "@/lib/player/position";
import { colors, fonts } from "@/lib/theme";

export function DrawerAppContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: player, isPending } = useGetMyPlayer();

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
        <LinearGradient
          colors={[colors.primary, colors.primaryPress]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingVertical: 24, paddingHorizontal: 16, alignItems: "center", gap: 8 }}
        >
          {isPending ? (
            <View testID="drawer-banner-skeleton" style={{ alignItems: "center", gap: 8 }}>
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </View>
          ) : (
            <>
              <Avatar name={name} uri={player?.avatarUrl} size="xl" />
              <Text
                className="text-center text-lg"
                style={{ color: "#FFFFFF", fontFamily: fonts.display }}
              >
                {name}
              </Text>
              {(overall != null || positionAbbr || city) && (
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  {overall != null && (
                    <View
                      className="flex-row items-center rounded-full px-2 py-0.5"
                      style={{ backgroundColor: "rgba(11,20,15,0.35)", gap: 4 }}
                    >
                      <Text style={{ color: "#FFFFFF" }} className="text-sm font-display">
                        {overall}
                      </Text>
                      {positionAbbr && (
                        <>
                          <Text style={{ color: "#FFFFFF" }} className="text-sm font-display">
                            ·
                          </Text>
                          <Text style={{ color: "#FFFFFF" }} className="text-sm font-display">
                            {positionAbbr}
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                  {overall == null && positionAbbr && (
                    <Text style={{ color: "#FFFFFF" }} className="text-sm">
                      {positionAbbr}
                    </Text>
                  )}
                  {city && (
                    <Text style={{ color: "#FFFFFF" }} className="text-sm">
                      {city}
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
        </LinearGradient>
      </Pressable>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}
