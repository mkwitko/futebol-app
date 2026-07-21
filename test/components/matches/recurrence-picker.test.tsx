import { useState } from "react";
import { render, screen, userEvent } from "@testing-library/react-native";
import { RecurrencePicker, toRuleTime, type RecurrenceValue } from "@/components/matches/recurrence-picker";

// Terça-feira 21:00 UTC — o jest deste repo roda com TZ=UTC (ver package.json
// `"test": "TZ=UTC jest --forceExit"`), então `getUTCDay()`/local coincidem.
const BASE_DATETIME = new Date("2026-07-21T21:00:00.000Z");
const BASE_WEEKDAY = BASE_DATETIME.getUTCDay();
const BASE_TIME = "21:00";

/** Wrapper com estado — o `RecurrencePicker` é totalmente controlado, então o teste precisa re-render com o novo `value` a cada `onChange` (como o form real faz via React Hook Form). */
function Harness({ onChangeSpy }: { onChangeSpy: (value: RecurrenceValue | null) => void }) {
  const [value, setValue] = useState<RecurrenceValue | null>(null);
  return (
    <RecurrencePicker
      value={value}
      baseDatetime={BASE_DATETIME}
      onChange={(next) => {
        onChangeSpy(next);
        setValue(next);
      }}
    />
  );
}

describe("toRuleTime", () => {
  it("derives 'HH:mm' from the UTC hour/minute, independently of device TZ", () => {
    // Construído via `Date.UTC` (não `new Date("...")` local nem getters
    // locais) — sob QUALQUER fuso do device, `getUTCHours`/`getUTCMinutes`
    // sempre leem 18:30. Se `toRuleTime` alguma vez voltasse a usar
    // `formatTime` (que lê hora/minuto LOCAL do `Date`), este teste falharia
    // em qualquer TZ diferente de UTC — mesmo que o CI rode com `TZ=UTC`.
    const baseDatetime = new Date(Date.UTC(2026, 0, 6, 18, 30));

    expect(toRuleTime(baseDatetime)).toBe("18:30");
  });

  it("pads single-digit UTC hour/minute with a leading zero", () => {
    const baseDatetime = new Date(Date.UTC(2026, 0, 6, 3, 5));

    expect(toRuleTime(baseDatetime)).toBe("03:05");
  });
});

describe("RecurrencePicker", () => {
  it("emits null (avulsa) by default and stays null when 'Não (avulsa)' is pressed", async () => {
    const user = userEvent.setup();
    const onChangeSpy = jest.fn();
    render(<Harness onChangeSpy={onChangeSpy} />);

    await user.press(screen.getByRole("button", { name: "Não (avulsa)" }));

    expect(onChangeSpy).toHaveBeenCalledWith(null);
  });

  it("builds a weekly rule seeded from baseDatetime's UTC weekday/time, then updates weekdays and interval", async () => {
    const user = userEvent.setup();
    const onChangeSpy = jest.fn();
    render(<Harness onChangeSpy={onChangeSpy} />);

    await user.press(screen.getByRole("button", { name: "Semanal" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith({
      rule: { kind: "weekly", weekdays: [BASE_WEEKDAY], interval: 1 },
      time: BASE_TIME,
    });

    // Adiciona um segundo dia (Sábado = 6) à seleção multi-weekday.
    await user.press(screen.getByRole("button", { name: "Sáb" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith({
      rule: { kind: "weekly", weekdays: [BASE_WEEKDAY, 6].sort((a, b) => a - b), interval: 1 },
      time: BASE_TIME,
    });

    // Sobe o intervalo (semanal → a cada N semanas) via stepper.
    await user.press(screen.getByRole("button", { name: "Aumentar Repetir a cada quantas semanas" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith({
      rule: { kind: "weekly", weekdays: [BASE_WEEKDAY, 6].sort((a, b) => a - b), interval: 2 },
      time: BASE_TIME,
    });
  });

  it("preselects interval=2 when 'Quinzenal/N sem' is pressed", async () => {
    const user = userEvent.setup();
    const onChangeSpy = jest.fn();
    render(<Harness onChangeSpy={onChangeSpy} />);

    await user.press(screen.getByRole("button", { name: "Quinzenal/N sem" }));

    expect(onChangeSpy).toHaveBeenLastCalledWith({
      rule: { kind: "weekly", weekdays: [BASE_WEEKDAY], interval: 2 },
      time: BASE_TIME,
    });
  });

  it("builds a monthly_dom rule from the day-of-month stepper", async () => {
    const user = userEvent.setup();
    const onChangeSpy = jest.fn();
    render(<Harness onChangeSpy={onChangeSpy} />);

    await user.press(screen.getByRole("button", { name: "Mensal" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith({
      rule: { kind: "monthly_dom", day: BASE_DATETIME.getUTCDate() },
      time: BASE_TIME,
    });

    await user.press(screen.getByRole("button", { name: "Aumentar Dia do mês" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith({
      rule: { kind: "monthly_dom", day: BASE_DATETIME.getUTCDate() + 1 },
      time: BASE_TIME,
    });
  });

  it("builds a monthly_nth rule with week=-1 (última) when the 'Nª semana' variant is selected", async () => {
    const user = userEvent.setup();
    const onChangeSpy = jest.fn();
    render(<Harness onChangeSpy={onChangeSpy} />);

    await user.press(screen.getByRole("button", { name: "Mensal" }));
    await user.press(screen.getByRole("tab", { name: "Nª semana" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith({
      rule: { kind: "monthly_nth", week: 1, weekday: BASE_WEEKDAY },
      time: BASE_TIME,
    });

    await user.press(screen.getByRole("button", { name: "Última" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith({
      rule: { kind: "monthly_nth", week: -1, weekday: BASE_WEEKDAY },
      time: BASE_TIME,
    });

    await user.press(screen.getByRole("button", { name: "Sáb" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith({
      rule: { kind: "monthly_nth", week: -1, weekday: 6 },
      time: BASE_TIME,
    });
  });

  it("builds a manual rule with one datetime per added date and no top-level time", async () => {
    const user = userEvent.setup();
    const onChangeSpy = jest.fn();
    render(<Harness onChangeSpy={onChangeSpy} />);

    await user.press(screen.getByRole("button", { name: "Manual" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith({ rule: { kind: "manual" }, time: null, dates: [] });

    await user.press(screen.getByTestId("recurrence-manual-add"));
    expect(onChangeSpy).toHaveBeenLastCalledWith({
      rule: { kind: "manual" },
      time: null,
      dates: [BASE_DATETIME],
    });

    await user.press(screen.getByTestId("recurrence-manual-add"));
    const lastCall = onChangeSpy.mock.calls.at(-1)?.[0] as RecurrenceValue;
    expect(lastCall.rule).toEqual({ kind: "manual" });
    expect(lastCall.time).toBeNull();
    expect(lastCall.dates).toHaveLength(2);
  });
});
