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

  it("renders the roster and opens the add-member sheet with the position picker", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GroupDetailScreen />);

    // Elenco existente (mock) carregado.
    expect(await screen.findByText("Zico")).toBeOnTheScreen();

    await user.press(screen.getAllByText("Adicionar jogador")[0]!);

    expect(await screen.findByText("Posição principal")).toBeOnTheScreen();
    expect(screen.getByLabelText("Nome")).toBeOnTheScreen();
    // Position picker (SegmentedControl) — as 6 abreviações de posição.
    expect(screen.getByText("GOL")).toBeOnTheScreen();
    expect(screen.getByText("ZAG")).toBeOnTheScreen();
    expect(screen.getByText("LAT")).toBeOnTheScreen();
    expect(screen.getByText("VOL")).toBeOnTheScreen();
    expect(screen.getByText("MEI")).toBeOnTheScreen();
    // "ATA" também aparece no badge do Zico (elenco existente) — checamos > 0 em vez de unicidade.
    expect(screen.getAllByText("ATA").length).toBeGreaterThan(0);
  });

  it("submits a new guest player and refreshes the roster", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GroupDetailScreen />);

    expect(await screen.findByText("Zico")).toBeOnTheScreen();

    await user.press(screen.getAllByText("Adicionar jogador")[0]!);
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
