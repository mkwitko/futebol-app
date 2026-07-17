import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { FlatList, Pressable, View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { CreateGroupSheet } from "@/components/groups/create-group-sheet";
import { GroupCard } from "@/components/groups/group-card";
import { QueryState } from "@/components/shared/query-state";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/common/use-toast";
import { useListMyGroups } from "@/api/generated/hooks/groupsHooks";
import { colors } from "@/lib/theme";

/** Grupos — os grupos/peladas que o jogador organiza ou participa. */
export default function GruposScreen() {
  const { t } = useTranslation(["groups", "common"]);
  const router = useRouter();
  const toast = useToast();
  const [sheetVisible, setSheetVisible] = useState(false);

  const { data: groups, isPending, isError, refetch } = useListMyGroups();

  return (
    <ScreenContainer scroll={false} className="gap-4">
      <ScreenHeader
        title={t("groups:list.title")}
        subtitle={t("groups:list.subtitle")}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("groups:list.createCta")}
            testID="peladas-open-create-sheet"
            onPress={() => setSheetVisible(true)}
            className="h-11 w-11 items-center justify-center rounded-full bg-primary active:bg-primary-press"
          >
            <Ionicons name="add" size={24} color={colors.bg} />
          </Pressable>
        }
      />

      {toast.message ? (
        <Toast variant="success" onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      <QueryState
        isPending={isPending}
        isError={isError}
        isEmpty={(groups?.length ?? 0) === 0}
        errorMessage={t("groups:list.loadError")}
        retryLabel={t("common:actions.retry")}
        onRetry={() => void refetch()}
        emptyTitle={t("groups:list.emptyTitle")}
        emptyDescription={t("groups:list.emptyDescription")}
        emptyActionLabel={t("groups:list.emptyCta")}
        onEmptyAction={() => setSheetVisible(true)}
      >
        <FlatList
          data={groups ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => router.push({ pathname: "/group/[id]", params: { id: item.id } })}
            />
          )}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerClassName="pb-6"
          className="flex-1"
        />
      </QueryState>

      <CreateGroupSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onCreated={() => {
          setSheetVisible(false);
          toast.show(t("groups:create.success"));
        }}
      />
    </ScreenContainer>
  );
}
