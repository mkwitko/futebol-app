import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useGetMatch } from "@/api/generated/hooks/matchesHooks";
import { useGetGroup } from "@/api/generated/hooks/groupsHooks";
import { ScreenContainer } from "@/components/layout/screen-container";
import { EditMatchForm } from "@/components/matches/edit-match-form";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUpdateMatch } from "@/hooks/matches/use-update-match";
import { combineDateAndTime } from "@/lib/datetime/format";
import { reaisInputToCents } from "@/lib/money";
import {
  type EditMatchFormValues,
  editMatchValuesFromMatch,
} from "@/schemas/matches/edit-match.schema";

/** Editar pelada — só o dono do grupo, só enquanto a partida é editável. */
export default function EditMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation(["matches", "common"]);
  const { user } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const matchQuery = useGetMatch(id);
  const match = matchQuery.data;
  const groupQuery = useGetGroup(match?.groupId, { query: { enabled: !!match?.groupId } });

  const isOwner = !!groupQuery.data && groupQuery.data.ownerId === user?.id;
  const isEditable = match?.status !== "finished" && match?.status !== "cancelled";
  const detachesFromSeries = !!match?.seriesId && !match.detached;

  const updateMatch = useUpdateMatch(id, match?.groupId);

  const onSubmit = async (values: EditMatchFormValues) => {
    setFormError(null);
    const datetime = combineDateAndTime(values.date, values.time);
    try {
      await updateMatch.mutateAsync({
        datetime: datetime.toISOString(),
        location: values.location,
        slots: values.slots,
        priceCents: reaisInputToCents(values.priceInput),
        pixKey: values.pixKey?.trim() ? values.pixKey.trim() : null,
        modality: values.modality,
        latitude: values.latitude ?? undefined,
        longitude: values.longitude ?? undefined,
        city: values.city ?? null,
        address: values.address ?? null,
      });
      router.back();
    } catch {
      setFormError(t("edit.error"));
    }
  };

  const loading = matchQuery.isPending || (!!match?.groupId && groupQuery.isPending);

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader title={t("edit.title")} onBack={() => router.back()} />

      {loading ? (
        <View className="gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
        </View>
      ) : matchQuery.isError ? (
        <View className="items-center gap-3 py-6">
          <Text variant="muted">{t("edit.error")}</Text>
          <Button variant="secondary" onPress={() => void matchQuery.refetch()}>
            {t("common:actions.retry")}
          </Button>
        </View>
      ) : match && !isOwner ? (
        <Text variant="muted">{t("edit.notOwner")}</Text>
      ) : match && !isEditable ? (
        <Text variant="muted">{t("edit.notEditable")}</Text>
      ) : match ? (
        <EditMatchForm
          initialValues={editMatchValuesFromMatch(match)}
          onSubmit={onSubmit}
          submitting={updateMatch.isPending}
          formError={formError}
          detachesFromSeries={detachesFromSeries}
        />
      ) : null}
    </ScreenContainer>
  );
}
