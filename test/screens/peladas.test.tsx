import { screen, waitFor } from "@testing-library/react-native";
import PeladasScreen from "@/app/(drawer)/grupos";
import { FAKE_GROUP, resetGroupsMocks, setGroupsMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

describe("PeladasScreen", () => {
  beforeEach(() => {
    resetGroupsMocks();
  });

  it("renders the organizer's groups", async () => {
    renderWithProviders(<PeladasScreen />);

    expect(await screen.findByText("Pelada dos Amigos")).toBeOnTheScreen();
  });

  it("shows member count and the next match from listMyGroups", async () => {
    renderWithProviders(<PeladasScreen />);

    expect(await screen.findByText("12 jogadores")).toBeOnTheScreen();
    expect(screen.getByText("Próxima: 18/07 · 21:00 · Quadra do Zico")).toBeOnTheScreen();
  });

  it("shows a subtle notice when the group has no next match", async () => {
    setGroupsMock([{ ...FAKE_GROUP, nextMatch: null }]);
    renderWithProviders(<PeladasScreen />);

    expect(await screen.findByText("Sem futebol marcado")).toBeOnTheScreen();
  });

  it("shows an inviting empty state with a create CTA when there are no groups", async () => {
    setGroupsMock([]);
    renderWithProviders(<PeladasScreen />);

    expect(await screen.findByText("Crie seu primeiro futebol")).toBeOnTheScreen();
    expect(screen.getAllByRole("button", { name: "Criar futebol" }).length).toBeGreaterThan(0);
  });
});
