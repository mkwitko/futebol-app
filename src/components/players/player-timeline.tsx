import { differenceInCalendarDays, isToday, isYesterday } from "date-fns";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import type { GetPlayerTimeline200 } from "@/api/generated/types/GetPlayerTimeline";

type TimelineEvent = GetPlayerTimeline200["events"][number];

type Bucket = "hoje" | "ontem" | "semana" | "antes";

function bucketOf(datetime: string): Bucket {
  const d = new Date(datetime);
  if (isToday(d)) return "hoje";
  if (isYesterday(d)) return "ontem";
  return differenceInCalendarDays(new Date(), d) <= 7 ? "semana" : "antes";
}

const BUCKET_ORDER: Bucket[] = ["hoje", "ontem", "semana", "antes"];

/**
 * Timeline do jogador (estilo feed) — agrupa os marcos por Hoje / Ontem / Esta
 * semana / Antes a partir do `datetime` de cada evento. Alimentada por
 * `GET /players/:id/timeline`.
 */
export function PlayerTimeline({
  events,
  title,
}: {
  events: readonly TimelineEvent[];
  title?: string;
}) {
  const { t } = useTranslation("player");
  if (events.length === 0) return null;

  const grouped = new Map<Bucket, TimelineEvent[]>();
  for (const e of events) {
    const b = bucketOf(e.datetime);
    const arr = grouped.get(b) ?? [];
    arr.push(e);
    grouped.set(b, arr);
  }

  return (
    <View className="gap-4">
      {title ? (
        <Text variant="display" className="text-lg">
          {title}
        </Text>
      ) : null}

      {BUCKET_ORDER.filter((b) => grouped.has(b)).map((b) => (
        <View key={b} className="gap-2">
          <Text variant="muted" className="text-xs uppercase tracking-wide">
            {t(`timeline.buckets.${b}`)}
          </Text>
          {(grouped.get(b) ?? []).map((e, i) => (
            <View
              key={`${e.matchId}-${e.type}-${i}`}
              className="flex-row items-center gap-3 rounded-xl border border-line bg-surface-up p-3"
            >
              <Text className="text-2xl">{e.icon}</Text>
              <Text className="flex-1 font-body-semibold text-ink">{e.text}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
