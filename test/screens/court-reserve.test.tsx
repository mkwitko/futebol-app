import * as Clipboard from "expo-clipboard";
import { screen, userEvent } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import CourtReserveScreen from "@/app/court/[id]/reserve";
import {
  FAKE_COURT,
  getBookingsMock,
  resetGroupsMocks,
  setBookingStatusMock,
  setCreateBookingErrorMock,
  setCreateBookingModeMock,
} from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useLocalSearchParams: jest.fn(),
    useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() })),
  };
});

const SLOT_PARAMS = {
  id: FAKE_COURT.id,
  name: FAKE_COURT.name,
  date: "2026-07-18",
  startMinute: String(19 * 60),
  endMinute: String(20 * 60),
};

describe("Checkout de reserva (PIX)", () => {
  beforeEach(() => {
    resetGroupsMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue(SLOT_PARAMS);
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: jest.fn(), replace: jest.fn() });
  });

  it("instant mode: creates the booking and renders the PIX voucher (QR + copy-paste code)", async () => {
    setCreateBookingModeMock("instant");
    renderWithProviders(<CourtReserveScreen />);

    expect(await screen.findByTestId("pix-voucher")).toBeOnTheScreen();
    expect(screen.getByTestId("pix-qr-image").props.source).toEqual([
      { uri: "https://pix.test/qr-code.png" },
    ]);
    expect(screen.getByText(/fake-pix-copy-paste-code/)).toBeOnTheScreen();
    expect(screen.getByText("Expira às 13:00")).toBeOnTheScreen();

    const created = getBookingsMock();
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      courtId: FAKE_COURT.id,
      date: "2026-07-18",
      startMinute: 19 * 60,
      endMinute: 20 * 60,
      status: "pending_payment",
    });
  });

  it("copy button copies the PIX copy-paste code to the clipboard", async () => {
    setCreateBookingModeMock("instant");
    const user = userEvent.setup();
    renderWithProviders(<CourtReserveScreen />);

    await screen.findByTestId("pix-voucher");
    await user.press(screen.getByTestId("pix-copy-cta"));

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      expect.stringContaining("fake-pix-copy-paste-code"),
    );
    expect(await screen.findByText("Código PIX copiado.")).toBeOnTheScreen();
  });

  it("request mode: shows the waiting-for-approval state without a PIX voucher", async () => {
    setCreateBookingModeMock("request");
    renderWithProviders(<CourtReserveScreen />);

    expect(await screen.findByText("Reserva solicitada")).toBeOnTheScreen();
    expect(
      screen.getByText("Aguardando aprovação do dono da quadra. Você será avisado quando ela for aceita."),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId("pix-voucher")).not.toBeOnTheScreen();
  });

  it("409 BKG.SLOT_UNAVAILABLE shows the friendly slot-unavailable message", async () => {
    setCreateBookingErrorMock({ status: 409, code: "BKG-T0002" });
    renderWithProviders(<CourtReserveScreen />);

    expect(
      await screen.findByText("Esse horário acabou de ficar indisponível. Escolha outro."),
    ).toBeOnTheScreen();
  });

  it(
    "polling GET /bookings/mine detects the webhook confirmation and shows the success screen",
    async () => {
      setCreateBookingModeMock("instant");
      renderWithProviders(<CourtReserveScreen />);

      await screen.findByTestId("pix-voucher");
      const [booking] = getBookingsMock();
      setBookingStatusMock(booking!.id, "confirmed");

      expect(await screen.findByText("Reserva confirmada!", {}, { timeout: 8000 })).toBeOnTheScreen();
      expect(screen.queryByTestId("pix-voucher")).not.toBeOnTheScreen();
    },
    10000,
  );

  it(
    "polling GET /bookings/mine detects a non-confirmed terminal status (rejected) and lands on the retry screen instead of staying stuck pending",
    async () => {
      setCreateBookingModeMock("instant");
      renderWithProviders(<CourtReserveScreen />);

      await screen.findByTestId("pix-voucher");
      const [booking] = getBookingsMock();
      setBookingStatusMock(booking!.id, "rejected");

      expect(await screen.findByTestId("reserve-failed", {}, { timeout: 8000 })).toBeOnTheScreen();
      expect(screen.queryByTestId("pix-voucher")).not.toBeOnTheScreen();
      expect(screen.queryByTestId("reserve-pix-waiting")).not.toBeOnTheScreen();
    },
    10000,
  );
});
