import { screen, userEvent, waitFor } from "@testing-library/react-native";
import PerfilScreen from "@/app/(drawer)/perfil";
import * as shareLib from "@/lib/share/share";
import { saveTokens } from "@/lib/auth/tokens";
import { FAKE_MY_PLAYER, resetGroupsMocks } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("@/lib/share/share", () => ({
  shareLink: jest.fn(async () => undefined),
  shareImage: jest.fn(async () => undefined),
}));

describe("Minha carreira (Perfil)", () => {
  beforeEach(() => {
    resetGroupsMocks();
    jest.clearAllMocks();
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

  it("opens the ShareSheet for the carta and shares the link with a proud pt-BR message", async () => {
    const user = userEvent.setup();

    renderWithProviders(<PerfilScreen />);

    await user.press(await screen.findByTestId("profile-share-cta"));
    await user.press(await screen.findByText("Compartilhar link"));

    await waitFor(() => expect(shareLib.shareLink).toHaveBeenCalledTimes(1));
    expect(shareLib.shareLink).toHaveBeenCalledWith(
      FAKE_MY_PLAYER.slug,
      { kind: "carta" },
      "Essa é a minha carta no Camisa7! 👇",
    );
  });

  it("opens the ShareSheet for an unlocked conquista on tap", async () => {
    const user = userEvent.setup();

    renderWithProviders(<PerfilScreen />);

    // "Primeiro gol" vem desbloqueada no mock de carreira (FAKE_CAREER).
    await user.press(await screen.findByLabelText("Primeiro gol: Marque seu primeiro gol"));
    await user.press(await screen.findByText("Compartilhar link"));

    await waitFor(() => expect(shareLib.shareLink).toHaveBeenCalledTimes(1));
    expect(shareLib.shareLink).toHaveBeenCalledWith(
      FAKE_MY_PLAYER.slug,
      { kind: "conquista", key: "primeiro_gol" },
      "Desbloqueei uma conquista no Camisa7! 👇",
    );
  });
});

describe("Tipo de conta (Perfil)", () => {
  beforeEach(async () => {
    resetGroupsMocks();
    // Com token, `getMe` carrega o usuário logado (roles) — habilita a edição.
    await saveTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
  });

  it("edits and saves the account types, showing a success toast", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PerfilScreen />);

    // Seção de tipo de conta renderizada; jogador já vem selecionado.
    const jogadorChip = await screen.findByTestId("profile-role-jogador");
    expect(jogadorChip.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );

    // Marca "organizador" → rascunho sujo → botão habilita.
    await user.press(screen.getByTestId("profile-role-organizador"));
    await user.press(screen.getByTestId("profile-save-roles"));

    expect(await screen.findByText("Tipos de conta atualizados.")).toBeOnTheScreen();
  });
});
