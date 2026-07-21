import { screen } from "@testing-library/react-native";
import PlanosScreen from "@/app/(drawer)/planos";
import { resetGroupsMocks } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

describe("Planos (comercial)", () => {
  beforeEach(() => {
    resetGroupsMocks();
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

  it("mantém o botão de assinar por plano", async () => {
    renderWithProviders(<PlanosScreen />);
    expect(await screen.findByTestId("plan-subscribe-organizer")).toBeOnTheScreen();
    expect(await screen.findByTestId("plan-subscribe-player")).toBeOnTheScreen();
  });
});
