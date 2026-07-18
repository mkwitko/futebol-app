import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, Pressable, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { addDays, startOfDay } from "date-fns";
import { AvailabilitySlotList, type AvailabilitySlot } from "@/components/court/availability-slot-list";
import { ScreenContainer } from "@/components/layout/screen-container";
import { QueryState } from "@/components/shared/query-state";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/common/use-toast";
import { formatDateParam, formatDayLabel, minutesToTime } from "@/lib/datetime/format";
import { formatCentsToBRL } from "@/lib/money";
import { useGetCourtAvailability } from "@/api/generated/hooks/bookingsHooks/useGetCourtAvailability";

/**
 * Disponibilidade de horários de uma quadra (`Court`) — data (padrão hoje,
 * navegação dia a dia ou pulo direto via picker nativo) + grid de horários
 * livres/ocupados com preço (`GET /courts/:id/availability?date=`).
 *
 * Selecionar um horário livre é o ponto de handoff pra Task A2 (reservar +
 * pagar PIX): esta tela só sinaliza a seleção (resumo + toast), sem criar a
 * reserva — `handleReserve` abaixo é onde A2 troca isso por `POST /bookings`
 * e navegação pro checkout.
 */
export default function CourtAvailabilityScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const router = useRouter();
  const { t } = useTranslation(["booking", "common"]);
  const toast = useToast();

  const [date, setDate] = useState(() => new Date());
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const availabilityQuery = useGetCourtAvailability(id, { date: formatDateParam(date) });
  const slots = availabilityQuery.data ?? [];

  function changeDay(deltaDays: number) {
    setSelected(null);
    setDate((current) => addDays(current, deltaDays));
  }

  function selectDate(next: Date) {
    setSelected(null);
    setDate(next);
  }

  function handleDatePickerChange(event: DateTimePickerEvent, next?: Date) {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    if (next) selectDate(next);
    // Android: o diálogo se fecha sozinho após a escolha. iOS: o spinner
    // (`display="spinner"`) é inline e dispara `set` a cada tick do scroll —
    // fechar aqui abortaria a rolagem; o usuário fecha tocando no rótulo de
    // novo (o Pressable faz toggle), mesmo padrão de `DateTimeField`.
    if (Platform.OS !== "ios") setShowDatePicker(false);
  }

  function handleSelectSlot(slot: AvailabilitySlot) {
    if (!slot.available) return;
    setSelected((current) => (current?.startMinute === slot.startMinute ? null : slot));
  }

  function handleReserve() {
    if (!selected) return;
    // TODO(A2): substituir por `POST /bookings` ({ courtId: id, date, startMinute, endMinute })
    // seguido da navegação pro checkout PIX. Ver task-A1-brief.md § Task A2.
    toast.show(
      t("booking:availability.selected.comingSoonToast", {
        time: `${minutesToTime(selected.startMinute)}–${minutesToTime(selected.endMinute)}`,
        price: formatCentsToBRL(selected.priceCents),
      }),
    );
  }

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader
        title={t("booking:availability.title")}
        subtitle={name || undefined}
        onBack={() => router.back()}
      />

      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      <Text variant="muted">{t("booking:availability.subtitle")}</Text>

      <View className="flex-row items-center justify-between gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("booking:availability.nav.prev")}
          hitSlop={8}
          onPress={() => changeDay(-1)}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-up"
        >
          <Text className="font-display text-2xl text-ink">‹</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("booking:availability.nav.pickDate")}
          onPress={() => setShowDatePicker((prev) => !prev)}
          className="flex-1 items-center rounded-xl px-2 py-1 active:bg-surface-up"
        >
          <Text variant="display" className="text-lg capitalize" numberOfLines={1}>
            {formatDayLabel(date)}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("booking:availability.nav.next")}
          hitSlop={8}
          onPress={() => changeDay(1)}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-up"
        >
          <Text className="font-display text-2xl text-ink">›</Text>
        </Pressable>
      </View>

      {showDatePicker ? (
        <DateTimePicker
          testID="availability-date-picker"
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={startOfDay(new Date())}
          onChange={handleDatePickerChange}
        />
      ) : null}

      <QueryState
        isPending={availabilityQuery.isPending}
        isError={availabilityQuery.isError}
        isEmpty={slots.length === 0}
        errorMessage={t("booking:availability.loadError")}
        retryLabel={t("common:actions.retry")}
        onRetry={() => void availabilityQuery.refetch()}
        emptyTitle={t("booking:availability.empty")}
      >
        <AvailabilitySlotList
          slots={slots}
          selectedStartMinute={selected?.startMinute ?? null}
          onSelectSlot={handleSelectSlot}
        />
      </QueryState>

      {selected ? (
        <View
          className="flex-row items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
          testID="availability-selection-summary"
        >
          <Text className="flex-1 font-body-medium text-ink">
            {t("booking:availability.selected.summary", {
              time: `${minutesToTime(selected.startMinute)}–${minutesToTime(selected.endMinute)}`,
              price: formatCentsToBRL(selected.priceCents),
            })}
          </Text>
          <Button size="sm" onPress={handleReserve}>
            {t("booking:availability.selected.reserve")}
          </Button>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
