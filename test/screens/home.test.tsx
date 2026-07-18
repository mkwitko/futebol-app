import { screen, waitFor } from "@testing-library/react-native";
import HomeScreen from "@/app/(drawer)/index";
import { saveTokens } from "@/lib/auth/tokens";
import { FAKE_UPCOMING_MATCHES, resetGroupsMocks, setUpcomingMatchesMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  return { ...actual, useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
});

describe("HomeScreen", () => {
  beforeEach(async () => {
    resetGroupsMocks();
    await saveTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
  });

  it("greets the player by first name and does not render an in-screen 'Início' title", async () => {
    renderWithProviders(<HomeScreen />);
    // FAKE_MY_PLAYER.name is "Alice" (see test/mocks/handlers.ts).
    expect(await screen.findByText(/Olá, Alice/)).toBeOnTheScreen();
    expect(screen.queryByText("Início")).toBeNull();
  });

  it("pins the 'Ver meus grupos' footer CTA", async () => {
    renderWithProviders(<HomeScreen />);
    expect(await screen.findByText("Ver meus grupos")).toBeOnTheScreen();
  });

  it("renders the hero for the first upcoming match", async () => {
    renderWithProviders(<HomeScreen />);
    // FAKE_UPCOMING_MATCHES[0].groupName (see test/mocks/handlers.ts) — the hero.
    expect(await screen.findByText(FAKE_UPCOMING_MATCHES[0]!.groupName)).toBeOnTheScreen();
  });

  it("shows the empty state and no hero when there are no upcoming matches", async () => {
    setUpcomingMatchesMock([]);
    renderWithProviders(<HomeScreen />);
    expect(await screen.findByText("Nenhuma partida marcada")).toBeOnTheScreen();
    expect(screen.queryByText(FAKE_UPCOMING_MATCHES[0]!.groupName)).toBeNull();
  });
});
