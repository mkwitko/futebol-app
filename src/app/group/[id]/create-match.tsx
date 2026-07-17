import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "@/components/layout/screen-container";
import { CreateMatchForm } from "@/components/matches/create-match-form";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useAddSeriesDates } from "@/hooks/series/use-add-series-dates";
import { useCreateSeries } from "@/hooks/series/use-create-series";
import { useCreateMatch } from "@/hooks/matches/use-create-match";
import { combineDateAndTime } from "@/lib/datetime/format";
import { reaisInputToCents } from "@/lib/money";
import { useEndSeries as useEndSeriesMutation } from "@/api/generated/hooks/seriesHooks";
import { SERIES } from "@/api/modules/series";
import type { CreateMatchFormValues } from "@/schemas/matches/create-match.schema";

/** Criar pelada — form completo (data/horário, local, vagas, preço, PIX, recorrência). */
export default function CreateMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation("matches");
  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createMatch = useCreateMatch(id);
  const createSeries = useCreateSeries(id);
  const addSeriesDates = useAddSeriesDates(id);
  // Hook "cru" (não o wrapper de src/hooks/series/use-end-series.ts): aquele
  // wrapper fixa o seriesId na criação do hook, pensado para a tela de
  // detalhe da série; aqui o id só existe depois que `createSeries` resolve,
  // então usamos a mutation gerada direto, passando o id em cada chamada.
  const endSeries = useEndSeriesMutation();

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
          modality: values.modality,
          latitude: values.latitude ?? undefined,
          longitude: values.longitude ?? undefined,
          city: values.city ?? undefined,
          address: values.address ?? undefined,
        });
        router.replace({ pathname: "/match/[id]", params: { id: match.id, created: "1" } });
        return;
      }

      if (recurrence.rule.kind === "manual" && !recurrence.dates?.length) {
        setFormError(t("create.manualNoDates"));
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
        try {
          await addSeriesDates.mutateAsync(series.id, {
            dates: recurrence.dates.map((d) => d.toISOString()),
          });
        } catch (addDatesError) {
          // A série já foi criada no servidor nesse ponto. Se falhar ao
          // adicionar as datas (timeout/conexão caiu), essa série fica órfã
          // (zero ocorrências) e um retry do usuário criaria uma segunda
          // série duplicada. Encerramos a órfã para que ela vire inerte —
          // um retry então cria só uma série nova, sem acumular duplicatas.
          try {
            await endSeries.mutateAsync({ id: series.id });
            void queryClient.invalidateQueries({ queryKey: SERIES.queryKeyRoot(id) });
          } catch {
            // Rollback falhou — não mascara o erro original abaixo; a série
            // órfã pode persistir, mas o usuário ainda vê o erro de criação.
          }
          throw addDatesError;
        }
      }

      router.replace({ pathname: "/series/[id]", params: { id: series.id, created: "1" } });
    } catch {
      setFormError(t("create.error"));
    }
  };

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader title={t("create.title")} onBack={() => router.back()} />
      <CreateMatchForm
        onSubmit={onSubmit}
        submitting={
          createMatch.isPending ||
          createSeries.isPending ||
          addSeriesDates.isPending ||
          endSeries.isPending
        }
        formError={formError}
      />
    </ScreenContainer>
  );
}
