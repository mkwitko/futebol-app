import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { formatDateOnly, minutesToTime } from "@/lib/datetime/format";
import { formatCentsToBRL } from "@/lib/money";
import type { ListMyBookings200, ListMyBookings200StatusEnumKey } from "@/api/generated/types/ListMyBookings";

/** Espelha `CANCELLABLE_STATUSES` de `cancel-booking.service.ts` — o botão só aparece nesses status. */
const CANCELLABLE_STATUSES: ReadonlySet<ListMyBookings200StatusEnumKey> = new Set([
  "requested",
  "pending_payment",
  "confirmed",
]);

export type MyBookingCardProps = {
  booking: ListMyBookings200[number];
  onCancel: () => void;
  cancelling: boolean;
};

/**
 * Card de uma reserva na tela "Minhas reservas" (Task A3). `GET /bookings/mine`
 * não traz nome de quadra/venue (só `courtId`) — mostra um rótulo genérico
 * até o backend anexar esse dado (fora do escopo desta task).
 */
export function MyBookingCard({ booking, onCancel, cancelling }: MyBookingCardProps) {
  const { t } = useTranslation(["booking", "court"]);

  const timeRange = `${minutesToTime(booking.startMinute)}–${minutesToTime(booking.endMinute)}`;
  const canCancel = CANCELLABLE_STATUSES.has(booking.status);

  return (
    <Card className="gap-3" testID={`my-booking-${booking.id}`}>
      <View className="flex-row items-start justify-between gap-3">
        <Text variant="display" className="flex-1 text-lg" numberOfLines={1}>
          {t("booking:mine.item.courtFallback")}
        </Text>
        <BookingStatusBadge status={booking.status} />
      </View>

      <Text className="font-body-medium text-ink">
        {formatDateOnly(booking.date)} · {timeRange}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text variant="muted" className="text-sm">
          {t(`court:bookingMode.${booking.mode}`)}
        </Text>
        <Text className="font-body-semibold text-ink">{formatCentsToBRL(booking.priceCents)}</Text>
      </View>

      {canCancel ? (
        <Button
          variant="danger"
          size="sm"
          onPress={onCancel}
          loading={cancelling}
          testID={`my-booking-cancel-${booking.id}`}
        >
          {t("booking:mine.cancel.cta")}
        </Button>
      ) : null}
    </Card>
  );
}
