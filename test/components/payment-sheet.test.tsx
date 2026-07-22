import { screen, userEvent } from "@testing-library/react-native";
import * as Clipboard from "expo-clipboard";
import { PaymentSheet } from "@/components/payments/payment-sheet";
import { renderWithProviders } from "../utils/render";

it("mostra o copia-e-cola e copia ao tocar", async () => {
  const user = userEvent.setup();
  renderWithProviders(
    <PaymentSheet
      visible
      onClose={() => {}}
      charge={{ brCode: "BR-COPIA-COLA", qrCodeImage: "http://qr", status: "pending" }}
    />,
  );
  expect(screen.getByText("Pagar com PIX")).toBeOnTheScreen();
  expect(await screen.findByText("BR-COPIA-COLA")).toBeOnTheScreen();
  await user.press(screen.getByTestId("payment-copy"));
  expect(Clipboard.setStringAsync).toHaveBeenCalledWith("BR-COPIA-COLA");
});

it("mostra o rótulo de pago quando o status é completed", () => {
  renderWithProviders(
    <PaymentSheet
      visible
      onClose={() => {}}
      charge={{ brCode: "BR-COPIA-COLA", qrCodeImage: "http://qr", status: "completed" }}
    />,
  );
  expect(screen.getByText("Pago!")).toBeOnTheScreen();
});

it("não renderiza conteúdo do charge quando charge é null", () => {
  renderWithProviders(<PaymentSheet visible onClose={() => {}} charge={null} />);
  expect(screen.queryByTestId("payment-copy")).not.toBeOnTheScreen();
});
