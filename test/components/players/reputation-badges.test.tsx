import { render, screen } from "@testing-library/react-native";
import { ReputationBadges } from "@/components/players/reputation-badges";

describe("ReputationBadges", () => {
  it("renders a badge with the label and count for each dimension with count > 0", () => {
    render(
      <ReputationBadges reputation={{ pontualidade: 12, educacao: 0, compromisso: 9, respeito: 0 }} />,
    );

    expect(screen.getByText("Pontual 12×")).toBeOnTheScreen();
    expect(screen.getByText("Comprometido 9×")).toBeOnTheScreen();
    expect(screen.queryByText(/Amigável/)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Respeitoso/)).not.toBeOnTheScreen();
  });

  it("renders nothing when every dimension is zero", () => {
    const { toJSON } = render(
      <ReputationBadges reputation={{ pontualidade: 0, educacao: 0, compromisso: 0, respeito: 0 }} />,
    );

    expect(toJSON()).toBeNull();
  });
});
