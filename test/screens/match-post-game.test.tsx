import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import MatchDetailScreen from "@/app/match/[id]";
import { saveTokens } from "@/lib/auth/tokens";
import {
  FAKE_MATCH,
  getResultMock,
  getStatsMock,
  getVotesMock,
  resetGroupsMocks,
  setAttendanceMock,
  setMatchStatusMock,
  setVoteWindowClosedMock,
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

/** `player-1` pertence ao usuário logado nos testes (`user-1`, via `getMe` mockado) — usado pra exercitar a auto-exclusão da votação. */
const CONFIRMED_ATTENDANCE = [
  {
    id: "att-1",
    matchId: FAKE_MATCH.id,
    status: "confirmed" as const,
    waitlistPos: null,
    paymentStatus: "pending" as const,
    paidConfirmedById: null,
    player: { id: "player-1", userId: "user-1", name: "Zico", phone: null },
  },
  {
    id: "att-2",
    matchId: FAKE_MATCH.id,
    status: "confirmed" as const,
    waitlistPos: null,
    paymentStatus: "pending" as const,
    paidConfirmedById: null,
    player: { id: "player-2", userId: null, name: "Romário", phone: null },
  },
];

describe("Pós-jogo da pelada (Fase 1)", () => {
  beforeEach(async () => {
    resetGroupsMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "match-1" });
    setMatchStatusMock(FAKE_MATCH.id, "finished");
    setAttendanceMock(FAKE_MATCH.id, CONFIRMED_ATTENDANCE);
    // Loga o usuário do fixture (`user-1`) pra que `useAuth()` resolva um `user`
    // — necessário pra participação na votação (auto-exclusão) e testes que
    // dependem de `currentUserId`.
    await saveTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
  });

  it("renders a per-team score form on Resultado and shows the recorded result after submitting", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    expect(await screen.findByTestId("result-team-0-goals-increment")).toBeOnTheScreen();
    expect(screen.getByTestId("result-team-1-goals-increment")).toBeOnTheScreen();

    await user.press(screen.getByTestId("result-team-0-goals-increment"));
    await user.press(screen.getByTestId("result-team-0-goals-increment"));
    await user.press(screen.getByTestId("result-team-1-goals-increment"));

    await user.press(screen.getByTestId("record-result-submit"));

    expect(await screen.findByText("Resultado registrado")).toBeOnTheScreen();
    expect(screen.getByText("Vencedor: Time 1")).toBeOnTheScreen();

    expect(getResultMock(FAKE_MATCH.id)).toMatchObject({
      scores: [
        { team: 0, goals: 2 },
        { team: 1, goals: 1 },
      ],
      winnerTeam: 0,
    });
  });

  it("submits a batch of stats for the confirmed attendees", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    expect(await screen.findByText("Estatísticas")).toBeOnTheScreen();
    await user.press(screen.getByText("Estatísticas"));

    expect(await screen.findByText("Zico")).toBeOnTheScreen();
    expect(screen.getByText("Romário")).toBeOnTheScreen();

    await user.press(screen.getByTestId("stats-player-1-goals-increment"));
    await user.press(screen.getByTestId("stats-player-1-goals-increment"));
    await user.press(screen.getByTestId("stats-player-1-assists-increment"));

    await user.press(screen.getByTestId("log-stats-submit"));

    expect(await screen.findByText("Estatísticas salvas!")).toBeOnTheScreen();
    await waitFor(() => {
      const stats = getStatsMock(FAKE_MATCH.id);
      expect(stats).toHaveLength(2);
      expect(stats.find((entry) => entry.playerId === "player-1")).toMatchObject({
        goals: 2,
        assists: 1,
        ownGoals: 0,
        cleanSheet: false,
      });
      expect(stats.find((entry) => entry.playerId === "player-2")).toMatchObject({
        goals: 0,
        assists: 0,
        ownGoals: 0,
        cleanSheet: false,
      });
    });
  });

  it("casts a vote (excluding self) and shows the window-closed state on a 409", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    expect(await screen.findByText("Votação")).toBeOnTheScreen();
    await user.press(screen.getByText("Votação"));

    // O próprio usuário logado (`player-1`) não deve aparecer como candidato.
    expect(await screen.findByTestId("vote-mvp-player-2")).toBeOnTheScreen();
    expect(screen.queryByTestId("vote-mvp-player-1")).not.toBeOnTheScreen();

    await user.press(screen.getByTestId("vote-mvp-player-2"));

    await waitFor(() => {
      expect(getVotesMock(FAKE_MATCH.id)).toHaveLength(1);
    });
    expect(await screen.findByText("Romário (1 votos)")).toBeOnTheScreen();

    setVoteWindowClosedMock(FAKE_MATCH.id, true);
    await user.press(screen.getByTestId("vote-craque-player-2"));

    expect(await screen.findByText(/votação está encerrada/i)).toBeOnTheScreen();
    // O voto que já tinha sido registrado (mvp) continua contando — só o novo falhou.
    expect(getVotesMock(FAKE_MATCH.id)).toHaveLength(1);
  });

  it("keeps Finalizar disabled until a result exists, then finalizes on confirm", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MatchDetailScreen />);

    const finalizeCta = await screen.findByTestId("finalize-match-cta");
    expect(finalizeCta.props.accessibilityState?.disabled).toBe(true);

    await user.press(screen.getByTestId("result-team-0-goals-increment"));
    await user.press(screen.getByTestId("record-result-submit"));
    expect(await screen.findByText("Resultado registrado")).toBeOnTheScreen();

    await waitFor(() => {
      expect(screen.getByTestId("finalize-match-cta").props.accessibilityState?.disabled).not.toBe(true);
    });

    await user.press(screen.getByTestId("finalize-match-cta"));

    // Confirma no diálogo customizado (ConfirmDialog) que substituiu o Alert nativo.
    await user.press(await screen.findByText("Confirmar"));

    expect(await screen.findByText("Futebol encerrado")).toBeOnTheScreen();
    expect(screen.getByText("A votação foi fechada e os níveis dos jogadores já foram atualizados.")).toBeOnTheScreen();
  });
});
