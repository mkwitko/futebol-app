import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { Share } from "react-native";
import PerfilScreen from "@/app/(tabs)/perfil";
import { FAKE_CAREER, FAKE_MY_PLAYER, resetGroupsMocks, setCareerMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

describe("Minha carreira (Perfil)", () => {
  beforeEach(() => {
    resetGroupsMocks();
  });

  it("renders the player's real career: hero overall, level tier and the full stats block", async () => {
    renderWithProviders(<PerfilScreen />);

    expect(await screen.findByText("Minha carreira")).toBeOnTheScreen();

    // Hero — overall da melhor posição (atacante: 78) + tier ("prata" -> badge "Prata").
    // "78" aparece 2x: número em destaque do hero + linha de "Atacante" no
    // breakdown por posição (mesma posição, mesmo overall).
    await screen.findByText("Prata");
    expect(screen.getAllByText("78")).toHaveLength(2);
    expect(screen.getByText("Prata")).toBeOnTheScreen();

    // Overall por posição — as duas posições da carreira mockada.
    expect(screen.getByText("Overall por posição")).toBeOnTheScreen();
    expect(screen.getByText("Atacante")).toBeOnTheScreen();
    expect(screen.getByText("Meia")).toBeOnTheScreen();
    expect(screen.getByText("Melhor posição")).toBeOnTheScreen();
    expect(screen.getByText("65")).toBeOnTheScreen();

    // Bloco de estatísticas completo.
    expect(screen.getByText("Estatísticas")).toBeOnTheScreen();
    expect(screen.getByText("Partidas")).toBeOnTheScreen();
    expect(screen.getByText(String(FAKE_CAREER.matchesPlayed))).toBeOnTheScreen();
    expect(screen.getByText("Aproveitamento")).toBeOnTheScreen();
    // wins(7)/matchesPlayed(12) arredondado = 58%.
    expect(screen.getByText("58%")).toBeOnTheScreen();
    expect(screen.getByText("Gols")).toBeOnTheScreen();
    expect(screen.getByText("Sequência invicta")).toBeOnTheScreen();
    expect(screen.getByText("Recorde de sequência")).toBeOnTheScreen();
  });

  it("shows an inviting zeroed state when the player has no career yet", async () => {
    setCareerMock(FAKE_MY_PLAYER.id, undefined);
    renderWithProviders(<PerfilScreen />);

    expect(await screen.findByText("Jogue sua primeira pelada para começar sua carreira.")).toBeOnTheScreen();
    // Hero zerado — tier "bronze" (o piso do bootstrap default) e nenhuma
    // seção "Overall por posição" (mapa `overall` vazio).
    expect(screen.getByText("Bronze")).toBeOnTheScreen();
    expect(screen.queryByText("Overall por posição")).not.toBeOnTheScreen();
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
