import { screen, userEvent, waitFor } from "@testing-library/react-native";
import MinhasReservasScreen from "@/app/(drawer)/reservas";
import {
  FAKE_COURT,
  getBookingsMock,
  resetGroupsMocks,
  seedBookingsMock,
  setCancelBookingErrorMock,
} from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

type BookingFixture = ReturnType<typeof getBookingsMock>[number];

function makeBooking(overrides: Partial<BookingFixture> & Pick<BookingFixture, "id">): BookingFixture {
  return {
    courtId: FAKE_COURT.id,
    bookedById: "user-1",
    date: "2026-07-18",
    startMinute: 19 * 60,
    endMinute: 20 * 60,
    priceCents: 8000,
    mode: "instant",
    status: "confirmed",
    depositCents: null,
    stripePaymentIntentId: `pi_${overrides.id}`,
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("Minhas reservas", () => {
  beforeEach(() => {
    resetGroupsMocks();
  });

  it("shows the empty state when there are no bookings", async () => {
    renderWithProviders(<MinhasReservasScreen />);

    expect(await screen.findByText("Nenhuma reserva ainda.")).toBeOnTheScreen();
  });

  it("renders bookings newest-first with formatted date/time, price, mode and status badge", async () => {
    seedBookingsMock([
      makeBooking({ id: "booking-older", status: "confirmed", createdAt: "2026-07-01T10:00:00.000Z" }),
      makeBooking({
        id: "booking-newer",
        status: "requested",
        mode: "request",
        date: "2026-07-20",
        startMinute: 10 * 60,
        endMinute: 11 * 60,
        priceCents: 12000,
        createdAt: "2026-07-15T10:00:00.000Z",
      }),
    ]);

    renderWithProviders(<MinhasReservasScreen />);

    const cards = await screen.findAllByText("Quadra reservada");
    expect(cards).toHaveLength(2);

    // O mais recente (`booking-newer`, criado depois) vem primeiro na lista.
    const rows = screen.getAllByTestId(/^my-booking-booking-/);
    expect(rows.map((row) => row.props.testID)).toEqual([
      "my-booking-booking-newer",
      "my-booking-booking-older",
    ]);

    expect(screen.getByText("20/07/2026 · 10:00–11:00")).toBeOnTheScreen();
    expect(screen.getByText("R$ 120,00")).toBeOnTheScreen();
    expect(screen.getByText("Sob aprovação")).toBeOnTheScreen();
    expect(screen.getByText("Solicitada")).toBeOnTheScreen();

    expect(screen.getByText("18/07/2026 · 19:00–20:00")).toBeOnTheScreen();
    expect(screen.getByText("R$ 80,00")).toBeOnTheScreen();
    expect(screen.getByText("Reserva instantânea")).toBeOnTheScreen();
    expect(screen.getByText("Confirmada")).toBeOnTheScreen();
  });

  it.each(["requested", "pending_payment", "confirmed"] as const)(
    "shows the cancel action for a %s booking",
    async (status) => {
      seedBookingsMock([makeBooking({ id: "booking-1", status })]);
      renderWithProviders(<MinhasReservasScreen />);

      expect(await screen.findByTestId("my-booking-cancel-booking-1")).toBeOnTheScreen();
    },
  );

  it.each(["completed", "cancelled", "rejected", "expired"] as const)(
    "hides the cancel action for a terminal %s booking",
    async (status) => {
      seedBookingsMock([makeBooking({ id: "booking-1", status })]);
      renderWithProviders(<MinhasReservasScreen />);

      await screen.findByTestId("my-booking-booking-1");
      expect(screen.queryByTestId("my-booking-cancel-booking-1")).not.toBeOnTheScreen();
    },
  );

  it("cancel: opens the ConfirmDialog, confirms, calls the cancel mutation and refreshes the list", async () => {
    seedBookingsMock([makeBooking({ id: "booking-1", status: "confirmed" })]);
    const user = userEvent.setup();
    renderWithProviders(<MinhasReservasScreen />);

    await user.press(await screen.findByTestId("my-booking-cancel-booking-1"));

    expect(await screen.findByText("Cancelar essa reserva?")).toBeOnTheScreen();
    expect(screen.getByText("Essa ação não pode ser desfeita.")).toBeOnTheScreen();

    await user.press(screen.getByText("Confirmar"));

    expect(await screen.findByText("Reserva cancelada.")).toBeOnTheScreen();
    await waitFor(() => {
      expect(getBookingsMock().find((b) => b.id === "booking-1")?.status).toBe("cancelled");
    });
    // Depois de cancelar, o botão some (status virou terminal) sem precisar recarregar a tela.
    expect(screen.queryByTestId("my-booking-cancel-booking-1")).not.toBeOnTheScreen();
  });

  it("cancel: dismissing the ConfirmDialog does not call the mutation", async () => {
    seedBookingsMock([makeBooking({ id: "booking-1", status: "confirmed" })]);
    const user = userEvent.setup();
    renderWithProviders(<MinhasReservasScreen />);

    await user.press(await screen.findByTestId("my-booking-cancel-booking-1"));
    expect(await screen.findByText("Cancelar essa reserva?")).toBeOnTheScreen();

    await user.press(screen.getByText("Cancelar"));

    expect(screen.queryByText("Cancelar essa reserva?")).not.toBeOnTheScreen();
    expect(getBookingsMock().find((b) => b.id === "booking-1")?.status).toBe("confirmed");
  });

  it("409 BKG-T0005 (status changed underneath) shows a friendly message and refetches the list instead of crashing", async () => {
    seedBookingsMock([makeBooking({ id: "booking-1", status: "confirmed" })]);
    setCancelBookingErrorMock({ status: 409, code: "BKG-T0005" });
    const user = userEvent.setup();
    renderWithProviders(<MinhasReservasScreen />);

    await user.press(await screen.findByTestId("my-booking-cancel-booking-1"));
    await user.press(screen.getByText("Confirmar"));

    expect(
      await screen.findByText("Essa reserva já mudou de status — atualizamos a lista."),
    ).toBeOnTheScreen();
    expect(screen.queryByText("Reserva cancelada.")).not.toBeOnTheScreen();
    // A reserva não foi cancelada de fato (o mock rejeitou a mutação) — o card continua ali.
    expect(screen.getByTestId("my-booking-booking-1")).toBeOnTheScreen();
  });

  it("a generic cancel error shows the danger-toast fallback message", async () => {
    seedBookingsMock([makeBooking({ id: "booking-1", status: "confirmed" })]);
    setCancelBookingErrorMock({ status: 500, code: "SYS-T9999" });
    const user = userEvent.setup();
    renderWithProviders(<MinhasReservasScreen />);

    await user.press(await screen.findByTestId("my-booking-cancel-booking-1"));
    await user.press(screen.getByText("Confirmar"));

    expect(
      await screen.findByText("Não foi possível cancelar a reserva. Tente novamente."),
    ).toBeOnTheScreen();
  });
});
