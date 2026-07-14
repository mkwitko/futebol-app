import { screen, waitFor } from "@testing-library/react-native";
import PeladasScreen from "@/app/(tabs)/index";
import { resetGroupsMocks, setGroupsMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

describe("PeladasScreen", () => {
  beforeEach(() => {
    resetGroupsMocks();
  });

  it("renders the organizer's groups", async () => {
    renderWithProviders(<PeladasScreen />);

    expect(await screen.findByText("Pelada dos Amigos")).toBeOnTheScreen();
  });

  it("shows an inviting empty state with a create CTA when there are no groups", async () => {
    setGroupsMock([]);
    renderWithProviders(<PeladasScreen />);

    expect(await screen.findByText("Crie sua primeira pelada")).toBeOnTheScreen();
    expect(screen.getAllByRole("button", { name: "Criar pelada" }).length).toBeGreaterThan(0);
  });
});
