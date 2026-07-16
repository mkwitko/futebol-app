import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/layout/screen-container";
import { CreateMatchForm } from "@/components/matches/create-match-form";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useAddSeriesDates } from "@/hooks/series/use-add-series-dates";
import { useCreateSeries } from "@/hooks/series/use-create-series";
import { useCreateMatch } from "@/hooks/matches/use-create-match";
import { combineDateAndTime } from "@/lib/datetime/format";
import { reaisInputToCents } from "@/lib/money";
import type { CreateMatchFormValues } from "@/schemas/matches/create-match.schema";

/** Criar pelada — form completo (data/horário, local, vagas, preço, PIX, recorrência). */
export default function CreateMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation("matches");
  const [formError, setFormError] = useState<string | null>(null);
  const createMatch = useCreateMatch(id);
  const createSeries = useCreateSeries(id);
  const addSeriesDates = useAddSeriesDates(id);

  const onSubmit = async (values: CreateMatchFormValues) => {
    setFormError(null);
    const datetime = combineDateAndTime(values.date, values.time);
    const { recurrence } = values;

    try {
      if (!recurrence) {
        const match = await createMatch.mutateAsync({
          datetime: datetime.toISOString(),
          location: values.location,
          slots: values.slots,
          priceCents: reaisInputToCents(values.priceInput),
          pixKey: values.pixKey?.trim() ? values.pixKey.trim() : undefined,
        });
        router.replace({ pathname: "/match/[id]", params: { id: match.id, created: "1" } });
        return;
      }

      const series = await createSeries.mutateAsync({
        rule: recurrence.rule,
        time: recurrence.time,
        location: values.location,
        slots: values.slots,
        priceCents: reaisInputToCents(values.priceInput),
        pixKey: values.pixKey?.trim() ? values.pixKey.trim() : undefined,
        startDate: datetime.toISOString(),
        endDate: null,
      });

      if (recurrence.rule.kind === "manual" && recurrence.dates?.length) {
        await addSeriesDates.mutateAsync(series.id, {
          dates: recurrence.dates.map((d) => d.toISOString()),
        });
      }

      router.replace({ pathname: "/series/[id]", params: { id: series.id, created: "1" } });
    } catch {
      setFormError(t("create.error"));
    }
  };

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader title={t("create.title")} onBack={() => router.back()} />
      <CreateMatchForm onSubmit={onSubmit} submitting={createMatch.isPending} formError={formError} />
    </ScreenContainer>
  );
}
