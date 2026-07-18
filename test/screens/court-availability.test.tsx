import { screen, userEvent, within } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import CourtAvailabilityScreen from "@/app/court/[id]/availability";
import { FAKE_COURT, resetGroupsMocks, setAvailabilityMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useLocalSearchParams: jest.fn(),
    useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() })),
  };
});

const FREE_SLOT = { startMinute: 19 * 60, endMinute: 20 * 60, priceCents: 8000, available: true };
const OCCUPIED_SLOT = { startMinute: 20 * 60, endMinute: 21 * 60, priceCents: 10000, available: false };

describe("Disponibilidade da quadra", () => {
  beforeEach(() => {
    resetGroupsMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: FAKE_COURT.id, name: FAKE_COURT.name });
    // Data determinística — a tela usa `new Date()` como dia padrão (hoje).
    jest.useFakeTimers().setSystemTime(new Date("2026-07-18T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders free and occupied slots with formatted time range (HH:MM–HH:MM) and BRL price", async () => {
    setAvailabilityMock(FAKE_COURT.id, [FREE_SLOT, OCCUPIED_SLOT]);

    renderWithProviders(<CourtAvailabilityScreen />);

    expect(await screen.findByText("19:00–20:00 · R$ 80,00")).toBeOnTheScreen();
    expect(screen.getByText("20:00–21:00 · R$ 100,00")).toBeOnTheScreen();
    expect(
      screen.getByTestId(`availability-slot-${FREE_SLOT.startMinute}`).props.accessibilityState?.disabled,
    ).not.toBe(true);
    expect(
      screen.getByTestId(`availability-slot-${OCCUPIED_SLOT.startMinute}`).props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it("shows the empty state when the selected day has no slots configured", async () => {
    setAvailabilityMock(FAKE_COURT.id, []);

    renderWithProviders(<CourtAvailabilityScreen />);

    expect(await screen.findByText("Nenhum horário configurado pra esse dia.")).toBeOnTheScreen();
  });

  it("selecting a free slot reveals a summary + reserve CTA — the A2 handoff point", async () => {
    setAvailabilityMock(FAKE_COURT.id, [FREE_SLOT]);
    const user = userEvent.setup();
    renderWithProviders(<CourtAvailabilityScreen />);

    await user.press(await screen.findByTestId(`availability-slot-${FREE_SLOT.startMinute}`));

    const summary = screen.getByTestId("availability-selection-summary");
    expect(within(summary).getByText("19:00–20:00 · R$ 80,00")).toBeOnTheScreen();
    expect(within(summary).getByText("Reservar este horário")).toBeOnTheScreen();
  });

  it("tapping an occupied slot does not select it — no summary/CTA appears", async () => {
    setAvailabilityMock(FAKE_COURT.id, [OCCUPIED_SLOT]);
    const user = userEvent.setup();
    renderWithProviders(<CourtAvailabilityScreen />);

    await user.press(await screen.findByTestId(`availability-slot-${OCCUPIED_SLOT.startMinute}`));

    expect(screen.queryByTestId("availability-selection-summary")).not.toBeOnTheScreen();
  });

  it("tapping reserve shows a coming-soon toast — payment/checkout is Task A2, not built here", async () => {
    setAvailabilityMock(FAKE_COURT.id, [FREE_SLOT]);
    const user = userEvent.setup();
    renderWithProviders(<CourtAvailabilityScreen />);

    await user.press(await screen.findByTestId(`availability-slot-${FREE_SLOT.startMinute}`));
    await user.press(screen.getByText("Reservar este horário"));

    expect(
      await screen.findByText("Reserva de 19:00–20:00 (R$ 80,00) selecionada — o pagamento chega em breve."),
    ).toBeOnTheScreen();
  });

  it("navigating to the next day clears the current selection", async () => {
    setAvailabilityMock(FAKE_COURT.id, [FREE_SLOT]);
    const user = userEvent.setup();
    renderWithProviders(<CourtAvailabilityScreen />);

    await user.press(await screen.findByTestId(`availability-slot-${FREE_SLOT.startMinute}`));
    expect(screen.getByTestId("availability-selection-summary")).toBeOnTheScreen();

    await user.press(screen.getByLabelText("Próximo dia"));

    expect(screen.queryByTestId("availability-selection-summary")).not.toBeOnTheScreen();
  });

  it("jumping to an arbitrary date via the native date picker updates the header and refetches", async () => {
    setAvailabilityMock(FAKE_COURT.id, [FREE_SLOT]);
    const user = userEvent.setup();
    renderWithProviders(<CourtAvailabilityScreen />);

    await screen.findByText("19:00–20:00 · R$ 80,00");
    expect(screen.getByText("sábado, 18 de julho")).toBeOnTheScreen();

    // Abre o picker nativo (mock stub — ver __mocks__/@react-native-community/datetimepicker.js)
    // e simula a escolha de uma data 14 dias à frente, um salto que o
    // stepper prev/next não cobriria em um toque só.
    await user.press(screen.getByLabelText("Escolher data"));
    await user.press(screen.getByTestId("availability-date-picker"));

    expect(await screen.findByText("sábado, 1 de agosto")).toBeOnTheScreen();
  });

  it("selecting a date via the picker clears the current selection", async () => {
    setAvailabilityMock(FAKE_COURT.id, [FREE_SLOT]);
    const user = userEvent.setup();
    renderWithProviders(<CourtAvailabilityScreen />);

    await user.press(await screen.findByTestId(`availability-slot-${FREE_SLOT.startMinute}`));
    expect(screen.getByTestId("availability-selection-summary")).toBeOnTheScreen();

    await user.press(screen.getByLabelText("Escolher data"));
    await user.press(screen.getByTestId("availability-date-picker"));

    expect(screen.queryByTestId("availability-selection-summary")).not.toBeOnTheScreen();
  });
});
