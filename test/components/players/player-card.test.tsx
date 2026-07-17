import { render, screen, userEvent } from "@testing-library/react-native";
import { PlayerCard } from "@/components/players/player-card";

describe("PlayerCard", () => {
  it("renders overall, position and tier for a fresh (all-zero stats) member — full variant", () => {
    render(<PlayerCard name="Ana Souza" position="campo_atacante" overall={62} variant="full" />);

    expect(screen.getByText("62")).toBeOnTheScreen();
    expect(screen.getByText("ATA")).toBeOnTheScreen();
    expect(screen.getByText("Bronze")).toBeOnTheScreen();
    // `uppercase` no PlayerCard é só `textTransform` visual — o texto real segue com a caixa original.
    expect(screen.getByText("Ana Souza")).toBeOnTheScreen();
    // Sem `stats`, a linha jogos/vitórias/gols não deve ser renderizada.
    expect(screen.queryByText("Jogos")).not.toBeOnTheScreen();
  });

  it("shows the stat line when stats are provided", () => {
    render(
      <PlayerCard
        name="Bruno Lima"
        position="campo_goleiro"
        overall={88}
        variant="full"
        stats={{ matches: 12, wins: 7, goals: 0 }}
      />,
    );

    expect(screen.getByText("88")).toBeOnTheScreen();
    expect(screen.getByText("GOL")).toBeOnTheScreen();
    expect(screen.getByText("Ouro")).toBeOnTheScreen();
    expect(screen.getByText("12")).toBeOnTheScreen();
    expect(screen.getByText("7")).toBeOnTheScreen();
    expect(screen.getByText("Jogos")).toBeOnTheScreen();
  });

  it("renders a compact roster row with overall, abbreviation and name", () => {
    render(<PlayerCard name="Carla Dias" position="campo_lateral" overall={76} variant="compact" />);

    expect(screen.getByText("76")).toBeOnTheScreen();
    expect(screen.getByText("LAT")).toBeOnTheScreen();
    expect(screen.getByText("Carla Dias")).toBeOnTheScreen();
  });

  it("fires onPress when tapped", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    render(
      <PlayerCard
        name="Dani Rocha"
        position="campo_ala_volante"
        overall={70}
        variant="compact"
        onPress={onPress}
      />,
    );

    await user.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
