import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formatação de datas — camada mínima (Fase 0). O backend envia ISO em UTC
 * (`Z`); `new Date(iso)` já resolve para o fuso do device ao formatar, então
 * não é necessário `date-fns-tz` aqui. Sem palavras naturais no template (só
 * tokens de data/hora) para não embutir texto pt-BR fora do i18n.
 */

export function formatShortDate(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy", { locale: ptBR });
}

export function formatMatchDateTime(iso: string): string {
  return format(new Date(iso), "dd/MM · HH:mm", { locale: ptBR });
}

export function formatTime(iso: string): string {
  return format(new Date(iso), "HH:mm", { locale: ptBR });
}

/**
 * Combina a data (dia/mês/ano) escolhida em um picker com o horário
 * (hora/minuto) escolhido em outro — usado no form de criar pelada, que
 * expõe dois campos separados (`DateTimeField` com `mode="date"`/`"time"`).
 */
export function combineDateAndTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return combined;
}

/**
 * Minutos desde a meia-noite (ex.: `startMinute`/`endMinute` da disponibilidade
 * de quadra) → "HH:MM". Mesma fórmula do `minutesToTime` do futebol-web
 * (`price-rules-editor.tsx`) — mantém os dois clientes consistentes.
 */
export function minutesToTime(minutes: number): string {
  const hh = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mm = (minutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * `Date` (calendário local, sem hora) → `"yyyy-MM-dd"` — formato exigido pelo
 * query param `date` de `GET /courts/:id/availability` (`z.iso.date()` no
 * backend). Não usar `.toISOString()` aqui: converteria pro UTC e poderia
 * mudar o dia em fusos negativos (ex.: 23h de São Paulo vira o dia seguinte em UTC).
 */
export function formatDateParam(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Rótulo de dia pro cabeçalho da tela de disponibilidade — "sábado, 18 de julho". */
export function formatDayLabel(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

/**
 * `"yyyy-MM-dd"` (sem hora, ex.: `booking.date` de `GET /bookings/mine`) →
 * `"dd/MM/yyyy"`. Usa `date-fns/parse` (não `new Date(string)`): a string
 * teria sido interpretada como meia-noite UTC, o que em fusos negativos (ex.:
 * Brasil, UTC-3) mostraria o dia anterior — mesmo cuidado de `formatDateParam`.
 */
export function formatDateOnly(dateOnly: string): string {
  return format(parse(dateOnly, "yyyy-MM-dd", new Date()), "dd/MM/yyyy");
}

/**
 * Rótulo relativo para a próxima partida — SEM texto pt-BR (regra do módulo):
 * retorna um discriminated union que o componente mapeia via i18n. `now` é
 * injetado (determinístico/testável). Compara por dia de calendário local.
 */
export type MatchCountdown =
  | { kind: "today"; time: string }
  | { kind: "tomorrow"; time: string }
  | { kind: "days"; days: number }
  | { kind: "absolute"; label: string };

export function matchCountdown(iso: string, now: Date): MatchCountdown {
  const target = new Date(iso);
  if (target.getTime() <= now.getTime()) {
    return { kind: "absolute", label: formatMatchDateTime(iso) };
  }
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(target) - startOfDay(now)) / 86_400_000);
  if (dayDiff === 0) return { kind: "today", time: format(target, "HH:mm", { locale: ptBR }) };
  if (dayDiff === 1) return { kind: "tomorrow", time: format(target, "HH:mm", { locale: ptBR }) };
  if (dayDiff >= 2 && dayDiff <= 6) return { kind: "days", days: dayDiff };
  return { kind: "absolute", label: formatMatchDateTime(iso) };
}

