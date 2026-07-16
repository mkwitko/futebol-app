import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import GroupDetailScreen from "@/app/group/[id]";
import { resetGroupsMocks } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useLocalSearchParams: jest.fn(() => ({ id: "group-1" })),
  };
});

describe("Adicionar jogador", () => {
  beforeEach(() => {
    resetGroupsMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "group-1" });
  });

  it("switches to the Jogadores tab and opens the short add-member sheet", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GroupDetailScreen />);

    await user.press(screen.getByText("Jogadores"));

    // Elenco existente (mock) carregado.
    expect(await screen.findByText("Zico")).toBeOnTheScreen();

    await user.press(screen.getByText("+ Jogador"));

    expect(await screen.findByLabelText("Nome")).toBeOnTheScreen();
    expect(screen.getByLabelText("Telefone")).toBeOnTheScreen();
    // Form curto (Task 7) — só nome/telefone/mensalista-avulso, sem posição.
    // "Avulso" também aparece no badge do Zico (elenco existente) — checamos > 0 em vez de unicidade.
    expect(screen.getByText("Mensalista")).toBeOnTheScreen();
    expect(screen.getAllByText("Avulso").length).toBeGreaterThan(0);
    expect(screen.queryByText("Posição principal")).not.toBeOnTheScreen();
    expect(screen.queryByText("GOL")).not.toBeOnTheScreen();
  });

  it("submits a new guest player and refreshes the roster", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GroupDetailScreen />);

    await user.press(screen.getByText("Jogadores"));
    expect(await screen.findByText("Zico")).toBeOnTheScreen();

    await user.press(screen.getByText("+ Jogador"));
    expect(await screen.findByLabelText("Nome")).toBeOnTheScreen();

    await user.type(screen.getByLabelText("Nome"), "Nova Jogadora");
    await user.press(screen.getByTestId("member-form-submit"));

    await waitFor(() => {
      expect(screen.queryByLabelText("Nome")).not.toBeOnTheScreen();
    });
    expect(await screen.findByText("Jogador adicionado!")).toBeOnTheScreen();
    expect(await screen.findByText("Nova Jogadora")).toBeOnTheScreen();
  });
});
