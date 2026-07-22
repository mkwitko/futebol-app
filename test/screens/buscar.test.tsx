import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import BuscarScreen from "@/app/(drawer)/buscar";
import { saveTokens } from "@/lib/auth/tokens";
import { resetGroupsMocks, setMeMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() })),
  };
});

describe("Buscar — sugestões pra você", () => {
  const push = jest.fn();

  beforeEach(async () => {
    resetGroupsMocks();
    push.mockClear();
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push, replace: jest.fn() });
    // Com token, `getMe` resolve o usuário logado (lastLat/lastLng vêm daqui).
    await saveTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
  });

  it("shows nearby suggestions when the field is empty and the player has coords", async () => {
    setMeMock({ lastLat: -30.03, lastLng: -51.23, lastCity: "Porto Alegre" });

    renderWithProviders(<BuscarScreen />);

    expect(await screen.findByText("Sugestões pra você")).toBeOnTheScreen();
    expect(await screen.findByText("João")).toBeOnTheScreen();
    expect(screen.getByText("Porto Alegre · 2.3 km")).toBeOnTheScreen();
  });

  it("shows a location hint (not the list) when the player has no coords", async () => {
    renderWithProviders(<BuscarScreen />);

    expect(
      await screen.findByText("Defina sua localização pra ver jogadores perto de você"),
    ).toBeOnTheScreen();
    expect(screen.queryByText("João")).not.toBeOnTheScreen();
  });

  it("hides suggestions and switches to name search once 2+ letters are typed", async () => {
    const user = userEvent.setup();
    setMeMock({ lastLat: -30.03, lastLng: -51.23, lastCity: "Porto Alegre" });

    renderWithProviders(<BuscarScreen />);

    expect(await screen.findByText("Sugestões pra você")).toBeOnTheScreen();

    await user.type(screen.getByLabelText("Buscar jogador"), "zi");

    await waitFor(() => expect(screen.queryByText("Sugestões pra você")).toBeNull());
    expect(await screen.findByText("Zico")).toBeOnTheScreen();
  });

  it("navigates to the player profile when a suggestion is tapped", async () => {
    const user = userEvent.setup();
    setMeMock({ lastLat: -30.03, lastLng: -51.23, lastCity: "Porto Alegre" });

    renderWithProviders(<BuscarScreen />);

    await user.press(await screen.findByText("João"));

    expect(push).toHaveBeenCalledWith("/player/p1");
  });
});
