import { screen, userEvent, waitFor } from "@testing-library/react-native";
import PeladasScreen from "@/app/(tabs)/index";
import { resetGroupsMocks } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

describe("Criar pelada (grupo)", () => {
  beforeEach(() => {
    resetGroupsMocks();
  });

  it("shows validation error when submitting an empty name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PeladasScreen />);

    await user.press(screen.getByTestId("peladas-open-create-sheet"));
    expect(await screen.findByText("Nova pelada")).toBeOnTheScreen();

    await user.press(screen.getByTestId("create-group-submit"));

    expect(await screen.findByText("Campo obrigatório.")).toBeOnTheScreen();
  });

  it("creates a group and refreshes the list (query invalidation) on success", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PeladasScreen />);

    expect(await screen.findByText("Pelada dos Amigos")).toBeOnTheScreen();

    await user.press(screen.getByTestId("peladas-open-create-sheet"));
    expect(await screen.findByText("Nova pelada")).toBeOnTheScreen();

    await user.type(screen.getByLabelText("Nome do grupo"), "Pelada de sábado");
    await user.press(screen.getByTestId("create-group-submit"));

    // Sucesso: sheet fecha, toast aparece e a lista (invalidada) traz o novo grupo.
    await waitFor(() => {
      expect(screen.queryByText("Nova pelada")).not.toBeOnTheScreen();
    });
    expect(await screen.findByText("Pelada criada!")).toBeOnTheScreen();
    expect(await screen.findByText("Pelada de sábado")).toBeOnTheScreen();
  });
});
