import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import { Share } from "react-native";
import MatchDetailScreen from "@/app/match/[id]";
import { saveTokens } from "@/lib/auth/tokens";
import {
  FAKE_MATCH,
  resetGroupsMocks,
  resetPaymentsConfigMock,
  setAttendanceMock,
  setPaymentsConfigMock,
  setTeamsMock,
} from "../mocks/handlers";
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

  it("shows the empty state with a Montar times CTA when teams haven't been generated yet", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    expect(await screen.findByText("Confirmados (1)")).toBeOnTheScreen();
    await user.press(screen.getByText("Times"));

    expect(await screen.findByText("Times ainda não montados")).toBeOnTheScreen();
    expect(screen.getByTestId("generate-teams-cta")).toBeOnTheScreen();
  });

  it("generates teams and renders two columns with server-computed overalls (incl. guests)", async () => {
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
      {
        id: "att-3",
        matchId: FAKE_MATCH.id,
        status: "confirmed",
        waitlistPos: null,
        paymentStatus: "pending",
        paidConfirmedById: null,
        // Convidado avulso, sem registro em `membersByGroup` — antes contribuía 0
        // no total do time; agora o servidor manda o `overall` dele também.
        player: { id: "player-guest", userId: null, name: "Convidado", phone: null },
      },
    ]);

    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    expect(await screen.findByText("Confirmados (3)")).toBeOnTheScreen();

    await user.press(screen.getByText("Times"));
    expect(await screen.findByTestId("generate-teams-cta")).toBeOnTheScreen();

    await user.press(screen.getByTestId("generate-teams-cta"));

    expect(await screen.findByText("Time 1")).toBeOnTheScreen();
    expect(screen.getByText("Time 2")).toBeOnTheScreen();
    expect(screen.getByText("Zico")).toBeOnTheScreen();
    expect(screen.getByText("Romário")).toBeOnTheScreen();
    expect(screen.getByText("Convidado")).toBeOnTheScreen();
    // Time 1 = Zico (75) + Romário (68) = 143 (só aparece no cabeçalho do time).
    expect(screen.getByText("143")).toBeOnTheScreen();
    // Time 2 = só o Convidado (fallback 70) — o total do time bate com o overall
    // dele (não some 0 como no bug antigo), então "70" aparece 2x: cabeçalho + linha do jogador.
    expect(screen.getAllByText("70")).toHaveLength(2);
  });

  it("loads persisted teams from getTeams on mount, without needing to regenerate", async () => {
    setTeamsMock(FAKE_MATCH.id, {
      matchId: FAKE_MATCH.id,
      teams: [
        { team: 0, overallTotal: 75, players: [{ playerId: "player-1", name: "Zico", overall: 75 }] },
        { team: 1, overallTotal: 68, players: [{ playerId: "player-2", name: "Romário", overall: 68 }] },
      ],
      generatedAt: "2026-01-02T00:00:00.000Z",
    });

    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    expect(await screen.findByText("Confirmados (1)")).toBeOnTheScreen();
    await user.press(screen.getByText("Times"));

    expect(await screen.findByText("Time 1")).toBeOnTheScreen();
    expect(screen.getByText("Zico")).toBeOnTheScreen();
    expect(screen.getByText("Romário")).toBeOnTheScreen();
    // Cada time tem só 1 jogador aqui, então o total do time == o overall dele
    // (2 ocorrências: cabeçalho do time + linha do jogador).
    expect(screen.getAllByText("75")).toHaveLength(2);
    expect(screen.getAllByText("68")).toHaveLength(2);
    expect(screen.queryByTestId("generate-teams-cta")).not.toBeOnTheScreen();
    expect(screen.getByTestId("regenerate-teams-cta")).toBeOnTheScreen();
  });

  it("creates an invite and opens the native share sheet with the link", async () => {
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });

    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("match-actions-cta")).toBeOnTheScreen();
    });

    // Ações do organizador agora ficam num bottom sheet — abre o menu primeiro.
    await user.press(screen.getByTestId("match-actions-cta"));
    await user.press(await screen.findByTestId("match-invite-cta"));
    expect(await screen.findByText("Convidar para o futebol")).toBeOnTheScreen();

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

describe("Pagar (Woovi) — presença na pelada paga", () => {
  beforeEach(async () => {
    resetGroupsMocks();
    resetPaymentsConfigMock();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "match-1" });
    setAttendanceMock(FAKE_MATCH.id, [
      {
        id: "att-1",
        matchId: FAKE_MATCH.id,
        status: "confirmed",
        waitlistPos: null,
        paymentStatus: "pending",
        paidConfirmedById: null,
        player: { id: "player-1", userId: "user-1", name: "Alice", phone: null },
      },
    ]);
    // Loga `user-1` — dono do fixture da presença confirmada — pra exercitar o "Pagar".
    await saveTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
  });

  it("shows pay-attendance-cta for the confirmed self player and opens the PaymentSheet with the mocked brCode on press", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    expect(await screen.findByText("Confirmados (1)")).toBeOnTheScreen();
    await user.press(screen.getByText("Pagamento"));

    const payCta = await screen.findByTestId("pay-attendance-cta");
    await user.press(payCta);

    expect(await screen.findByText("BR-X")).toBeOnTheScreen();
  });

  it("hides pay-attendance-cta when payments are disabled (manual mark-paid stays)", async () => {
    setPaymentsConfigMock({ enabled: false });
    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    expect(await screen.findByText("Confirmados (1)")).toBeOnTheScreen();
    await user.press(screen.getByText("Pagamento"));

    expect(await screen.findByLabelText("Marcar como pago")).toBeOnTheScreen();
    expect(screen.queryByTestId("pay-attendance-cta")).not.toBeOnTheScreen();
  });
});
