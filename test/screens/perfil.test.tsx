import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { Share } from "react-native";
import PerfilScreen from "@/app/(drawer)/perfil";
import { FAKE_MY_PLAYER, resetGroupsMocks } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

describe("Minha carreira (Perfil)", () => {
  beforeEach(() => {
    resetGroupsMocks();
  });

  it("renders the player's FIFA card: general overall, best position, categories", async () => {
    renderWithProviders(<PerfilScreen />);

    expect(await screen.findByText("Minha carreira")).toBeOnTheScreen();

    // Overall geral (84) — número em destaque da carta.
    expect(await screen.findByText("84")).toBeOnTheScreen();
    // Melhor posição (campo_atacante -> ATA) aparece na carta e no campinho.
    expect(screen.getAllByText("ATA").length).toBeGreaterThan(0);
    // Overall de categoria (finalização = 86).
    expect(screen.getByText("86")).toBeOnTheScreen();
    // Nacionalidade/time exibidos na carta.
    expect(screen.getByText(/Brasil/)).toBeOnTheScreen();
  });

  it("shares the public profile link with a proud pt-BR message", async () => {
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });
    const user = userEvent.setup();

    renderWithProviders(<PerfilScreen />);

    await user.press(await screen.findByTestId("profile-share-cta"));

    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));
    const message = shareSpy.mock.calls[0]![0].message as string;
    expect(message).toContain(`/player/${FAKE_MY_PLAYER.id}`);
    expect(message).toContain("Confira meu perfil de jogador");

    shareSpy.mockRestore();
  });
});
