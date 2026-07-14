import { listAttendanceQueryKey } from "@/api/generated/hooks/attendanceHooks";

/**
 * Constantes do módulo `attendance` — usadas para invalidação de cache
 * (nunca string crua). A lista de presença é escopada por pelada, então a
 * raiz da query-key depende do `matchId`. Ver KUBB.md §8 na skill do app.
 */
export const ATTENDANCE = {
  queryKeyRoot: (matchId: string) => listAttendanceQueryKey(matchId),
} as const;
