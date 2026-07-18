import { format } from "date-fns";
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

