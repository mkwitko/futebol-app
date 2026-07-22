import { screen, userEvent, waitFor } from "@testing-library/react-native";
import PlanosScreen from "@/app/(drawer)/planos";
import { resetBillingMocks, setBillingMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

describe("Planos (assinatura via Woovi PIX Automático)", () => {
  beforeEach(() => {
    resetBillingMocks();
    jest.clearAllMocks();
  });

  it("mostra o preço formatado de cada plano", async () => {
    renderWithProviders(<PlanosScreen />);
    expect(await screen.findByText("R$ 19,90/mês")).toBeOnTheScreen();
    expect(await screen.findByText("R$ 9,90/mês")).toBeOnTheScreen();
  });

  it("marca o organizador como recomendado e que inclui o jogador", async () => {
    renderWithProviders(<PlanosScreen />);
    expect(await screen.findByText("Recomendado")).toBeOnTheScreen();
    expect(await screen.findByText("Inclui tudo do Plano Jogador")).toBeOnTheScreen();
  });

  it("assina via PIX Automático: preenche CPF/telefone e mostra o emv no sheet", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlanosScreen />);

    const subscribeButton = await screen.findByTestId("plan-subscribe-organizer");
    await user.press(subscribeButton);

    expect(await screen.findByTestId("subscribe-taxid-input")).toBeOnTheScreen();
    await user.type(screen.getByTestId("subscribe-taxid-input"), "123.456.789-01");
    await user.type(screen.getByTestId("subscribe-phone-input"), "11912345678");
    await user.press(screen.getByTestId("subscribe-submit"));

    expect(await screen.findByText("EMV-COPIA-COLA")).toBeOnTheScreen();
    expect(screen.getByTestId("payment-automatic-notice")).toBeOnTheScreen();
    expect(screen.queryByTestId("payment-qr-image")).not.toBeOnTheScreen();
  });

  it("mostra erro de validação quando o CPF é inválido", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlanosScreen />);

    await user.press(await screen.findByTestId("plan-subscribe-player"));
    await user.type(screen.getByTestId("subscribe-taxid-input"), "123");
    await user.type(screen.getByTestId("subscribe-phone-input"), "11912345678");
    await user.press(screen.getByTestId("subscribe-submit"));

    expect(await screen.findByText("Informe um CPF válido (11 dígitos).")).toBeOnTheScreen();
  });

  it("assinatura ativa: mostra o plano atual e cancela após confirmar", async () => {
    setBillingMock({ plan: "organizer", status: "active" });
    const user = userEvent.setup();
    renderWithProviders(<PlanosScreen />);

    expect(await screen.findByTestId("billing-current-plan")).toBeOnTheScreen();
    expect(screen.getByText("Plano Organizador")).toBeOnTheScreen();
    expect(screen.getByText("Ativo")).toBeOnTheScreen();
    expect(screen.queryByTestId("plan-subscribe-organizer")).not.toBeOnTheScreen();

    await user.press(screen.getByTestId("billing-cancel"));
    expect(await screen.findByText("Cancelar assinatura?")).toBeOnTheScreen();

    await user.press(screen.getByText("Confirmar"));

    await waitFor(() => {
      expect(screen.queryByTestId("billing-current-plan")).not.toBeOnTheScreen();
    });
    expect(await screen.findByText("Assinatura cancelada.")).toBeOnTheScreen();
  });

  it("paymentsEnabled false: não mostra nenhuma superfície de compra", async () => {
    setBillingMock({ paymentsEnabled: false });
    renderWithProviders(<PlanosScreen />);

    await waitFor(() => {
      expect(screen.queryByTestId("plan-card-organizer")).not.toBeOnTheScreen();
    });
    expect(screen.queryByTestId("billing-current-plan")).not.toBeOnTheScreen();
  });
});
