import { screen } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import PlayerCareerScreen from "@/app/player/[playerId]";
import { resetGroupsMocks, setCareerMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useLocalSearchParams: jest.fn(() => ({ playerId: "player-2", name: "Romário" })),
    useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() })),
  };
});

describe("Carreira de outro jogador", () => {
  beforeEach(() => {
    resetGroupsMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ playerId: "player-2", name: "Romário" });
  });

  it("renders another player's career (read-only, no share action)", async () => {
    setCareerMock("player-2", {
      id: "career-2",
      playerId: "player-2",
      overall: { campo_goleiro: 88 },
      affinity: { campo_goleiro: 0.9 },
      level: "ouro",
      matchesPlayed: 20,
      wins: 15,
      draws: 2,
      losses: 3,
      goals: 0,
      assists: 1,
      cleanSheets: 10,
      mvpCount: 5,
      currentStreak: 6,
      bestStreak: 8,
      updatedAt: "2026-07-10T00:00:00.000Z",
    });

    renderWithProviders(<PlayerCareerScreen />);

    expect(screen.getByText("Romário")).toBeOnTheScreen();
    expect(await screen.findByText("Ouro")).toBeOnTheScreen();
    // "88" aparece 2x: overall em destaque no hero + linha "Goleiro" no breakdown por posição.
    expect(screen.getAllByText("88")).toHaveLength(2);
    expect(screen.getByText("Goleiro")).toBeOnTheScreen();
    expect(screen.getByText("Sem sofrer gol")).toBeOnTheScreen();
    expect(screen.getByText("10")).toBeOnTheScreen();
    expect(screen.queryByTestId("profile-share-cta")).not.toBeOnTheScreen();
  });

  it("shows the zeroed/no-career state for a guest player without a career yet", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ playerId: "player-guest", name: "Convidado" });

    renderWithProviders(<PlayerCareerScreen />);

    expect(screen.getByText("Convidado")).toBeOnTheScreen();
    expect(await screen.findByText("Bronze")).toBeOnTheScreen();
    expect(screen.getByText("Jogue seu primeiro futebol para começar sua carreira.")).toBeOnTheScreen();
  });
});
