import { useTranslation } from "react-i18next";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { ListMyBookings200StatusEnumKey } from "@/api/generated/types/ListMyBookings";

/**
 * Cor por status de reserva (`Booking.status`) — espelha as
 * `CANCELLABLE_STATUSES` do backend (`cancel-booking.service.ts`) na semântica:
 * `confirmed` (positivo) vira `primary`; encerramentos negativos
 * (`cancelled`/`rejected`/`expired`) viram `danger`; `completed` (passado,
 * neutro) vira `line`; os dois estados "em andamento"
 * (`requested`/`pending_payment`) viram `neutral`.
 */
const STATUS_BADGE_VARIANT: Record<ListMyBookings200StatusEnumKey, BadgeVariant> = {
  requested: "neutral",
  pending_payment: "neutral",
  confirmed: "primary",
  completed: "line",
  cancelled: "danger",
  rejected: "danger",
  expired: "danger",
};

export type BookingStatusBadgeProps = {
  status: ListMyBookings200StatusEnumKey;
};

/** Badge de status — usado no card de "Minhas reservas" (Task A3). */
export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const { t } = useTranslation("booking");

  return <Badge variant={STATUS_BADGE_VARIANT[status]}>{t(`mine.status.${status}`)}</Badge>;
}
