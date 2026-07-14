import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import { Share } from "react-native";
import MatchDetailScreen from "@/app/match/[id]";
import { FAKE_MATCH, resetGroupsMocks, setAttendanceMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useLocalSearchParams: jest.fn(() => ({ id: "match-1" })),
    useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() })),
  };
});

describe("Detalhe da pelada", () => {
  beforeEach(() => {
    resetGroupsMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "match-1" });
  });

  it("renders confirmados and fila de espera from the mocked attendance", async () => {
    setAttendanceMock(FAKE_MATCH.id, [
      {
        id: "att-1",
        matchId: FAKE_MATCH.id,
        status: "confirmed",
        waitlistPos: null,
        paymentStatus: "pending",
        paidConfirmedById: null,
        player: { id: "player-1", userId: null, name: "Zico", phone: null },
      },
      {
        id: "att-2",
        matchId: FAKE_MATCH.id,
        status: "waitlisted",
        waitlistPos: 1,
        paymentStatus: "pending",
        paidConfirmedById: null,
        player: { id: "player-2", userId: null, name: "Romário", phone: null },
      },
    ]);

    renderWithProviders(<MatchDetailScreen />);

    expect(await screen.findByText("Confirmados (1)")).toBeOnTheScreen();
    expect(screen.getByText("Zico")).toBeOnTheScreen();
    expect(screen.getByText("Fila de espera (1)")).toBeOnTheScreen();
    expect(screen.getByText("Romário")).toBeOnTheScreen();
    expect(screen.getByText("Posição 1 na fila")).toBeOnTheScreen();
  });

  it("generates teams and renders two columns from the mocked response", async () => {
    setAttendanceMock(FAKE_MATCH.id, [
      {
        id: "att-1",
        matchId: FAKE_MATCH.id,
        status: "confirmed",
        waitlistPos: null,
        paymentStatus: "pending",
        paidConfirmedById: null,
        player: { id: "player-1", userId: null, name: "Zico", phone: null },
      },
      {
        id: "att-2",
        matchId: FAKE_MATCH.id,
        status: "confirmed",
        waitlistPos: null,
        paymentStatus: "pending",
        paidConfirmedById: null,
        player: { id: "player-2", userId: null, name: "Romário", phone: null },
      },
    ]);

    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    expect(await screen.findByText("Confirmados (2)")).toBeOnTheScreen();

    await user.press(screen.getByText("Times"));
    expect(await screen.findByTestId("generate-teams-cta")).toBeOnTheScreen();

    await user.press(screen.getByTestId("generate-teams-cta"));

    expect(await screen.findByText("Time 1")).toBeOnTheScreen();
    expect(screen.getByText("Time 2")).toBeOnTheScreen();
    expect(screen.getByText("Zico")).toBeOnTheScreen();
    expect(screen.getByText("Romário")).toBeOnTheScreen();
  });

  it("creates an invite and opens the native share sheet with the link", async () => {
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });

    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("match-invite-cta")).toBeOnTheScreen();
    });

    await user.press(screen.getByTestId("match-invite-cta"));
    expect(await screen.findByText("Convidar para a pelada")).toBeOnTheScreen();

    await user.press(screen.getByTestId("invite-share-cta"));

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalledTimes(1);
    });
    const message = shareSpy.mock.calls[0]![0].message as string;
    expect(message).toContain(`/invite/invite-token-${FAKE_MATCH.id}`);
    expect(message).toContain(FAKE_MATCH.location);

    expect(await screen.findByTestId("invite-copy-cta")).toBeOnTheScreen();

    shareSpy.mockRestore();
  });
});
