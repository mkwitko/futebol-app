import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { ReputationSection } from "@/components/matches/reputation-section";
import { getReputationMock, resetGroupsMocks, setReputationMock } from "../../mocks/handlers";
import { renderWithProviders } from "../../utils/render";

const TEAMMATES = [
  { id: "player-2", name: "Romário" },
  { id: "player-3", name: "Bebeto" },
];

describe("ReputationSection", () => {
  beforeEach(() => {
    resetGroupsMocks();
  });

  it("renders the 4 dimension chips per teammate", async () => {
    renderWithProviders(<ReputationSection matchId="match-1" teammates={TEAMMATES} open />);

    expect(await screen.findByTestId("reputation-pontualidade-player-2")).toBeOnTheScreen();
    expect(screen.getByTestId("reputation-educacao-player-2")).toBeOnTheScreen();
    expect(screen.getByTestId("reputation-compromisso-player-2")).toBeOnTheScreen();
    expect(screen.getByTestId("reputation-respeito-player-2")).toBeOnTheScreen();
    expect(screen.getByTestId("reputation-pontualidade-player-3")).toBeOnTheScreen();
  });

  it("hydrates the initial selection from the GET, toggles a chip, and saves the full tag set", async () => {
    setReputationMock("match-1", [{ votedPlayerId: "player-3", dimensions: ["respeito"] }]);
    renderWithProviders(<ReputationSection matchId="match-1" teammates={TEAMMATES} open />);

    const respeitoP3 = await screen.findByTestId("reputation-respeito-player-3");
    await waitFor(() => {
      expect(respeitoP3.props.accessibilityState?.selected).toBe(true);
    });

    fireEvent.press(screen.getByTestId("reputation-pontualidade-player-2"));
    fireEvent.press(screen.getByTestId("reputation-save"));

    expect(await screen.findByText("Reputação salva!")).toBeOnTheScreen();
    await waitFor(() => {
      expect(getReputationMock("match-1")).toEqual(
        expect.arrayContaining([
          { votedPlayerId: "player-2", dimensions: ["pontualidade"] },
          { votedPlayerId: "player-3", dimensions: ["respeito"] },
        ]),
      );
    });
  });

  it("disables the chips and the save button when the voting window is closed", async () => {
    renderWithProviders(<ReputationSection matchId="match-1" teammates={TEAMMATES} open={false} />);

    const chip = await screen.findByTestId("reputation-pontualidade-player-2");
    expect(chip.props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByTestId("reputation-save").props.accessibilityState?.disabled).toBe(true);
  });
});
