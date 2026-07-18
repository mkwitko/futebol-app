import { useQueryClient } from "@tanstack/react-query";
import { useCancelBooking as useCancelBookingMutation } from "@/api/generated/hooks/bookingsHooks";
import { BOOKINGS } from "@/api/modules/bookings";

/**
 * Cancela uma reserva (`POST /bookings/:id/cancel`) e invalida `GET
 * /bookings/mine` em caso de sucesso — usado pela tela "Minhas reservas"
 * (Task A3). O chamador ainda trata o 409 `BKG-T0005` (`BAD_STATE` — status
 * mudou antes do cancelamento chegar) no `onError` da chamada.
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useCancelBookingMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: BOOKINGS.mineQueryKeyRoot });
      },
    },
  });
}
