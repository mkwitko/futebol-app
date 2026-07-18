import { getCourtAvailabilityQueryKey, listMyBookingsQueryKey } from "@/api/generated/hooks/bookingsHooks";

/**
 * Constantes do módulo `bookings` — usadas para invalidação de cache (nunca
 * string crua). Ver KUBB.md §8 na skill do app.
 *
 * - `mineQueryKeyRoot`: raiz de `GET /bookings/mine` — a tela "Minhas
 *   reservas" (Task A3) invalida por ela após cancelar uma reserva.
 * - `availabilityQueryKey`: key de `GET /courts/:id/availability` pro par
 *   quadra+data — invalidada logo após `POST /bookings` ter sucesso
 *   (`court/[id]/reserve.tsx`), fechando o débito deixado pela Task A2: sem
 *   isto, o slot recém-reservado continuava aparecendo como livre na tela de
 *   disponibilidade até o cache expirar sozinho.
 */
export const BOOKINGS = {
  mineQueryKeyRoot: listMyBookingsQueryKey(),
  availabilityQueryKey: (courtId: string, date: string) =>
    getCourtAvailabilityQueryKey(courtId, { date }),
} as const;
