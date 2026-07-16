import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Stepper } from "@/components/ui/stepper";
import { Text } from "@/components/ui/text";
import { combineDateAndTime } from "@/lib/datetime/format";
import { DateTimeField } from "./date-time-field";

export type WeeklyRule = { kind: "weekly"; weekdays: number[]; interval: number };
export type MonthlyDomRule = { kind: "monthly_dom"; day: number };
export type MonthlyNthWeek = 1 | 2 | 3 | 4 | -1;
export type MonthlyNthRule = { kind: "monthly_nth"; week: MonthlyNthWeek; weekday: number };
export type ManualRule = { kind: "manual" };
export type RecurrenceRule = WeeklyRule | MonthlyDomRule | MonthlyNthRule | ManualRule;

/**
 * Valor emitido pelo `RecurrencePicker` — `null` significa pelada avulsa (sem
 * série). `time` é sempre "HH:mm" em UTC (ou `null` no modo manual, onde cada
 * data já carrega seu próprio horário em `dates`). `dates` só existe quando
 * `rule.kind === "manual"`.
 */
export type RecurrenceValue = {
  rule: RecurrenceRule;
  time: string | null;
  dates?: Date[];
};

type RecurrenceMode = "none" | "weekly" | "biweekly" | "monthly" | "manual";
type MonthlyVariant = "dom" | "nth";

export type RecurrencePickerProps = {
  value: RecurrenceValue | null;
  onChange: (value: RecurrenceValue | null) => void;
  /**
   * Data/horário já escolhidos no passo anterior do form (1ª ocorrência) —
   * usada para semear defaults (dia da semana, dia do mês, horário) e como
   * ponto de partida do modo manual.
   */
  baseDatetime: Date;
  className?: string;
};

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
const MONTHLY_WEEKS: MonthlyNthWeek[] = [1, 2, 3, 4, -1];

/**
 * "HH:mm" em UTC — a série guarda o horário como UTC puro (ver Task 9/backend).
 * Deriva via `getUTCHours`/`getUTCMinutes` (device-timezone-independente) —
 * NUNCA usar `formatTime` aqui: aquele helper lê hora/minuto LOCAL do `Date`
 * (para exibição), o que produziria um horário errado combinado com o
 * weekday/day-of-month UTC já usados pelos defaults deste picker.
 */
export function toRuleTime(baseDatetime: Date): string {
  const hours = String(baseDatetime.getUTCHours()).padStart(2, "0");
  const minutes = String(baseDatetime.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function buildWeeklyRule(weekdays: number[], interval: number): WeeklyRule {
  return { kind: "weekly", weekdays: [...weekdays].sort((a, b) => a - b), interval };
}

export function buildMonthlyDomRule(day: number): MonthlyDomRule {
  return { kind: "monthly_dom", day };
}

export function buildMonthlyNthRule(week: MonthlyNthWeek, weekday: number): MonthlyNthRule {
  return { kind: "monthly_nth", week, weekday };
}

export const MANUAL_RULE: ManualRule = { kind: "manual" };

/** Deriva qual segmento do seletor está ativo a partir do valor atual — sem estado duplicado. */
function activeMode(value: RecurrenceValue | null): RecurrenceMode {
  if (!value) return "none";
  if (value.rule.kind === "weekly") return value.rule.interval > 1 ? "biweekly" : "weekly";
  if (value.rule.kind === "monthly_dom" || value.rule.kind === "monthly_nth") return "monthly";
  return "manual";
}

/**
 * Passo "Repete?" do criar-pelada — seletor de padrão (avulsa/semanal/
 * quinzenal-N-semanas/mensal/manual) com campos condicionais. Totalmente
 * controlado: nenhuma seleção fica em estado interno — tudo é derivado de
 * `value` (mais `baseDatetime` para semear defaults ao trocar de modo).
 */
export function RecurrencePicker({ value, onChange, baseDatetime, className }: RecurrencePickerProps) {
  const { t } = useTranslation("matches");
  const mode = activeMode(value);
  const monthlyVariant: MonthlyVariant = value?.rule.kind === "monthly_nth" ? "nth" : "dom";

  // Índice = dia (0=Dom..6=Sáb) — pré-resolvidos com chaves literais porque o
  // `TFunction` gerado a partir dos recursos só aceita chaves conhecidas em
  // tempo de compilação (não aceita `weekdays.${day}` com `day: number`).
  const weekdayLabels = [
    t("weekdays.0"),
    t("weekdays.1"),
    t("weekdays.2"),
    t("weekdays.3"),
    t("weekdays.4"),
    t("weekdays.5"),
    t("weekdays.6"),
  ];

  const modeOptions: { label: string; value: RecurrenceMode }[] = [
    { label: t("create.recurrenceModes.none"), value: "none" },
    { label: t("create.recurrenceModes.weekly"), value: "weekly" },
    { label: t("create.recurrenceModes.biweekly"), value: "biweekly" },
    { label: t("create.recurrenceModes.monthly"), value: "monthly" },
    { label: t("create.recurrenceModes.manual"), value: "manual" },
  ];

  const handleModeChange = (next: RecurrenceMode) => {
    const currentWeekdays = value?.rule.kind === "weekly" ? value.rule.weekdays : [baseDatetime.getUTCDay()];
    const time = toRuleTime(baseDatetime);

    switch (next) {
      case "none":
        onChange(null);
        return;
      case "weekly":
        onChange({ rule: buildWeeklyRule(currentWeekdays, 1), time });
        return;
      case "biweekly": {
        const interval = value?.rule.kind === "weekly" && value.rule.interval > 1 ? value.rule.interval : 2;
        onChange({ rule: buildWeeklyRule(currentWeekdays, interval), time });
        return;
      }
      case "monthly":
        if (value?.rule.kind === "monthly_dom" || value?.rule.kind === "monthly_nth") {
          onChange({ rule: value.rule, time });
          return;
        }
        onChange({ rule: buildMonthlyDomRule(baseDatetime.getUTCDate()), time });
        return;
      case "manual":
        onChange({ rule: MANUAL_RULE, time: null, dates: value?.dates ?? [] });
    }
  };

  const toggleWeekday = (day: number) => {
    if (value?.rule.kind !== "weekly") return;
    const set = new Set(value.rule.weekdays);
    if (set.has(day)) {
      if (set.size === 1) return; // sempre pelo menos 1 dia selecionado
      set.delete(day);
    } else {
      set.add(day);
    }
    onChange({ ...value, rule: buildWeeklyRule([...set], value.rule.interval) });
  };

  const setInterval = (interval: number) => {
    if (value?.rule.kind !== "weekly") return;
    onChange({ ...value, rule: buildWeeklyRule(value.rule.weekdays, interval) });
  };

  const setMonthlyVariant = (variant: MonthlyVariant) => {
    const time = value?.time ?? toRuleTime(baseDatetime);
    if (variant === "dom") {
      const day = value?.rule.kind === "monthly_dom" ? value.rule.day : baseDatetime.getUTCDate();
      onChange({ rule: buildMonthlyDomRule(day), time });
    } else {
      const weekday = value?.rule.kind === "monthly_nth" ? value.rule.weekday : baseDatetime.getUTCDay();
      const week = value?.rule.kind === "monthly_nth" ? value.rule.week : 1;
      onChange({ rule: buildMonthlyNthRule(week, weekday), time });
    }
  };

  const setMonthlyDay = (day: number) => {
    if (value?.rule.kind !== "monthly_dom") return;
    onChange({ ...value, rule: buildMonthlyDomRule(day) });
  };

  const setMonthlyWeek = (week: MonthlyNthWeek) => {
    if (value?.rule.kind !== "monthly_nth") return;
    onChange({ ...value, rule: buildMonthlyNthRule(week, value.rule.weekday) });
  };

  const setMonthlyWeekday = (weekday: number) => {
    if (value?.rule.kind !== "monthly_nth") return;
    onChange({ ...value, rule: buildMonthlyNthRule(value.rule.week, weekday) });
  };

  const manualDates = value?.rule.kind === "manual" ? value.dates ?? [] : [];

  const addManualDate = () => {
    onChange({ rule: MANUAL_RULE, time: null, dates: [...manualDates, new Date(baseDatetime)] });
  };

  const updateManualDate = (index: number, next: Date) => {
    const dates = manualDates.map((d, i) => (i === index ? next : d));
    onChange({ rule: MANUAL_RULE, time: null, dates });
  };

  const removeManualDate = (index: number) => {
    onChange({ rule: MANUAL_RULE, time: null, dates: manualDates.filter((_, i) => i !== index) });
  };

  return (
    <View className={className}>
      <View className="gap-1.5">
        <Text className="font-body-medium text-sm text-muted">{t("create.recurrenceLabel")}</Text>
        <SegmentedControl options={modeOptions} value={mode} onChange={handleModeChange} />
      </View>

      {mode === "weekly" || mode === "biweekly" ? (
        <View className="mt-4 gap-4">
          <View className="gap-1.5">
            <Text className="font-body-medium text-sm text-muted">{t("create.recurrenceWeekdaysLabel")}</Text>
            <View className="flex-row flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <Chip
                  key={day}
                  label={weekdayLabels[day]}
                  selected={value?.rule.kind === "weekly" && value.rule.weekdays.includes(day)}
                  onPress={() => toggleWeekday(day)}
                />
              ))}
            </View>
          </View>

          <Stepper
            label={t("create.recurrenceIntervalLabel")}
            value={value?.rule.kind === "weekly" ? value.rule.interval : 1}
            onChange={setInterval}
            min={1}
            max={12}
            testID="recurrence-interval"
          />
        </View>
      ) : null}

      {mode === "monthly" ? (
        <View className="mt-4 gap-4">
          <SegmentedControl
            options={[
              { label: t("create.recurrenceMonthlyVariant.dom"), value: "dom" },
              { label: t("create.recurrenceMonthlyVariant.nth"), value: "nth" },
            ]}
            value={monthlyVariant}
            onChange={setMonthlyVariant}
          />

          {monthlyVariant === "dom" ? (
            <Stepper
              label={t("create.recurrenceMonthlyDayLabel")}
              value={value?.rule.kind === "monthly_dom" ? value.rule.day : 1}
              onChange={setMonthlyDay}
              min={1}
              max={31}
              testID="recurrence-monthly-day"
            />
          ) : (
            <View className="gap-4">
              <View className="gap-1.5">
                <Text className="font-body-medium text-sm text-muted">{t("create.recurrenceMonthlyWeekLabel")}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {MONTHLY_WEEKS.map((week) => (
                    <Chip
                      key={week}
                      label={t(`create.recurrenceMonthlyWeekOptions.${week}`)}
                      selected={value?.rule.kind === "monthly_nth" && value.rule.week === week}
                      onPress={() => setMonthlyWeek(week)}
                    />
                  ))}
                </View>
              </View>

              <View className="gap-1.5">
                <Text className="font-body-medium text-sm text-muted">
                  {t("create.recurrenceMonthlyWeekdayLabel")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <Chip
                      key={day}
                      label={weekdayLabels[day]}
                      selected={value?.rule.kind === "monthly_nth" && value.rule.weekday === day}
                      onPress={() => setMonthlyWeekday(day)}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      ) : null}

      {mode === "manual" ? (
        <View className="mt-4 gap-3">
          <Text className="font-body-medium text-sm text-muted">{t("create.recurrenceManualLabel")}</Text>

          {manualDates.length === 0 ? (
            <Text variant="muted" className="text-sm">
              {t("create.recurrenceManualEmpty")}
            </Text>
          ) : null}

          {manualDates.map((date, index) => (
            <View key={index} className="flex-row items-end gap-2">
              <DateTimeField
                label={t("create.dateLabel")}
                mode="date"
                value={date}
                onChange={(next) => updateManualDate(index, combineDateAndTime(next, date))}
                className="flex-1"
                testID={`recurrence-manual-date-${index}`}
              />
              <DateTimeField
                label={t("create.timeLabel")}
                mode="time"
                value={date}
                onChange={(next) => updateManualDate(index, combineDateAndTime(date, next))}
                className="flex-1"
                testID={`recurrence-manual-time-${index}`}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("create.recurrenceManualRemove")}
                onPress={() => removeManualDate(index)}
                className="h-11 w-11 items-center justify-center rounded-lg bg-surface-up active:opacity-70"
              >
                <Text className="font-display text-xl text-ink">×</Text>
              </Pressable>
            </View>
          ))}

          <Button
            variant="secondary"
            size="sm"
            onPress={addManualDate}
            testID="recurrence-manual-add"
          >
            {t("create.recurrenceManualAddCta")}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
