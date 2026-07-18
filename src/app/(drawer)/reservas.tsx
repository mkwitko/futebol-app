import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import { useListMyBookings } from "@/api/generated/hooks/bookingsHooks/useListMyBookings";
import type { ListMyBookings200 } from "@/api/generated/types/ListMyBookings";
import { BOOKINGS } from "@/api/modules/bookings";
import { MyBookingCard } from "@/components/booking/my-booking-card";
import { ScreenContainer } from "@/components/layout/screen-container";
import { QueryState } from "@/components/shared/query-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Toast } from "@/components/ui/toast";
import { useCancelBooking } from "@/hooks/bookings/use-cancel-booking";
import { useToast } from "@/hooks/common/use-toast";

type Booking = ListMyBookings200[number];

/** 409 `BKG.BAD_STATE` — o status já mudou (webhook/organizador/expiração) antes do cancelamento chegar. */
const BAD_STATE_CODE = "BKG-T0005";

/**
 * "Minhas reservas" (Task A3) — lista `GET /bookings/mine`, mais recente
 * primeiro (`createdAt` desc). Cancelamento (`POST /bookings/:id/cancel`) só
 * aparece nos status ainda "vivos" (`requested`/`pending_payment`/`confirmed`,
 * ver `MyBookingCard`) — espelha `CANCELLABLE_STATUSES` do backend
 * (`cancel-booking.service.ts`). Um 409 `BKG.BAD_STATE` (a corrida foi
 * perdida — a reserva já tinha mudado de status) não trava a tela: mostra um
 * aviso amigável e recarrega a lista.
 */
export default function MinhasReservasScreen() {
  const { t } = useTranslation(["booking", "common"]);
  const toast = useToast();
  const queryClient = useQueryClient();

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const bookingsQuery = useListMyBookings();
  const cancelBooking = useCancelBooking();

  const bookings = [...(bookingsQuery.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  function handleConfirmCancel() {
    if (!cancelTarget) return;
    const { id } = cancelTarget;
    setCancelTarget(null);

    cancelBooking.mutate(
      { id },
      {
        onSuccess: () => toast.show(t("booking:mine.cancel.success")),
        onError: (error) => {
          const code = error instanceof ApiError ? (error.data as { code?: string } | undefined)?.code : undefined;
          if (code === BAD_STATE_CODE) {
            toast.show(t("booking:mine.cancel.staleState"));
            void queryClient.invalidateQueries({ queryKey: BOOKINGS.mineQueryKeyRoot });
            return;
          }
          toast.show(t("booking:mine.cancel.genericError"), "danger");
        },
      },
    );
  }

  return (
    <ScreenContainer scroll={false} className="gap-4">
      <ScreenHeader title={t("booking:mine.title")} />

      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      <QueryState
        isPending={bookingsQuery.isPending}
        isError={bookingsQuery.isError}
        isEmpty={bookings.length === 0}
        errorMessage={t("booking:mine.loadError")}
        retryLabel={t("common:actions.retry")}
        onRetry={() => void bookingsQuery.refetch()}
        emptyTitle={t("booking:mine.empty")}
      >
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MyBookingCard
              booking={item}
              onCancel={() => setCancelTarget(item)}
              cancelling={cancelBooking.isPending && cancelBooking.variables?.id === item.id}
            />
          )}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerClassName="pb-6"
          className="flex-1"
        />
      </QueryState>

      <ConfirmDialog
        visible={cancelTarget != null}
        title={t("booking:mine.cancel.confirmTitle")}
        message={t("booking:mine.cancel.confirmMessage")}
        confirmLabel={t("common:actions.confirm")}
        cancelLabel={t("common:actions.cancel")}
        destructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </ScreenContainer>
  );
}
