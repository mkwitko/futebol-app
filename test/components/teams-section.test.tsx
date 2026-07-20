import { fireEvent, screen } from "@testing-library/react-native";
import { TeamsSection } from "@/components/matches/teams-section";
import { renderWithProviders } from "../utils/render";

const onGenerate = jest.fn();

describe("TeamsSection mode toggle", () => {
  beforeEach(() => onGenerate.mockClear());

  it("defaults to balanced and sends balanced on generate", () => {
    renderWithProviders(
      <TeamsSection teams={null} isLoading={false} onGenerate={onGenerate} generating={false} />,
    );

    fireEvent.press(screen.getByTestId("generate-teams-cta"));

    expect(onGenerate).toHaveBeenCalledWith("balanced");
  });

  it("sends random after selecting Sorteio", () => {
    renderWithProviders(
      <TeamsSection teams={null} isLoading={false} onGenerate={onGenerate} generating={false} />,
    );

    fireEvent.press(screen.getByText("Sorteio"));
    fireEvent.press(screen.getByTestId("generate-teams-cta"));

    expect(onGenerate).toHaveBeenCalledWith("random");
  });
});
