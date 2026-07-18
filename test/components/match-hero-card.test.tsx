import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { MatchHeroCard, type HeroMatch } from "@/components/home/match-hero-card";
import { renderWithProviders } from "../utils/render";

const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return { ...actual, useRouter: jest.fn(() => ({ push: mockPush, navigate: jest.fn(), back: jest.fn() })) };
});

function makeMatch(overrides: Partial<HeroMatch> = {}): HeroMatch {
  return {
    id: "match-1",
    groupId: "g1",
    groupName: "Pelada da Quinta",
    datetime: new Date(Date.now() + 3 * 86_400_000).toISOString(),
    location: "Quadra Central",
    priceCents: 0,
    slots: 10,
    status: "confirmed",
    seriesId: null,
    attendanceStatus: null,
    ...overrides,
  } as HeroMatch;
}

describe("MatchHeroCard", () => {
  beforeEach(() => mockPush.mockClear());

  it("renders group, location and a confirm CTA when attendance is null", () => {
    renderWithProviders(<MatchHeroCard match={makeMatch()} />);
    expect(screen.getByText("Pelada da Quinta")).toBeOnTheScreen();
    expect(screen.getByText("Quadra Central")).toBeOnTheScreen();
    expect(screen.getByText("Confirmar presença")).toBeOnTheScreen();
  });

  it("hides the CTA and shows a confirmed badge when already confirmed", () => {
    renderWithProviders(<MatchHeroCard match={makeMatch({ attendanceStatus: "confirmed" })} />);
    expect(screen.queryByText("Confirmar presença")).toBeNull();
  });

  it("navigates to the match on card press", () => {
    renderWithProviders(<MatchHeroCard match={makeMatch()} />);
    fireEvent.press(screen.getByTestId("match-hero-card"));
    expect(mockPush).toHaveBeenCalledWith({ pathname: "/match/[id]", params: { id: "match-1" } });
  });
});
