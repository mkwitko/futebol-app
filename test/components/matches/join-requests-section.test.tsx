import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { JoinRequestsSection } from "@/components/matches/join-requests-section";
import { getJoinRequestsMock, resetGroupsMocks, setJoinRequestsMock } from "../../mocks/handlers";
import { renderWithProviders } from "../../utils/render";

const REQUESTS = [
  { id: "jr-1", matchId: "match-1", playerId: "player-9", playerName: "Ronaldinho", createdAt: "2026-07-17T12:00:00.000Z" },
  { id: "jr-2", matchId: "match-1", playerId: "player-10", playerName: "Rivaldo", createdAt: "2026-07-17T13:00:00.000Z" },
];

describe("JoinRequestsSection", () => {
  beforeEach(() => {
    resetGroupsMocks();
  });

  it("lista os pedidos pendentes", async () => {
    setJoinRequestsMock("match-1", REQUESTS);
    renderWithProviders(<JoinRequestsSection matchId="match-1" />);

    expect(await screen.findByText("Ronaldinho")).toBeOnTheScreen();
    expect(screen.getByText("Rivaldo")).toBeOnTheScreen();
  });

  it("mostra o estado vazio sem pedidos", async () => {
    setJoinRequestsMock("match-1", []);
    renderWithProviders(<JoinRequestsSection matchId="match-1" />);

    expect(await screen.findByText("Nenhum pedido pendente.")).toBeOnTheScreen();
  });

  it("aprova um pedido e mostra feedback", async () => {
    setJoinRequestsMock("match-1", REQUESTS);
    renderWithProviders(<JoinRequestsSection matchId="match-1" />);

    fireEvent.press(await screen.findByTestId("join-request-approve-jr-1"));

    expect(await screen.findByText("Pedido aprovado! Jogador confirmado.")).toBeOnTheScreen();
    await waitFor(() => {
      expect(getJoinRequestsMock("match-1").some((r) => r.id === "jr-1")).toBe(false);
    });
  });

  it("recusa um pedido e mostra feedback", async () => {
    setJoinRequestsMock("match-1", REQUESTS);
    renderWithProviders(<JoinRequestsSection matchId="match-1" />);

    fireEvent.press(await screen.findByTestId("join-request-reject-jr-2"));

    expect(await screen.findByText("Pedido recusado.")).toBeOnTheScreen();
  });
});
