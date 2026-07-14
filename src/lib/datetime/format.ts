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
